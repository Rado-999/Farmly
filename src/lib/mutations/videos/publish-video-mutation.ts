import type { SupabaseClient } from "@supabase/supabase-js";

import { err, ok, type Result } from "@/lib/errors/result";
import {
  verifyProductBelongsToFarmer,
} from "@/lib/videos/queries";
import {
  deleteFarmerVideoFiles,
  getFarmerVideoStoragePaths,
  uploadFarmerVideo,
  uploadVideoPoster,
} from "@/lib/videos/storage";
import { MAX_FILE_MB } from "@/lib/videos/constants";
import type { VideoFormValues } from "@/lib/videos/types";
import {
  type VideoValidationErrorCode,
  validateVideoDuration,
  validateVideoFile,
  validateVideoMetadata,
} from "@/lib/videos/validation";

export type PublishVideoArgs = {
  supabase: SupabaseClient;
  farmerProfileId: string;
  file: File;
  posterBlob: Blob;
  durationSeconds: number;
  values: VideoFormValues;
};

type PublishVideoErrorCode =
  | VideoValidationErrorCode
  | "video.product_unavailable"
  | "video.upload_failed"
  | "video.poster_upload_failed"
  | "video.row_insert_failed"
  | "consistency_error";

export type PublishVideoResult = Result<
  { videoId: string },
  PublishVideoErrorCode
>;

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

function buildPublishVideoIdempotencyKey(args: PublishVideoArgs): string {
  return JSON.stringify({
    farmerProfileId: args.farmerProfileId,
    fileName: args.file.name,
    fileSize: args.file.size,
    fileType: args.file.type,
    fileLastModified: args.file.lastModified,
    posterSize: args.posterBlob.size,
    durationSeconds: Math.round(args.durationSeconds),
    values: {
      title: args.values.title.trim(),
      stage: args.values.stage,
      description: args.values.description.trim(),
      productId: args.values.productId.trim(),
    },
  });
}

async function createDeterministicVideoId(key: string): Promise<string> {
  const encoded = new TextEncoder().encode(key);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", encoded);
  const hex = Array.from(
    new Uint8Array(digest),
    (byte) => byte.toString(16).padStart(2, "0"),
  )
    .join("")
    .slice(0, 32)
    .split("");
  hex[12] = "5";
  hex[16] = ((Number.parseInt(hex[16]!, 16) & 0x3) | 0x8).toString(16);

  return `${hex.slice(0, 8).join("")}-${hex.slice(8, 12).join("")}-${hex.slice(12, 16).join("")}-${hex.slice(16, 20).join("")}-${hex.slice(20, 32).join("")}`;
}

async function removeVideoRow(
  supabase: SupabaseClient,
  farmerProfileId: string,
  videoId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("videos")
    .delete()
    .eq("id", videoId)
    .eq("farmer_id", farmerProfileId);

  return { error: error?.message ?? null };
}

async function upsertVideoRow(
  supabase: SupabaseClient,
  row: {
    id: string;
    farmerId: string;
    title: string;
    description: string | null;
    type: string;
    videoUrl: string;
    posterUrl: string;
    durationSeconds: number;
    productId: string | null;
  },
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("videos").upsert(
    {
      id: row.id,
      farmer_id: row.farmerId,
      title: row.title,
      description: row.description,
      type: row.type,
      video_url: row.videoUrl,
      poster_url: row.posterUrl,
      duration_seconds: row.durationSeconds,
      product_id: row.productId,
    },
    { onConflict: "id" },
  );

  return { error: error?.message ?? null };
}

async function verifyPublishedVideoState(
  supabase: SupabaseClient,
  farmerProfileId: string,
  videoId: string,
  expected: {
    title: string;
    description: string | null;
    type: string;
    durationSeconds: number;
    productId: string | null;
  },
): Promise<{ consistent: boolean; error: string | null }> {
  const [{ data: row, error: rowError }, { data: objects, error: listError }] =
    await Promise.all([
      supabase
        .from("videos")
        .select(
          "id, farmer_id, product_id, title, description, type, video_url, poster_url, duration_seconds",
        )
        .eq("id", videoId)
        .eq("farmer_id", farmerProfileId)
        .maybeSingle(),
      supabase.storage.from("farmer-videos").list(`${farmerProfileId}/${videoId}`),
    ]);

  if (rowError) {
    return { consistent: false, error: rowError.message };
  }

  if (listError) {
    return { consistent: false, error: listError.message };
  }

  if (!row) {
    return { consistent: false, error: null };
  }

  const storedNames = new Set((objects ?? []).map((object) => object.name));
  const { videoPath, posterPath } = getFarmerVideoStoragePaths(
    farmerProfileId,
    videoId,
    "mp4",
  );

  const expectedVideoName = videoPath.split("/").pop();
  const expectedPosterName = posterPath.split("/").pop();

  const matches =
    row.title === expected.title &&
    (row.description ?? null) === expected.description &&
    (row.type ?? null) === expected.type &&
    Math.round(row.duration_seconds ?? 0) === expected.durationSeconds &&
    (row.product_id ?? null) === expected.productId &&
    Boolean(row.video_url) &&
    Boolean(row.poster_url) &&
    Boolean(expectedVideoName && storedNames.has(expectedVideoName)) &&
    Boolean(expectedPosterName && storedNames.has(expectedPosterName));

  return { consistent: matches, error: null };
}

export async function executePublishVideoMutation(
  args: PublishVideoArgs,
): Promise<PublishVideoResult> {
  const fileValidation = validateVideoFile(args.file);

  if (!fileValidation.ok) {
    return err(fileValidation.error.code, fileValidation.error.message);
  }

  const durationValidation = validateVideoDuration(args.durationSeconds);

  if (!durationValidation.ok) {
    return err(durationValidation.error.code, durationValidation.error.message);
  }

  const metadataValidation = validateVideoMetadata(args.values);

  if (!metadataValidation.ok) {
    return err(metadataValidation.error.code, metadataValidation.error.message);
  }

  const productId = args.values.productId.trim() || null;
  const idempotencyKey = buildPublishVideoIdempotencyKey(args);
  const videoId = await createDeterministicVideoId(idempotencyKey);

  if (productId) {
    const accessResult = await verifyProductBelongsToFarmer(
      args.supabase,
      args.farmerProfileId,
      productId,
    );

    if (!accessResult.ok) {
      return err("video.product_unavailable", accessResult.error.message);
    }

    if (!accessResult.data.allowed) {
      return err("video.product_unavailable", "Избраният продукт не е наличен.");
    }
  }

  const existingVerification = await verifyPublishedVideoState(
    args.supabase,
    args.farmerProfileId,
    videoId,
    {
      title: args.values.title.trim(),
      description: args.values.description.trim() || null,
      type: args.values.stage,
      durationSeconds: Math.round(args.durationSeconds),
      productId,
    },
  );

  if (existingVerification.error) {
    return err("consistency_error", existingVerification.error);
  }

  if (existingVerification.consistent) {
    return ok({ videoId });
  }

  const videoUpload = await uploadFarmerVideo(
    args.supabase,
    args.farmerProfileId,
    videoId,
    args.file,
  );

  if (videoUpload.error || !videoUpload.url) {
    return err(
      "video.upload_failed",
      formatStorageUploadError(videoUpload.error ?? "Не успяхме да качим видеото."),
    );
  }

  const posterUpload = await uploadVideoPoster(
    args.supabase,
    args.farmerProfileId,
    videoId,
    args.posterBlob,
  );

  if (posterUpload.error || !posterUpload.url) {
    const cleanup = await deleteFarmerVideoFiles(
      args.supabase,
      args.farmerProfileId,
      videoId,
    );

    if (cleanup.error) {
      return err(
        "consistency_error",
        formatStorageUploadError(
          posterUpload.error ?? "Не успяхме да качим миниатюрата.",
        ),
      );
    }

    return err(
      "video.poster_upload_failed",
      formatStorageUploadError(
        posterUpload.error ?? "Не успяхме да качим миниатюрата.",
      ),
    );
  }

  const insertResult = await upsertVideoRow(args.supabase, {
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
    const cleanupFiles = await deleteFarmerVideoFiles(
      args.supabase,
      args.farmerProfileId,
      videoId,
    );

    if (cleanupFiles.error) {
      return err("consistency_error", insertResult.error);
    }

    return err("video.row_insert_failed", insertResult.error);
  }

  const verification = await verifyPublishedVideoState(
    args.supabase,
    args.farmerProfileId,
    videoId,
    {
      title: args.values.title.trim(),
      description: args.values.description.trim() || null,
      type: args.values.stage,
      durationSeconds: Math.round(args.durationSeconds),
      productId,
    },
  );

  if (verification.error || !verification.consistent) {
    const [cleanupRow, cleanupFiles] = await Promise.all([
      removeVideoRow(args.supabase, args.farmerProfileId, videoId),
      deleteFarmerVideoFiles(args.supabase, args.farmerProfileId, videoId),
    ]);

    if (cleanupRow.error || cleanupFiles.error) {
      return err("consistency_error", "Не успяхме да качим видеото.");
    }

    return err("consistency_error", "Не успяхме да качим видеото.");
  }

  return ok({ videoId });
}
