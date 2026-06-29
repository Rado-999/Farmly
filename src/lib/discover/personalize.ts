import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  VillageFarmer,
  VillageFilm,
  VillageMoment,
  VillageNeighbourhood,
} from "@/lib/discover/types";
import { getProductCategoryLabel } from "@/lib/products/constants";

const RING_FARMER_LIMIT = 16;
const FILM_LIMIT = 10;
const MOMENT_LIMIT = 10;

export type DiscoverSignals = {
  excludeFarmerIds: Set<string>;
  userRegion: string | null;
  interestCategories: Set<string>;
  interestLabels: string[];
  relatedRegions: Set<string>;
  followCount: number;
};

export type DiscoverPersonalization = {
  isAuthenticated: true;
  userRegion: string | null;
  interestLabels: string[];
  followCount: number;
  hasVillageHome: boolean;
};

function normalizeRegion(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function scoreFarmer(
  farmer: VillageFarmer,
  signals: DiscoverSignals,
  categoryByFarmer: Map<string, string>,
): number {
  let score = 0;
  const farmerRegion = normalizeRegion(farmer.region);
  const category = categoryByFarmer.get(farmer.farmerId);

  if (signals.userRegion && farmerRegion === signals.userRegion) {
    score += 50;
  }

  if (farmerRegion && signals.relatedRegions.has(farmerRegion)) {
    score += 25;
  }

  if (category && signals.interestCategories.has(category)) {
    score += 40;
  }

  return score;
}

function compareFarmers(
  left: VillageFarmer,
  right: VillageFarmer,
  leftScore: number,
  rightScore: number,
): number {
  if (rightScore !== leftScore) {
    return rightScore - leftScore;
  }

  return left.name.localeCompare(right.name, "bg");
}

export async function loadDiscoverSignals(
  supabase: SupabaseClient,
  userId: string,
  userRegion: string | null,
): Promise<DiscoverSignals> {
  const { data: followRows } = await supabase
    .from("follows")
    .select("farmer_id")
    .eq("user_id", userId);

  const excludeFarmerIds = new Set<string>();
  const relatedRegions = new Set<string>();

  for (const row of followRows ?? []) {
    if (row.farmer_id) {
      excludeFarmerIds.add(row.farmer_id);
    }
  }

  const relationshipFarmerIds = [...excludeFarmerIds];

  if (relationshipFarmerIds.length === 0) {
    return {
      excludeFarmerIds,
      userRegion: normalizeRegion(userRegion),
      interestCategories: new Set(),
      interestLabels: [],
      relatedRegions,
      followCount: followRows?.length ?? 0,
    };
  }

  const [{ data: farmerRows }, { data: productRows }] = await Promise.all([
    supabase
      .from("farmer_profiles")
      .select("id, region")
      .in("id", relationshipFarmerIds),
    supabase
      .from("products")
      .select("farmer_id, category, created_at")
      .in("farmer_id", relationshipFarmerIds)
      .eq("status", "published")
      .order("created_at", { ascending: false }),
  ]);

  for (const farmer of farmerRows ?? []) {
    const region = normalizeRegion(farmer.region);
    if (region) {
      relatedRegions.add(region);
    }
  }

  const interestCategories = new Set<string>();

  for (const product of productRows ?? []) {
    const category = product.category?.trim();
    if (product.farmer_id && category && !interestCategories.has(category)) {
      interestCategories.add(category);
    }
  }

  const interestLabels = [...interestCategories]
    .slice(0, 3)
    .map((category) => getProductCategoryLabel(category));

  return {
    excludeFarmerIds,
    userRegion: normalizeRegion(userRegion),
    interestCategories,
    interestLabels,
    relatedRegions,
    followCount: followRows?.length ?? 0,
  };
}

export function personalizeDiscoverFarmers(
  farmers: VillageFarmer[],
  signals: DiscoverSignals,
  categoryByFarmer: Map<string, string>,
): VillageFarmer[] {
  const unseen = farmers.filter(
    (farmer) => !signals.excludeFarmerIds.has(farmer.farmerId),
  );

  return [...unseen]
    .sort((left, right) =>
      compareFarmers(
        left,
        right,
        scoreFarmer(left, signals, categoryByFarmer),
        scoreFarmer(right, signals, categoryByFarmer),
      ),
    )
    .slice(0, RING_FARMER_LIMIT);
}

function scoreContentRegion(
  region: string | null | undefined,
  signals: DiscoverSignals,
): number {
  const normalized = normalizeRegion(region);
  if (!normalized) {
    return 0;
  }

  if (signals.userRegion && normalized === signals.userRegion) {
    return 20;
  }

  if (signals.relatedRegions.has(normalized)) {
    return 10;
  }

  return 0;
}

export function personalizeDiscoverFilms(
  films: VillageFilm[],
  signals: DiscoverSignals,
  farmerRegionById: Map<string, string | null>,
): VillageFilm[] {
  return films
    .filter((film) => !signals.excludeFarmerIds.has(film.farmerId))
    .sort((left, right) => {
      const leftScore = scoreContentRegion(
        farmerRegionById.get(left.farmerId),
        signals,
      );
      const rightScore = scoreContentRegion(
        farmerRegionById.get(right.farmerId),
        signals,
      );
      return rightScore - leftScore;
    })
    .slice(0, FILM_LIMIT);
}

export function personalizeDiscoverMoments(
  moments: VillageMoment[],
  signals: DiscoverSignals,
  excludeFarmerSlugs: Set<string>,
  farmerRegionBySlug: Map<string, string | null>,
): VillageMoment[] {
  return moments
    .filter((moment) => !excludeFarmerSlugs.has(moment.farmerSlug))
    .sort((left, right) => {
      const leftScore = scoreContentRegion(
        farmerRegionBySlug.get(left.farmerSlug),
        signals,
      );
      const rightScore = scoreContentRegion(
        farmerRegionBySlug.get(right.farmerSlug),
        signals,
      );
      return rightScore - leftScore;
    })
    .slice(0, MOMENT_LIMIT);
}

export function buildPersonalizedNeighbourhoods(
  farmers: VillageFarmer[],
  signals: DiscoverSignals,
): VillageNeighbourhood[] {
  const byRegion = new Map<string, VillageFarmer[]>();

  for (const farmer of farmers) {
    const key =
      farmer.region?.trim() ||
      farmer.location.split(",")[0]?.trim() ||
      "Около нас";
    const group = byRegion.get(key) ?? [];
    group.push(farmer);
    byRegion.set(key, group);
  }

  return [...byRegion.entries()]
    .filter(([, group]) => group.length > 0)
    .sort(([leftLabel], [rightLabel]) => {
      const leftScore =
        signals.userRegion && leftLabel === signals.userRegion
          ? 2
          : signals.relatedRegions.has(leftLabel)
            ? 1
            : 0;
      const rightScore =
        signals.userRegion && rightLabel === signals.userRegion
          ? 2
          : signals.relatedRegions.has(rightLabel)
            ? 1
            : 0;

      if (rightScore !== leftScore) {
        return rightScore - leftScore;
      }

      return leftLabel.localeCompare(rightLabel, "bg");
    })
    .map(([label, group]) => ({
      id: label.toLowerCase().replace(/\s+/g, "-"),
      label,
      description:
        group.length === 1
          ? `${group[0].name} е от тук.`
          : `${group.length} ферми в този район.`,
      farmers: group,
    }))
    .slice(0, 5);
}

export function toDiscoverPersonalization(
  signals: DiscoverSignals,
): DiscoverPersonalization {
  return {
    isAuthenticated: true,
    userRegion: signals.userRegion,
    interestLabels: signals.interestLabels,
    followCount: signals.followCount,
    hasVillageHome: signals.followCount > 0,
  };
}
