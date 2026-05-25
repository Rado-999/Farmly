import "server-only";

import { unstable_cache } from "next/cache";

import {
  createFarmerImage,
  formatLocation,
  formatSeason,
  formatVideoType,
} from "@/lib/data/formatters";
import { formatDurationSeconds } from "@/lib/videos/format-duration";
import {
  FARMER_PROFILE_SELECT,
  getFarmerRowAvatarUrl,
  getFarmerRowName,
} from "@/lib/farmers/farmer-profile-row";
import type {
  FarmerPreview,
  FarmerStory,
  SeasonalProduct,
} from "@/lib/landing/types";
import type { FarmerProfileRow } from "@/lib/supabase/database.types";
import { createServerPublicSupabaseClientOrThrow } from "@/lib/supabase/server";

const REVALIDATE_SECONDS = 60;

function getSupabaseOrThrow() {
  return createServerPublicSupabaseClientOrThrow();
}

type LinkedFarmerRow = {
  location: string | null;
  region: string | null;
  display_name: string | null;
  public_display_name: string | null;
};

type FarmerCategoryRow = {
  farmer_id: string | null;
  category: string | null;
};

function getLinkedFarmerName(farmer: LinkedFarmerRow | null): string {
  if (!farmer) {
    return "Local farmer";
  }

  return (
    farmer.public_display_name?.trim() ||
    farmer.display_name?.trim() ||
    "Local farmer"
  );
}

async function loadLatestProductCategories(
  farmerIds: string[],
): Promise<Map<string, string>> {
  if (farmerIds.length === 0) {
    return new Map();
  }

  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase
    .from("products")
    .select("farmer_id, category, created_at")
    .in("farmer_id", farmerIds)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const categories = new Map<string, string>();

  for (const row of (data ?? []) as FarmerCategoryRow[]) {
    if (!row.farmer_id || !row.category || categories.has(row.farmer_id)) {
      continue;
    }

    categories.set(row.farmer_id, row.category);
  }

  return categories;
}

async function fetchFeaturedFarmers(): Promise<FarmerPreview[]> {
  const supabase = getSupabaseOrThrow();

  const { data, error } = await supabase
    .from("farmer_profiles")
    .select(FARMER_PROFILE_SELECT)
    .eq("listing_profile_complete", true)
    .order("created_at", { ascending: true })
    .limit(3);

  if (error) {
    throw new Error(error.message);
  }

  const farmers = (data ?? []) as FarmerProfileRow[];
  const categoriesByFarmer = await loadLatestProductCategories(
    farmers.map((farmer) => farmer.id),
  );

  return farmers.map((farmer) => {
    const name = getFarmerRowName(farmer);
    const specialty =
      categoriesByFarmer.get(farmer.id) ??
      farmer.philosophy ??
      "Seasonal local produce";

    const image = createFarmerImage(
      `${name} profile`,
      getFarmerRowAvatarUrl(farmer) ?? farmer.cover_image_url,
      farmer.id,
    );

    return {
      id: farmer.slug,
      name,
      location: formatLocation(farmer.location, farmer.region),
      story: farmer.story ?? farmer.bio ?? "",
      specialty,
      imageUrl: image.imageUrl,
      gradientFrom: image.gradientFrom,
      gradientTo: image.gradientTo,
    };
  });
}

export const getFeaturedFarmers = unstable_cache(
  fetchFeaturedFarmers,
  ["landing-featured-farmers"],
  { revalidate: REVALIDATE_SECONDS },
);

async function fetchSeasonalProducts(): Promise<SeasonalProduct[]> {
  const supabase = getSupabaseOrThrow();

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, title, description, season, images, farmer_profiles ( slug, location, region, display_name, public_display_name )",
    )
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(8);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((product) => {
    const farmer = Array.isArray(product.farmer_profiles)
      ? product.farmer_profiles[0]
      : product.farmer_profiles;
    const image = createFarmerImage(
      product.title,
      product.images?.[0],
      product.id,
    );

    const linkedFarmer = farmer as (LinkedFarmerRow & { slug?: string }) | null;

    return {
      id: product.id,
      name: product.title,
      season: formatSeason(product.season),
      farmerName: getLinkedFarmerName(linkedFarmer),
      farmerSlug: linkedFarmer?.slug ?? "",
      note: product.description ?? "",
      imageUrl: image.imageUrl,
      gradientFrom: image.gradientFrom,
      gradientTo: image.gradientTo,
    };
  });
}

export const getSeasonalProducts = unstable_cache(
  fetchSeasonalProducts,
  ["landing-seasonal-products"],
  { revalidate: REVALIDATE_SECONDS },
);

async function fetchFarmerStories(): Promise<FarmerStory[]> {
  const supabase = getSupabaseOrThrow();

  const { data, error } = await supabase
    .from("videos")
    .select(
      "id, title, description, type, video_url, poster_url, duration_seconds, farmer_profiles ( location, region, display_name, public_display_name )",
    )
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((video) => {
    const farmer = Array.isArray(video.farmer_profiles)
      ? video.farmer_profiles[0]
      : video.farmer_profiles;
    const linkedFarmer = farmer as LinkedFarmerRow | null;
    const image = createFarmerImage(
      video.title ?? "Farm story",
      video.poster_url ?? null,
      video.id,
    );

    return {
      id: video.id,
      title: video.title ?? "Farm story",
      farmerName: getLinkedFarmerName(linkedFarmer),
      location:
        linkedFarmer?.location ?? linkedFarmer?.region ?? "Bulgaria",
      duration:
        video.duration_seconds != null
          ? formatDurationSeconds(video.duration_seconds)
          : formatVideoType(video.type),
      description: video.description ?? "",
      videoUrl: video.video_url,
      imageUrl: image.imageUrl,
      gradientFrom: image.gradientFrom,
      gradientTo: image.gradientTo,
    };
  });
}

export const getFarmerStories = unstable_cache(
  fetchFarmerStories,
  ["landing-farmer-stories"],
  { revalidate: REVALIDATE_SECONDS },
);
