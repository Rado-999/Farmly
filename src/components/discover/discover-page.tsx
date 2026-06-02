import { DiscoverVillageCallout } from "@/components/discover/discover-village-callout";
import { VillageEntrance } from "@/components/discover/village-entrance";
import { VillageFeed } from "@/components/discover/village-feed";
import { VillageNeighbourhoods } from "@/components/discover/village-neighbourhoods";
import { VillagePathNav } from "@/components/discover/village-path-nav";
import { VillageRing } from "@/components/discover/village-ring";
import { VillageWander } from "@/components/discover/village-wander";
import { buildVillageFeed } from "@/lib/discover/feed";
import type { DiscoverPersonalization } from "@/lib/discover/personalize";
import type { DiscoverVillageData } from "@/lib/discover/types";
import type { Locale } from "@/lib/i18n/config";

type DiscoverPageProps = DiscoverVillageData & {
  locale: Locale;
  personalization?: DiscoverPersonalization;
};

export function DiscoverPage({
  locale,
  farmers,
  moments,
  films,
  whispers,
  neighbourhoods,
  snapshot,
  personalization,
}: DiscoverPageProps) {
  const feedItems = buildVillageFeed({ films, moments, whispers });

  return (
    <main className="flex-1 bg-cream">
      {personalization ? (
        <DiscoverVillageCallout locale={locale} personalization={personalization} />
      ) : null}
      <VillageEntrance
        locale={locale}
        snapshot={snapshot}
        personalization={personalization}
      />
      <VillagePathNav />
      <VillageRing
        farmers={farmers}
        locale={locale}
        personalization={personalization}
      />
      <VillageFeed items={feedItems} locale={locale} />
      <VillageNeighbourhoods
        neighbourhoods={neighbourhoods}
        locale={locale}
        personalization={personalization}
      />
      <VillageWander farmers={farmers} locale={locale} />
    </main>
  );
}
