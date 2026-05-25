import { VillageEntrance } from "@/components/discover/village-entrance";
import { VillageFeed } from "@/components/discover/village-feed";
import { VillageNeighbourhoods } from "@/components/discover/village-neighbourhoods";
import { VillagePathNav } from "@/components/discover/village-path-nav";
import { VillageRing } from "@/components/discover/village-ring";
import { VillageWander } from "@/components/discover/village-wander";
import { buildVillageFeed } from "@/lib/discover/feed";
import type {
  VillageFarmer,
  VillageFilm,
  VillageMoment,
  VillageNeighbourhood,
  VillageSnapshot,
  VillageWhisper,
} from "@/lib/discover/types";

type DiscoverPageProps = {
  farmers: VillageFarmer[];
  moments: VillageMoment[];
  films: VillageFilm[];
  whispers: VillageWhisper[];
  neighbourhoods: VillageNeighbourhood[];
  snapshot: VillageSnapshot;
};

export function DiscoverPage({
  farmers,
  moments,
  films,
  whispers,
  neighbourhoods,
  snapshot,
}: DiscoverPageProps) {
  const feedItems = buildVillageFeed({ films, moments, whispers });

  return (
    <main className="flex-1 bg-cream">
      <VillageEntrance snapshot={snapshot} />
      <VillagePathNav />
      <VillageRing farmers={farmers} />
      <VillageFeed items={feedItems} />
      <VillageNeighbourhoods neighbourhoods={neighbourhoods} />
      <VillageWander farmers={farmers} />
    </main>
  );
}
