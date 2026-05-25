import type { Metadata } from "next";
import { Suspense } from "react";

import { PageLoadingShell } from "@/components/ui/page-loading-shell";
import { VillageView } from "@/components/village/village-view";

export const metadata: Metadata = {
  title: "Моето село | Farmly",
  description:
    "Върни се при фермерите, които следиш — полски истории, сезонни бележки и спокойно принадлежане.",
};

export default function VillagePage() {
  return (
    <Suspense fallback={<PageLoadingShell />}>
      <VillageView />
    </Suspense>
  );
}
