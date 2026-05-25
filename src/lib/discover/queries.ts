import "server-only";

import { unstable_cache } from "next/cache";

import {
  createFarmerImage,
  formatLocation,
  formatSeason,
  formatVideoStage,
  mapVideoStage,
} from "@/lib/data/formatters";
import type {
  VillageFarmer,
  VillageFilm,
  VillageMoment,
  VillageNeighbourhood,
  VillageSnapshot,
  VillageWhisper,
} from "@/lib/discover/types";
import {
  FARMER_PROFILE_SELECT,
  getFarmerRowAvatarUrl,
  getFarmerRowName,
} from "@/lib/farmers/farmer-profile-row";
import { formatDurationSeconds } from "@/lib/videos/format-duration";
import type { FarmerProfileRow } from "@/lib/supabase/database.types";
import { createServerPublicSupabaseClientOrThrow } from "@/lib/supabase/server";

const REVALIDATE_SECONDS = 60;

function getSupabaseOrThrow() {
  return createServerPublicSupabaseClientOrThrow();
}

type LinkedFarmerRow = {
  id: string;
  slug: string;
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
    return "Местен производител";
  }

  return (
    farmer.public_display_name?.trim() ||
    farmer.display_name?.trim() ||
    "Местен производител"
  );
}

function mapFarmerRow(
  farmer: FarmerProfileRow,
  categoriesByFarmer: Map<string, string>,
  specialtyFallback?: string,
): VillageFarmer {
  const name = getFarmerRowName(farmer);

  const specialty =
    categoriesByFarmer.get(farmer.id) ??
    specialtyFallback ??
    farmer.philosophy ??
    "Сезонно отглеждане";

  const image = createFarmerImage(
    `${name} profile`,
    getFarmerRowAvatarUrl(farmer) ?? farmer.cover_image_url,
    farmer.id,
  );

  return {
    slug: farmer.slug,
    farmerId: farmer.id,
    name,
    location: formatLocation(farmer.location, farmer.region),
    region: farmer.region,
    story: farmer.story ?? farmer.bio ?? "",
    philosophy: farmer.philosophy,
    specialty,
    imageUrl: image.imageUrl,
    gradientFrom: image.gradientFrom,
    gradientTo: image.gradientTo,
  };
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

async function fetchVillageFarmers(): Promise<VillageFarmer[]> {
  const supabase = getSupabaseOrThrow();

  const { data, error } = await supabase
    .from("farmer_profiles")
    .select(FARMER_PROFILE_SELECT)
    .eq("listing_profile_complete", true)
    .order("created_at", { ascending: true })
    .limit(16);

  if (error) {
    throw new Error(error.message);
  }

  const farmers = (data ?? []) as FarmerProfileRow[];
  const categoriesByFarmer = await loadLatestProductCategories(
    farmers.map((farmer) => farmer.id),
  );

  return farmers.map((farmer) => mapFarmerRow(farmer, categoriesByFarmer));
}

export const getVillageFarmers = unstable_cache(
  fetchVillageFarmers,
  ["discover-village-farmers"],
  { revalidate: REVALIDATE_SECONDS },
);

async function fetchVillageMoments(): Promise<VillageMoment[]> {
  const supabase = getSupabaseOrThrow();

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, title, description, season, images, farmer_profiles ( slug, location, region, display_name, public_display_name )",
    )
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((product) => {
    const farmer = Array.isArray(product.farmer_profiles)
      ? product.farmer_profiles[0]
      : product.farmer_profiles;
    const linkedFarmer = farmer as (LinkedFarmerRow & { slug?: string }) | null;
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
      farmerName: getLinkedFarmerName(linkedFarmer),
      farmerSlug: linkedFarmer?.slug ?? "",
      imageUrl: image.imageUrl,
      gradientFrom: image.gradientFrom,
      gradientTo: image.gradientTo,
    };
  });
}

export const getVillageMoments = unstable_cache(
  fetchVillageMoments,
  ["discover-village-moments"],
  { revalidate: REVALIDATE_SECONDS },
);

async function fetchVillageFilms(): Promise<VillageFilm[]> {
  const supabase = getSupabaseOrThrow();

  const { data, error } = await supabase
    .from("videos")
    .select(
      "id, title, description, type, video_url, poster_url, duration_seconds, farmer_profiles ( id, slug, location, region, display_name, public_display_name )",
    )
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((video) => {
    const farmer = Array.isArray(video.farmer_profiles)
      ? video.farmer_profiles[0]
      : video.farmer_profiles;
    const linkedFarmer = farmer as LinkedFarmerRow | null;
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
      farmerName: getLinkedFarmerName(linkedFarmer),
      farmerSlug: linkedFarmer?.slug ?? "",
      farmerId: linkedFarmer?.id ?? "",
      location:
        linkedFarmer?.location ?? linkedFarmer?.region ?? "България",
      videoUrl: video.video_url,
      imageUrl: image.imageUrl,
      gradientFrom: image.gradientFrom,
      gradientTo: image.gradientTo,
    };
  });
}

export const getVillageFilms = unstable_cache(
  fetchVillageFilms,
  ["discover-village-films"],
  { revalidate: REVALIDATE_SECONDS },
);

function buildWhispers(farmers: VillageFarmer[]): VillageWhisper[] {
  return farmers
    .filter((farmer) => farmer.philosophy?.trim() || farmer.story?.trim())
    .slice(0, 8)
    .map((farmer) => ({
      id: `whisper-${farmer.farmerId}`,
      text: (farmer.philosophy ?? farmer.story).trim(),
      farmerName: farmer.name,
      farmerSlug: farmer.slug,
      farmerId: farmer.farmerId,
      location: farmer.location,
    }));
}

function buildNeighbourhoods(farmers: VillageFarmer[]): VillageNeighbourhood[] {
  const byRegion = new Map<string, VillageFarmer[]>();

  for (const farmer of farmers) {
    const key = farmer.region?.trim() || farmer.location.split(",")[0]?.trim() || "Около нас";
    const group = byRegion.get(key) ?? [];
    group.push(farmer);
    byRegion.set(key, group);
  }

  return [...byRegion.entries()]
    .filter(([, group]) => group.length > 0)
    .map(([label, group]) => ({
      id: label.toLowerCase().replace(/\s+/g, "-"),
      label,
      description:
        group.length === 1
          ? `${group[0].name} споделя живота си оттук.`
          : `${group.length} ферми по този път — всеки със свой ритъм и сезон.`,
      farmers: group,
    }))
    .slice(0, 5);
}

export function buildVillageSnapshot(
  farmers: VillageFarmer[],
  films: VillageFilm[],
  moments: VillageMoment[],
  neighbourhoods: VillageNeighbourhood[],
): VillageSnapshot {
  return {
    farmerCount: farmers.length,
    filmCount: films.length,
    momentCount: moments.length,
    regionCount: neighbourhoods.length,
  };
}

export async function getDiscoverVillageData() {
  const [farmers, moments, films] = await Promise.all([
    getVillageFarmers(),
    getVillageMoments(),
    getVillageFilms(),
  ]);

  const whispers = buildWhispers(farmers);
  const neighbourhoods = buildNeighbourhoods(farmers);
  const snapshot = buildVillageSnapshot(
    farmers,
    films,
    moments,
    neighbourhoods,
  );

  return {
    farmers,
    moments,
    films,
    whispers,
    neighbourhoods,
    snapshot,
  };
}
