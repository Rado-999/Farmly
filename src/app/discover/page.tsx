import type { Metadata } from "next";

import { DiscoverFeedMode } from "@/components/discover/discover-feed-mode";
import { DiscoverPage } from "@/components/discover/discover-page";
import { getOptionalServerViewerContext } from "@/lib/auth/server";
import {
  buildVillageSnapshot,
  getDiscoverVillageData,
  loadDiscoverFeedModeData,
} from "@/lib/discover/queries";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

const emptyDiscoverData = {
  farmers: [],
  moments: [],
  films: [],
  whispers: [],
  neighbourhoods: [],
  snapshot: buildVillageSnapshot([], [], [], []),
};

export const metadata: Metadata = {
  title: "Farmly | Разходка из селото",
  description:
    "Спокойна дигитална провинция — ферми, полски филми, сезонни моменти и истински хора. Без каталог, с любопитство.",
};

export default async function DiscoverRoute() {
  const viewerContext = await getOptionalServerViewerContext();

  if (viewerContext) {
    const feedResult = await loadDiscoverFeedModeData(
      viewerContext.supabase,
      viewerContext.user.id,
      viewerContext.profile
        ? {
            lastVisitedAt: viewerContext.profile.villageLastVisitedAt,
            region: viewerContext.profile.region,
          }
        : undefined,
    );

    if (!feedResult.ok) {
      throw new Error(feedResult.error.message);
    }

    return <DiscoverFeedMode initialData={feedResult.data} />;
  }

  if (!getSupabasePublicEnv()) {
    return <DiscoverPage {...emptyDiscoverData} />;
  }

  const result = await getDiscoverVillageData();

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  const { farmers, moments, films, whispers, neighbourhoods, snapshot } =
    result.data;

  return (
    <DiscoverPage
      farmers={farmers}
      moments={moments}
      films={films}
      whispers={whispers}
      neighbourhoods={neighbourhoods}
      snapshot={snapshot}
    />
  );
}
