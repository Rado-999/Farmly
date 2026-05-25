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
import { createSupabaseClient } from "@/lib/supabase";

function getSupabaseOrThrow() {
  const supabase = createSupabaseClient();

  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local.",
    );
  }

  return supabase;
}

type LinkedFarmerRow = {
  id: string;
  slug: string;
  location: string | null;
  region: string | null;
  display_name: string | null;
  public_display_name: string | null;
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

async function mapFarmerRow(
  farmer: FarmerProfileRow,
  specialtyFallback?: string,
): Promise<VillageFarmer> {
  const supabase = getSupabaseOrThrow();
  const name = getFarmerRowName(farmer);

  const { data: products } = await supabase
    .from("products")
    .select("category")
    .eq("farmer_id", farmer.id)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(1);

  const specialty =
    products?.[0]?.category ??
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

  return Promise.all(farmers.map((farmer) => mapFarmerRow(farmer)));
}

export const getVillageFarmers = unstable_cache(
  fetchVillageFarmers,
  ["discover-village-farmers"],
  { revalidate: 60 },
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
  { revalidate: 60 },
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
  { revalidate: 60 },
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
