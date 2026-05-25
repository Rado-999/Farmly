import type { Metadata } from "next";

import { DiscoverPageShell } from "@/components/discover/discover-page-shell";
import { getDiscoverVillageData } from "@/lib/discover/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Farmly | Разходка из селото",
  description:
    "Спокойна дигитална провинция — ферми, полски филми, сезонни моменти и истински хора. Без каталог, с любопитство.",
};

export default async function DiscoverRoute() {
  const { farmers, moments, films, whispers, neighbourhoods, snapshot } =
    await getDiscoverVillageData();

  return (
    <DiscoverPageShell
      farmers={farmers}
      moments={moments}
      films={films}
      whispers={whispers}
      neighbourhoods={neighbourhoods}
      snapshot={snapshot}
    />
  );
}
