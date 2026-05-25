import type { Metadata } from "next";

import { DiscoverFeedMode } from "@/components/discover/discover-feed-mode";
import { DiscoverPage } from "@/components/discover/discover-page";
import { getDiscoverVillageData } from "@/lib/discover/queries";
import { createServerSupabaseClientOrThrow } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Farmly | Разходка из селото",
  description:
    "Спокойна дигитална провинция — ферми, полски филми, сезонни моменти и истински хора. Без каталог, с любопитство.",
};

export default async function DiscoverRoute() {
  const supabase = await createServerSupabaseClientOrThrow();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return <DiscoverFeedMode userId={user.id} />;
  }

  const { farmers, moments, films, whispers, neighbourhoods, snapshot } =
    await getDiscoverVillageData();

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
