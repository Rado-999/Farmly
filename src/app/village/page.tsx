import type { Metadata } from "next";

import { VillageView } from "@/components/village/village-view";
import { VILLAGE_PATH } from "@/lib/auth/constants";
import { requireServerUser } from "@/lib/auth/server";
import { getServerLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";
import { loadVillagePageData } from "@/lib/village/load-village";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();

  return {
    title: translate(locale, "Моето село | Farmly", "My village | Farmly"),
    description: translate(
      locale,
      "Върни се при фермерите, които следиш — полски истории, сезонни бележки и спокойно принадлежане.",
      "Return to the farmers you follow for field stories, seasonal notes, and a calm sense of belonging.",
    ),
  };
}

export default async function VillagePage() {
  const locale = await getServerLocale();
  const { supabase, user } = await requireServerUser(VILLAGE_PATH);
  const data = await loadVillagePageData(supabase, user.id);

  return <VillageView initialData={data} locale={locale} />;
}
