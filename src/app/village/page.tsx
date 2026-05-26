import type { Metadata } from "next";

import { VillageView } from "@/components/village/village-view";
import { VILLAGE_PATH } from "@/lib/auth/constants";
import { requireServerUser } from "@/lib/auth/server";
import { loadVillagePageData } from "@/lib/village/load-village";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Моето село | Farmly",
  description:
    "Върни се при фермерите, които следиш — полски истории, сезонни бележки и спокойно принадлежане.",
};

export default async function VillagePage() {
  const { supabase, user } = await requireServerUser(VILLAGE_PATH);
  const data = await loadVillagePageData(supabase, user.id);

  return <VillageView initialData={data} />;
}
