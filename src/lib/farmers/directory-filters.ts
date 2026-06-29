import type { FarmerDirectoryEntry } from "@/lib/farmers/types";

export type FarmerDirectoryFilters = {
  query: string;
  region: string | null;
  locality: string | null;
  verifiedOnly: boolean;
};

export type FarmerDirectoryFacets = {
  regions: string[];
  localities: string[];
  hasVerified: boolean;
};

function normalize(value: string | null | undefined): string {
  return value?.trim().toLocaleLowerCase("bg") ?? "";
}

export function buildDirectoryFacets(
  farmers: FarmerDirectoryEntry[],
  activeRegion: string | null,
  excludeFarmerProfileId?: string | null,
): FarmerDirectoryFacets {
  const pool = excludeFarmerProfileId
    ? farmers.filter((farmer) => farmer.farmerProfileId !== excludeFarmerProfileId)
    : farmers;

  const regions = [
    ...new Set(
      pool.map((farmer) => farmer.region).filter((value): value is string => Boolean(value)),
    ),
  ].sort((left, right) => left.localeCompare(right, "bg"));

  const localitySource = activeRegion
    ? pool.filter((farmer) => farmer.region === activeRegion)
    : pool;

  const localities = [
    ...new Set(
      localitySource
        .map((farmer) => farmer.locality)
        .filter((value): value is string => Boolean(value)),
    ),
  ].sort((left, right) => left.localeCompare(right, "bg"));

  return {
    regions,
    localities,
    hasVerified: pool.some((farmer) => farmer.isVerified),
  };
}

export function filterFarmerDirectory(
  farmers: FarmerDirectoryEntry[],
  filters: FarmerDirectoryFilters,
  excludeFarmerProfileId?: string | null,
): FarmerDirectoryEntry[] {
  const query = normalize(filters.query);

  return farmers.filter((farmer) => {
    if (
      excludeFarmerProfileId &&
      farmer.farmerProfileId === excludeFarmerProfileId
    ) {
      return false;
    }

    if (filters.verifiedOnly && !farmer.isVerified) {
      return false;
    }

    if (filters.region && farmer.region !== filters.region) {
      return false;
    }

    if (filters.locality && farmer.locality !== filters.locality) {
      return false;
    }

    if (!query) {
      return true;
    }

    const haystack = [
      farmer.name,
      farmer.bio,
      farmer.location,
      farmer.locality,
      farmer.region,
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("bg");

    return haystack.includes(query);
  });
}
