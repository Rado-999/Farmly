"use client";

import { DiscoverFeedMode } from "@/components/discover/discover-feed-mode";
import { DiscoverPage } from "@/components/discover/discover-page";
import { PageLoadingShell } from "@/components/ui/page-loading-shell";
import { useAuthSession } from "@/lib/auth/use-auth-session";
import type {
  VillageFarmer,
  VillageFilm,
  VillageMoment,
  VillageNeighbourhood,
  VillageSnapshot,
  VillageWhisper,
} from "@/lib/discover/types";

type DiscoverPageShellProps = {
  farmers: VillageFarmer[];
  moments: VillageMoment[];
  films: VillageFilm[];
  whispers: VillageWhisper[];
  neighbourhoods: VillageNeighbourhood[];
  snapshot: VillageSnapshot;
};

export function DiscoverPageShell(props: DiscoverPageShellProps) {
  const auth = useAuthSession();

  if (auth.status === "loading") {
    return <PageLoadingShell />;
  }

  if (auth.status === "authenticated") {
    return <DiscoverFeedMode userId={auth.user.id} />;
  }

  return <DiscoverPage {...props} />;
}
