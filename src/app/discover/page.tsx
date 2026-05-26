import type { Metadata } from "next";

import { DiscoverFeedMode } from "@/components/discover/discover-feed-mode";
import { DiscoverPage } from "@/components/discover/discover-page";
import { getOptionalServerViewerContext } from "@/lib/auth/server";
import { getServerLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";
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

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();

  return {
    title: translate(locale, "Farmly | Разходка из селото", "Farmly | A walk through the village"),
    description: translate(
      locale,
      "Спокойна дигитална провинция — ферми, полски филми, сезонни моменти и истински хора. Без каталог, с любопитство.",
      "A calm digital countryside with farms, field films, seasonal moments, and real people. No catalog, just curiosity.",
    ),
  };
}

export default async function DiscoverRoute() {
  const locale = await getServerLocale();
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
    return <DiscoverPage locale={locale} {...emptyDiscoverData} />;
  }

  const result = await getDiscoverVillageData();

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  const { farmers, moments, films, whispers, neighbourhoods, snapshot } =
    result.data;

  return (
    <DiscoverPage
      locale={locale}
      farmers={farmers}
      moments={moments}
      films={films}
      whispers={whispers}
      neighbourhoods={neighbourhoods}
      snapshot={snapshot}
    />
  );
}
