import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createVideoRow,
  verifyProductBelongsToFarmer,
} from "@/lib/videos/queries";
import {
  deleteFarmerVideoFiles,
  uploadFarmerVideo,
  uploadVideoPoster,
} from "@/lib/videos/storage";
import { MAX_FILE_MB } from "@/lib/videos/constants";
import type { VideoFormValues } from "@/lib/videos/types";
import {
  validateVideoDuration,
  validateVideoFile,
  validateVideoMetadata,
} from "@/lib/videos/validation";

function formatStorageUploadError(message: string): string {
  const lower = message.toLowerCase();

  if (
    lower.includes("maximum") ||
    lower.includes("size") ||
    lower.includes("too large")
  ) {
    return `Файлът е твърде голям. Максимум ${MAX_FILE_MB} MB (лимит на Supabase Free). Компресирайте видеото и опитайте отново.`;
  }

  return message;
}

type PublishVideoArgs = {
  supabase: SupabaseClient;
  farmerProfileId: string;
  file: File;
  posterBlob: Blob;
  durationSeconds: number;
  values: VideoFormValues;
};

type PublishVideoResult =
  | { ok: true; videoId: string }
  | { ok: false; message: string };

export async function publishVideo(
  args: PublishVideoArgs,
): Promise<PublishVideoResult> {
  const fileValidation = validateVideoFile(args.file);

  if (!fileValidation.ok) {
    return { ok: false, message: fileValidation.message };
  }

  const durationValidation = validateVideoDuration(args.durationSeconds);

  if (!durationValidation.ok) {
    return { ok: false, message: durationValidation.message };
  }

  const metadataValidation = validateVideoMetadata(args.values);

  if (!metadataValidation.ok) {
    return { ok: false, message: metadataValidation.message };
  }

  const productId = args.values.productId.trim() || null;

  if (productId) {
    const belongs = await verifyProductBelongsToFarmer(
      args.supabase,
      args.farmerProfileId,
      productId,
    );

    if (!belongs) {
      return { ok: false, message: "Избраният продукт не е наличен." };
    }
  }

  const videoId = crypto.randomUUID();

  const videoUpload = await uploadFarmerVideo(
    args.supabase,
    args.farmerProfileId,
    videoId,
    args.file,
  );

  if (videoUpload.error || !videoUpload.url) {
    return {
      ok: false,
      message: formatStorageUploadError(
        videoUpload.error ?? "Не успяхме да качим видеото.",
      ),
    };
  }

  const posterUpload = await uploadVideoPoster(
    args.supabase,
    args.farmerProfileId,
    videoId,
    args.posterBlob,
  );

  if (posterUpload.error || !posterUpload.url) {
    await deleteFarmerVideoFiles(
      args.supabase,
      args.farmerProfileId,
      videoId,
    );

    return {
      ok: false,
      message: formatStorageUploadError(
        posterUpload.error ?? "Не успяхме да качим миниатюрата.",
      ),
    };
  }

  const insertResult = await createVideoRow(args.supabase, {
    id: videoId,
    farmerId: args.farmerProfileId,
    title: args.values.title.trim(),
    description: args.values.description.trim() || null,
    type: args.values.stage,
    videoUrl: videoUpload.url,
    posterUrl: posterUpload.url,
    durationSeconds: Math.round(args.durationSeconds),
    productId,
  });

  if (insertResult.error) {
    await deleteFarmerVideoFiles(
      args.supabase,
      args.farmerProfileId,
      videoId,
    );

    return { ok: false, message: insertResult.error };
  }

  return { ok: true, videoId };
}
