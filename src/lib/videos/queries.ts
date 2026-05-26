import type { SupabaseClient } from "@supabase/supabase-js";

import {
  queryAllowed,
  queryDatabaseError,
  queryDenied,
  type QueryAccessResult,
  type QueryResult,
} from "@/lib/errors/query-result";
import { ok } from "@/lib/errors/result";
import { mapVideoStage } from "@/lib/data/formatters";
import { formatDurationSeconds } from "@/lib/videos/format-duration";
import type { FarmerVideoListItem } from "@/lib/videos/types";
import type { VideoRow } from "@/lib/supabase/database.types";

const VIDEO_SELECT =
  "id, farmer_id, product_id, title, description, type, video_url, poster_url, duration_seconds";

type VideoRowWithProduct = VideoRow & {
  products: { title: string } | { title: string }[] | null;
};

export async function listFarmerVideosForManagement(
  supabase: SupabaseClient,
  farmerProfileId: string,
): Promise<QueryResult<FarmerVideoListItem[]>> {
  const { data, error } = await supabase
    .from("videos")
    .select(`${VIDEO_SELECT}, products ( title )`)
    .eq("farmer_id", farmerProfileId)
    .order("created_at", { ascending: false });

  if (error) {
    return queryDatabaseError(error.message);
  }

  return ok(
    ((data ?? []) as VideoRowWithProduct[]).map((video) => {
      const product = Array.isArray(video.products)
        ? video.products[0]
        : video.products;

      return {
        id: video.id,
        title: video.title ?? "Видео история",
        stage: mapVideoStage(video.type),
        durationLabel: formatDurationSeconds(video.duration_seconds),
        description: video.description,
        posterUrl: video.poster_url ?? null,
        videoUrl: video.video_url,
        productId: video.product_id,
        productTitle: product?.title ?? null,
      };
    }),
  );
}

export async function verifyProductBelongsToFarmer(
  supabase: SupabaseClient,
  farmerProfileId: string,
  productId: string,
): Promise<QueryAccessResult<"not_found">> {
  const { data, error } = await supabase
    .from("products")
    .select("id")
    .eq("id", productId)
    .eq("farmer_id", farmerProfileId)
    .maybeSingle();

  if (error) {
    return queryDatabaseError(error.message);
  }

  if (!data?.id) {
    return queryDenied("not_found");
  }

  return queryAllowed();
}

export async function createVideoRow(
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
  const { error } = await supabase.from("videos").insert({
    id: row.id,
    farmer_id: row.farmerId,
    title: row.title,
    description: row.description,
    type: row.type,
    video_url: row.videoUrl,
    poster_url: row.posterUrl,
    duration_seconds: row.durationSeconds,
    product_id: row.productId,
  });

  return { error: error?.message ?? null };
}

export async function deleteVideoRow(
  supabase: SupabaseClient,
  videoId: string,
  farmerProfileId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("videos")
    .delete()
    .eq("id", videoId)
    .eq("farmer_id", farmerProfileId);

  return { error: error?.message ?? null };
}
