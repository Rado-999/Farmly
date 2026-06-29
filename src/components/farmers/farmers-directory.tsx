"use client";

import { useMemo, useState } from "react";

import { FarmerCard } from "@/components/farmers/farmer-card";
import { EmptyState } from "@/components/ui/empty-state";
import { useLocale } from "@/components/i18n/language-provider";
import {
  buildDirectoryFacets,
  filterFarmerDirectory,
  type FarmerDirectoryFilters,
} from "@/lib/farmers/directory-filters";
import type { FarmerDirectoryEntry } from "@/lib/farmers/types";
import { translate } from "@/lib/i18n/translate";

type FarmersDirectoryProps = {
  farmers: FarmerDirectoryEntry[];
  excludeFarmerProfileId?: string | null;
};

const defaultFilters: FarmerDirectoryFilters = {
  query: "",
  region: null,
  locality: null,
  verifiedOnly: false,
};

function FilterChip({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={`inline-flex shrink-0 cursor-pointer items-center rounded-full border px-3.5 py-1.5 text-sm font-medium transition-[background-color,border-color,color] duration-300 ${
        isActive
          ? "border-moss-700/30 bg-moss-700 text-loam-50"
          : "border-stone-300/80 bg-white/80 text-stone-700 hover:border-forest/25 hover:text-forest"
      }`}
    >
      {label}
    </button>
  );
}

export function FarmersDirectory({
  farmers,
  excludeFarmerProfileId = null,
}: FarmersDirectoryProps) {
  const { locale } = useLocale();
  const [filters, setFilters] = useState<FarmerDirectoryFilters>(defaultFilters);

  const facets = useMemo(
    () =>
      buildDirectoryFacets(farmers, filters.region, excludeFarmerProfileId),
    [farmers, filters.region, excludeFarmerProfileId],
  );

  const visibleFarmers = useMemo(
    () => filterFarmerDirectory(farmers, filters, excludeFarmerProfileId),
    [farmers, filters, excludeFarmerProfileId],
  );

  const hasActiveFilters =
    Boolean(filters.query.trim()) ||
    Boolean(filters.region) ||
    Boolean(filters.locality) ||
    filters.verifiedOnly;

  function setRegion(region: string | null) {
    setFilters((current) => ({
      ...current,
      region,
      locality: null,
    }));
  }

  function clearFilters() {
    setFilters(defaultFilters);
  }

  if (farmers.length === 0) {
    return (
      <EmptyState
        title={translate(locale, "Все още няма фермерски профили", "No farmer profiles yet")}
        description={translate(
          locale,
          "Фермерските профили ще се появят тук, след като бъдат добавени в Supabase.",
          "Grower profiles will appear here once they are added in Supabase.",
        )}
      />
    );
  }

  return (
    <div className="content-after-head stack-relaxed">
      <div className="stack-tight">
        <label className="block">
          <span className="sr-only">
            {translate(locale, "Търси фермери", "Search farmers")}
          </span>
          <input
            type="search"
            value={filters.query}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                query: event.target.value,
              }))
            }
            placeholder={translate(
              locale,
              "Търси по име, място или какво отглеждат…",
              "Search by name, place, or what they grow…",
            )}
            className="w-full rounded-2xl border border-stone-300/80 bg-white/90 px-4 py-3 text-base text-stone-900 shadow-[0_12px_32px_-24px_rgba(47,42,36,0.35)] outline-none transition-[border-color,box-shadow] duration-300 placeholder:text-stone-400 focus:border-forest/35 focus:shadow-[0_16px_36px_-22px_rgba(47,42,36,0.28)]"
          />
        </label>

        {facets.regions.length > 0 ? (
          <div className="stack-tight">
            <p className="text-[0.8125rem] font-medium tracking-[0.12em] text-stone-500 uppercase">
              {translate(locale, "Област", "Region")}
            </p>
            <div className="flex flex-wrap gap-2">
              <FilterChip
                label={translate(locale, "Всички области", "All regions")}
                isActive={!filters.region}
                onClick={() => setRegion(null)}
              />
              {facets.regions.map((region) => (
                <FilterChip
                  key={region}
                  label={region}
                  isActive={filters.region === region}
                  onClick={() => setRegion(region)}
                />
              ))}
            </div>
          </div>
        ) : null}

        {filters.region && facets.localities.length > 0 ? (
          <div className="stack-tight">
            <p className="text-[0.8125rem] font-medium tracking-[0.12em] text-stone-500 uppercase">
              {translate(locale, "Населено място", "Town or village")}
            </p>
            <div className="flex flex-wrap gap-2">
              <FilterChip
                label={translate(locale, "Всички", "All")}
                isActive={!filters.locality}
                onClick={() =>
                  setFilters((current) => ({ ...current, locality: null }))
                }
              />
              {facets.localities.map((locality) => (
                <FilterChip
                  key={locality}
                  label={locality}
                  isActive={filters.locality === locality}
                  onClick={() =>
                    setFilters((current) => ({ ...current, locality }))
                  }
                />
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          {facets.hasVerified ? (
            <FilterChip
              label={translate(locale, "Само проверени", "Verified only")}
              isActive={filters.verifiedOnly}
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  verifiedOnly: !current.verifiedOnly,
                }))
              }
            />
          ) : null}
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="story-link cursor-pointer text-sm"
            >
              {translate(locale, "Изчисти филтрите", "Clear filters")}
            </button>
          ) : null}
        </div>
      </div>

      <p className="text-sm text-stone-600">
        {translate(
          locale,
          visibleFarmers.length === 1
            ? "1 фермер"
            : `${visibleFarmers.length} фермери`,
          visibleFarmers.length === 1
            ? "1 farmer"
            : `${visibleFarmers.length} farmers`,
        )}
      </p>

      {visibleFarmers.length === 0 ? (
        <EmptyState
          title={translate(
            locale,
            "Няма фермери с тези филтри",
            "No farmers match these filters",
          )}
          description={translate(
            locale,
            "Опитай друга област, място или по-търсене.",
            "Try another region, town, or search term.",
          )}
        />
      ) : (
        <div className="grid-cards md:grid-cols-2 xl:grid-cols-3">
          {visibleFarmers.map((farmer) => (
            <FarmerCard
              key={farmer.farmerProfileId}
              href={`/farmers/${farmer.id}`}
              name={farmer.name}
              location={farmer.location}
              description={farmer.bio}
              imageUrl={farmer.profileImage.imageUrl}
              gradientFrom={farmer.profileImage.gradientFrom}
              gradientTo={farmer.profileImage.gradientTo}
              linkLabel={translate(locale, "Виж профила", "View profile")}
              highlight={
                farmer.isVerified
                  ? translate(locale, "Проверена ферма", "Verified farm")
                  : undefined
              }
              surface="white"
            />
          ))}
        </div>
      )}
    </div>
  );
}
