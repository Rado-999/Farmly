import {
  createFarmerImage,
  formatLocation,
  formatSeason,
  formatVideoStage,
  mapVideoStage,
} from "@/lib/data/formatters";
import {
  FARMER_PROFILE_SELECT,
  getFarmerRowAvatarUrl,
  getFarmerRowName,
} from "@/lib/farmers/farmer-profile-row";
import { queryDatabaseError, type QueryResult } from "@/lib/errors/query-result";
import { ok } from "@/lib/errors/result";
import type { MyVillageData } from "@/lib/village/types";
import { formatDurationSeconds } from "@/lib/videos/format-duration";
import type { FarmerProfileRow } from "@/lib/supabase/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

type FollowRow = {
  farmer_id: string;
  created_at: string;
  farmer_profiles: FarmerProfileRow | FarmerProfileRow[] | null;
};

function unwrapFarmer(
  row: FollowRow["farmer_profiles"],
): FarmerProfileRow | null {
  if (!row) {
    return null;
  }

  return Array.isArray(row) ? (row[0] ?? null) : row;
}

export async function fetchMyVillageData(
  supabase: SupabaseClient,
  userId: string,
): Promise<QueryResult<MyVillageData>> {
  const { data: followRows, error: followsError } = await supabase
    .from("follows")
    .select(`farmer_id, created_at, farmer_profiles (${FARMER_PROFILE_SELECT})`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (followsError) {
    return queryDatabaseError(followsError.message);
  }

  const follows = (followRows ?? []) as FollowRow[];
  const farmerIds = follows.map((row) => row.farmer_id);

  if (farmerIds.length === 0) {
    return ok({ farmers: [], videos: [], products: [] });
  }

  const farmers = follows
    .map((row) => {
      const farmer = unwrapFarmer(row.farmer_profiles);
      if (!farmer) {
        return null;
      }

      const name = getFarmerRowName(farmer);
      const image = createFarmerImage(
        `${name} profile`,
        getFarmerRowAvatarUrl(farmer) ?? farmer.cover_image_url,
        farmer.id,
      );

      return {
        farmerProfileId: farmer.id,
        slug: farmer.slug,
        name,
        location: formatLocation(farmer.location, farmer.region),
        bio: farmer.bio ?? farmer.story ?? "",
        imageUrl: image.imageUrl,
        gradientFrom: image.gradientFrom,
        gradientTo: image.gradientTo,
        followedAt: row.created_at,
      };
    })
    .filter((farmer): farmer is NonNullable<typeof farmer> => farmer != null);

  const farmerNameById = new Map(
    farmers.map((farmer) => [farmer.farmerProfileId, farmer.name]),
  );
  const farmerSlugById = new Map(
    farmers.map((farmer) => [farmer.farmerProfileId, farmer.slug]),
  );

  const [{ data: videoRows, error: videosError }, { data: productRows, error: productsError }] =
    await Promise.all([
      supabase
        .from("videos")
        .select(
          "id, title, description, type, video_url, poster_url, duration_seconds, farmer_id, created_at",
        )
        .in("farmer_id", farmerIds)
        .order("created_at", { ascending: false })
        .limit(12),
      supabase
        .from("products")
        .select(
          "id, title, description, season, images, farmer_id, created_at",
        )
        .in("farmer_id", farmerIds)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(12),
    ]);

  if (videosError) {
    return queryDatabaseError(videosError.message);
  }

  if (productsError) {
    return queryDatabaseError(productsError.message);
  }

  const videos = (videoRows ?? []).map((video) => {
    const stage = mapVideoStage(video.type);
    const image = createFarmerImage(
      video.title ?? "Полска история",
      video.poster_url ?? null,
      video.id,
    );

    return {
      id: video.id,
      title: video.title ?? "Полска история",
      description: video.description ?? "",
      stage: formatVideoStage(stage),
      duration:
        video.duration_seconds != null
          ? formatDurationSeconds(video.duration_seconds)
          : formatVideoStage(stage),
      farmerName: farmerNameById.get(video.farmer_id ?? "") ?? "Фермер",
      farmerSlug: farmerSlugById.get(video.farmer_id ?? "") ?? "",
      farmerProfileId: video.farmer_id ?? "",
      videoUrl: video.video_url,
      imageUrl: image.imageUrl,
      gradientFrom: image.gradientFrom,
      gradientTo: image.gradientTo,
      createdAt: video.created_at ?? "",
    };
  });

  const products = (productRows ?? []).map((product) => {
    const image = createFarmerImage(
      product.title,
      product.images?.[0],
      product.id,
    );

    return {
      id: product.id,
      title: product.title,
      season: formatSeason(product.season),
      note: product.description ?? "",
      farmerName: farmerNameById.get(product.farmer_id ?? "") ?? "Фермер",
      farmerSlug: farmerSlugById.get(product.farmer_id ?? "") ?? "",
      imageUrl: image.imageUrl,
      gradientFrom: image.gradientFrom,
      gradientTo: image.gradientTo,
      createdAt: product.created_at ?? "",
    };
  });

  return ok({ farmers, videos, products });
}
