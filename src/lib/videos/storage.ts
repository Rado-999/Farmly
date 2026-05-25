import type { SupabaseClient } from "@supabase/supabase-js";

import { FARMER_VIDEOS_BUCKET } from "@/lib/videos/constants";

/**
 * Canonical type so CDN sends inline video; avoids download prompt on missing/wrong MIME.
 */
function resolveUploadContentType(): string {
  return "video/mp4";
}

/** Stored as `.mp4` regardless of picker quirks once file passes validation */
function getStoredVideoExtension(): "mp4" {
  return "mp4";
}

export function getFarmerVideoStoragePaths(
  farmerId: string,
  videoId: string,
  videoExtension: string,
) {
  const base = `${farmerId}/${videoId}`;

  return {
    videoPath: `${base}/video.${videoExtension}`,
    posterPath: `${base}/poster.jpg`,
  };
}

export async function uploadFarmerVideo(
  supabase: SupabaseClient,
  farmerId: string,
  videoId: string,
  file: File,
): Promise<{ url: string | null; error: string | null }> {
  const extension = getStoredVideoExtension();
  const { videoPath } = getFarmerVideoStoragePaths(farmerId, videoId, extension);
  const contentType = resolveUploadContentType();

  const { error: uploadError } = await supabase.storage
    .from(FARMER_VIDEOS_BUCKET)
    .upload(videoPath, file, { upsert: true, contentType });

  if (uploadError) {
    return { url: null, error: uploadError.message };
  }

  const { data } = supabase.storage
    .from(FARMER_VIDEOS_BUCKET)
    .getPublicUrl(videoPath);

  return { url: data.publicUrl, error: null };
}

export async function uploadVideoPoster(
  supabase: SupabaseClient,
  farmerId: string,
  videoId: string,
  posterBlob: Blob,
): Promise<{ url: string | null; error: string | null }> {
  const { posterPath } = getFarmerVideoStoragePaths(
    farmerId,
    videoId,
    getStoredVideoExtension(),
  );

  const { error: uploadError } = await supabase.storage
    .from(FARMER_VIDEOS_BUCKET)
    .upload(posterPath, posterBlob, {
      upsert: true,
      contentType: "image/jpeg",
    });

  if (uploadError) {
    return { url: null, error: uploadError.message };
  }

  const { data } = supabase.storage
    .from(FARMER_VIDEOS_BUCKET)
    .getPublicUrl(posterPath);

  return { url: data.publicUrl, error: null };
}

export async function deleteFarmerVideoFiles(
  supabase: SupabaseClient,
  farmerId: string,
  videoId: string,
): Promise<{ error: string | null }> {
  const prefix = `${farmerId}/${videoId}`;

  const { data: objects, error: listError } = await supabase.storage
    .from(FARMER_VIDEOS_BUCKET)
    .list(`${farmerId}/${videoId}`);

  if (listError) {
    return { error: listError.message };
  }

  if (!objects || objects.length === 0) {
    return { error: null };
  }

  const paths = objects.map((object) => `${prefix}/${object.name}`);

  const { error: removeError } = await supabase.storage
    .from(FARMER_VIDEOS_BUCKET)
    .remove(paths);

  if (removeError) {
    return { error: removeError.message };
  }

  return { error: null };
}
