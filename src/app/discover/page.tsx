import type { Metadata } from "next";

import { DiscoverPage } from "@/components/discover/discover-page";
import { getOptionalServerViewerContext } from "@/lib/auth/server";
import { getServerLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";
import {
  buildVillageSnapshot,
  getDiscoverVillageData,
  loadPersonalizedDiscoverData,
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
      "Разгледай ферми, видеа от полето и сезонни бележки. Без каталог, просто запознаване.",
      "Browse farms, field videos, and seasonal notes. No catalog, just getting to know people.",
    ),
  };
}

export default async function DiscoverRoute() {
  const locale = await getServerLocale();
  const viewerContext = await getOptionalServerViewerContext();

  if (viewerContext) {
    const result = await loadPersonalizedDiscoverData(
      viewerContext.supabase,
      viewerContext.user.id,
      viewerContext.profile?.region ?? null,
    );

    if (!result.ok) {
      throw new Error(result.error.message);
    }

    const { personalization, ...data } = result.data;

    return (
      <DiscoverPage locale={locale} personalization={personalization} {...data} />
    );
  }

  if (!getSupabasePublicEnv()) {
    return <DiscoverPage locale={locale} {...emptyDiscoverData} />;
  }

  const result = await getDiscoverVillageData();

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  return <DiscoverPage locale={locale} {...result.data} />;
}
