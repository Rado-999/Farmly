import "server-only";

import { unstable_cache } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  queryDatabaseError,
  queryNotFound,
  type QueryResult,
} from "@/lib/errors/query-result";
import { ok } from "@/lib/errors/result";
import {
  FARMER_PROFILE_SELECT,
  getFarmerRowAvatarUrl,
  getFarmerRowName,
} from "@/lib/farmers/farmer-profile-row";
import { mapFarmerProfile } from "@/lib/farmers/mappers";
import type {
  FarmerDirectoryEntry,
  FarmerProfile,
  FarmerViewerRelationship,
} from "@/lib/farmers/types";
import { createFarmerImage, formatLocation } from "@/lib/data/formatters";
import type {
  FarmerProfileRow,
  ProductRow,
  ReviewRow,
  VideoRow,
} from "@/lib/supabase/database.types";
import { createServerPublicSupabaseClientOrThrow } from "@/lib/supabase/server";

const REVALIDATE_SECONDS = 60;

function getSupabaseResult(): QueryResult<SupabaseClient> {
  try {
    return ok(createServerPublicSupabaseClientOrThrow());
  } catch (error) {
    return queryDatabaseError(
      error instanceof Error
        ? error.message
        : "Could not create the public Supabase client.",
    );
  }
}

function isFarmerUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

async function getFarmerRow(slugOrId: string): Promise<QueryResult<FarmerProfileRow>> {
  const supabaseResult = getSupabaseResult();

  if (!supabaseResult.ok) {
    return supabaseResult;
  }

  const supabase = supabaseResult.data;
  const column = isFarmerUuid(slugOrId) ? "id" : "slug";

  const { data, error } = await supabase
    .from("farmer_profiles")
    .select(FARMER_PROFILE_SELECT)
    .eq(column, slugOrId)
    .maybeSingle();

  if (error) {
    return queryDatabaseError(error.message);
  }

  if (!data) {
    return queryNotFound("Farmer not found.");
  }

  return ok(data as FarmerProfileRow);
}

async function getFarmerRelations(
  farmerId: string,
): Promise<QueryResult<{ products: ProductRow[]; videos: VideoRow[]; reviews: ReviewRow[] }>> {
  const supabaseResult = getSupabaseResult();

  if (!supabaseResult.ok) {
    return supabaseResult;
  }

  const supabase = supabaseResult.data;

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
    return queryDatabaseError(productsError.message);
  }

  if (videosError) {
    return queryDatabaseError(videosError.message);
  }

  if (reviewsError) {
    return queryDatabaseError(reviewsError.message);
  }

  return ok({
    products: (products ?? []) as ProductRow[],
    videos: (videos ?? []) as VideoRow[],
    reviews: (reviews ?? []) as ReviewRow[],
  });
}

async function fetchFarmerProfile(
  slugOrId: string,
): Promise<QueryResult<FarmerProfile>> {
  const farmerResult = await getFarmerRow(slugOrId);

  if (!farmerResult.ok) {
    return farmerResult;
  }

  const farmer = farmerResult.data;
  const relationsResult = await getFarmerRelations(farmer.id);

  if (!relationsResult.ok) {
    return relationsResult;
  }

  const { products, videos, reviews } = relationsResult.data;

  return ok(mapFarmerProfile(farmer, products, videos, reviews));
}

const getCachedFarmerProfile = unstable_cache(
  fetchFarmerProfile,
  ["farmer-profile"],
  { revalidate: REVALIDATE_SECONDS },
);

export async function getFarmerProfile(
  slugOrId: string,
): Promise<QueryResult<FarmerProfile>> {
  return getCachedFarmerProfile(slugOrId);
}

export async function getFarmerViewerRelationship(
  supabase: SupabaseClient,
  userId: string,
  farmerProfileId: string,
  options?: {
    viewerFarmerProfileId: string | null;
  },
): Promise<QueryResult<FarmerViewerRelationship>> {
  const knownIsSelf = options?.viewerFarmerProfileId === farmerProfileId;
  const [
    { data: selfFarmer, error: selfError },
    { data: followRow, error: followError },
  ] = await Promise.all([
    options
      ? Promise.resolve({
          data: knownIsSelf ? { id: farmerProfileId } : null,
          error: null,
        })
      : supabase
          .from("farmer_profiles")
          .select("id")
          .eq("id", farmerProfileId)
          .eq("profile_id", userId)
          .maybeSingle(),
    knownIsSelf
      ? Promise.resolve({ data: null, error: null })
      : supabase
          .from("follows")
          .select("farmer_id")
          .eq("user_id", userId)
          .eq("farmer_id", farmerProfileId)
          .maybeSingle(),
  ]);

  if (selfError) {
    return queryDatabaseError(selfError.message);
  }

  if (followError) {
    return queryDatabaseError(followError.message);
  }

  const isSelf = options ? knownIsSelf : Boolean(selfFarmer);

  return ok({
    farmerProfileId,
    isFollowing: !isSelf && Boolean(followRow),
    isSelf,
  });
}

async function fetchFarmerSlugs(): Promise<QueryResult<string[]>> {
  const supabaseResult = getSupabaseResult();

  if (!supabaseResult.ok) {
    return supabaseResult;
  }

  const supabase = supabaseResult.data;

  const { data, error } = await supabase
    .from("farmer_profiles")
    .select("slug")
    .order("created_at", { ascending: true });

  if (error) {
    return queryDatabaseError(error.message);
  }

  return ok((data ?? []).map((farmer) => farmer.slug));
}

const getCachedFarmerSlugs = unstable_cache(
  fetchFarmerSlugs,
  ["farmer-slugs"],
  { revalidate: REVALIDATE_SECONDS },
);

export async function getFarmerSlugs(): Promise<QueryResult<string[]>> {
  return getCachedFarmerSlugs();
}

async function fetchFarmerDirectoryEntries(): Promise<QueryResult<FarmerDirectoryEntry[]>> {
  const supabaseResult = getSupabaseResult();

  if (!supabaseResult.ok) {
    return supabaseResult;
  }

  const supabase = supabaseResult.data;

  const { data, error } = await supabase
    .from("farmer_profiles")
    .select(FARMER_PROFILE_SELECT)
    .eq("listing_profile_complete", true)
    .order("created_at", { ascending: true });

  if (error) {
    return queryDatabaseError(error.message);
  }

  const farmers = (data ?? []) as FarmerProfileRow[];

  return ok(
    farmers.map((farmer) => {
      const name = getFarmerRowName(farmer);
      const avatarUrl = getFarmerRowAvatarUrl(farmer);

      return {
        id: farmer.slug,
        farmerProfileId: farmer.id,
        name,
        locality: farmer.location?.trim() || null,
        region: farmer.region?.trim() || null,
        location: formatLocation(farmer.location, farmer.region),
        bio: farmer.bio ?? farmer.story ?? "",
        isVerified: Boolean(farmer.is_verified),
        profileImage: createFarmerImage(`${name} profile`, avatarUrl, farmer.id),
      };
    }),
  );
}

export const listFarmers = unstable_cache(
  fetchFarmerDirectoryEntries,
  ["farmer-directory"],
  { revalidate: REVALIDATE_SECONDS },
);
