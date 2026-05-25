import "server-only";

import { unstable_cache } from "next/cache";

import {
  FARMER_PROFILE_SELECT,
  getFarmerRowAvatarUrl,
  getFarmerRowName,
} from "@/lib/farmers/farmer-profile-row";
import { mapFarmerProfile } from "@/lib/farmers/mappers";
import type { FarmerDirectoryEntry, FarmerProfile } from "@/lib/farmers/types";
import { createFarmerImage, formatLocation } from "@/lib/data/formatters";
import type {
  FarmerProfileRow,
  ProductRow,
  ReviewRow,
  VideoRow,
} from "@/lib/supabase/database.types";
import { createServerPublicSupabaseClientOrThrow } from "@/lib/supabase/server";

const REVALIDATE_SECONDS = 60;

function getSupabaseOrThrow() {
  return createServerPublicSupabaseClientOrThrow();
}

function isFarmerUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

async function getFarmerRow(slugOrId: string): Promise<FarmerProfileRow | null> {
  const supabase = getSupabaseOrThrow();
  const column = isFarmerUuid(slugOrId) ? "id" : "slug";

  const { data, error } = await supabase
    .from("farmer_profiles")
    .select(FARMER_PROFILE_SELECT)
    .eq(column, slugOrId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function getFarmerRelations(farmerId: string) {
  const supabase = getSupabaseOrThrow();

  const [{ data: products, error: productsError }, { data: videos, error: videosError }, { data: reviews, error: reviewsError }] =
    await Promise.all([
      supabase
        .from("products")
        .select(
          "id, farmer_id, title, description, price, season, category, images, status, price_unit, published_at",
        )
        .eq("farmer_id", farmerId)
        .eq("status", "published")
        .order("created_at", { ascending: false }),
      supabase
        .from("videos")
        .select(
          "id, farmer_id, product_id, title, description, type, video_url, poster_url, duration_seconds, created_at",
        )
        .eq("farmer_id", farmerId)
        .order("created_at", { ascending: false }),
      supabase
        .from("reviews")
        .select("id, farmer_id, rating, comment, created_at, author_display_name")
        .eq("farmer_id", farmerId)
        .order("created_at", { ascending: false }),
    ]);

  if (productsError) {
    throw new Error(productsError.message);
  }

  if (videosError) {
    throw new Error(videosError.message);
  }

  if (reviewsError) {
    throw new Error(reviewsError.message);
  }

  return {
    products: (products ?? []) as ProductRow[],
    videos: (videos ?? []) as VideoRow[],
    reviews: (reviews ?? []) as ReviewRow[],
  };
}

async function fetchFarmerProfile(
  slugOrId: string,
): Promise<FarmerProfile | null> {
  const farmer = await getFarmerRow(slugOrId);

  if (!farmer) {
    return null;
  }

  const { products, videos, reviews } = await getFarmerRelations(farmer.id);

  return mapFarmerProfile(farmer, products, videos, reviews);
}

const getCachedFarmerProfile = unstable_cache(
  fetchFarmerProfile,
  ["farmer-profile"],
  { revalidate: REVALIDATE_SECONDS },
);

export async function getFarmerProfile(
  slugOrId: string,
): Promise<FarmerProfile | null> {
  return getCachedFarmerProfile(slugOrId);
}

async function fetchFarmerSlugs(): Promise<string[]> {
  const supabase = getSupabaseOrThrow();

  const { data, error } = await supabase
    .from("farmer_profiles")
    .select("slug")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((farmer) => farmer.slug);
}

const getCachedFarmerSlugs = unstable_cache(
  fetchFarmerSlugs,
  ["farmer-slugs"],
  { revalidate: REVALIDATE_SECONDS },
);

export async function getFarmerSlugs(): Promise<string[]> {
  return getCachedFarmerSlugs();
}

async function fetchFarmerDirectoryEntries(): Promise<FarmerDirectoryEntry[]> {
  const supabase = getSupabaseOrThrow();

  const { data, error } = await supabase
    .from("farmer_profiles")
    .select(FARMER_PROFILE_SELECT)
    .eq("listing_profile_complete", true)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const farmers = (data ?? []) as FarmerProfileRow[];

  return farmers.map((farmer) => {
    const name = getFarmerRowName(farmer);
    const avatarUrl = getFarmerRowAvatarUrl(farmer);

    return {
      id: farmer.slug,
      name,
      location: formatLocation(farmer.location, farmer.region),
      bio: farmer.bio ?? farmer.story ?? "",
      profileImage: createFarmerImage(`${name} profile`, avatarUrl, farmer.id),
    };
  });
}

export const listFarmers = unstable_cache(
  fetchFarmerDirectoryEntries,
  ["farmer-directory"],
  { revalidate: REVALIDATE_SECONDS },
);
