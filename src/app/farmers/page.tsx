import type { Metadata } from "next";

import { FarmersDirectory } from "@/components/farmers/farmers-directory";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSection } from "@/components/ui/page-section";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { SectionHeading } from "@/components/ui/section-heading";
import { getOptionalServerViewerContext } from "@/lib/auth/server";
import { listFarmers } from "@/lib/farmers/queries";
import { getServerLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();

  return {
    title: translate(locale, "Farmly | Фермери", "Farmly | Farmers"),
    description: translate(
      locale,
      "Отвори профил, за да видиш видеа, бележки и какво отглеждат.",
      "Open a profile to see their videos, notes, and what they grow.",
    ),
  };
}

export default async function FarmersPage() {
  const locale = await getServerLocale();

  if (!getSupabasePublicEnv()) {
    return (
      <main className="flex-1 bg-cream">
        <PageSection tone="cream">
          <div className="page-shell">
            <RevealOnScroll>
              <SectionHeading
                align="left"
                eyebrow={translate(locale, "Фермери", "Farmers")}
                title={translate(
                  locale,
                  "Българските фермери",
                  "The Bulgarian farmers",
                )}
                description={translate(
                  locale,
                  "Отвори профил, за да видиш видеа, бележки и какво отглеждат.",
                  "Open a profile to see their videos, notes, and what they grow.",
                )}
              />
            </RevealOnScroll>

            <RevealOnScroll className="content-after-head block">
              <EmptyState
                title={translate(locale, "Все още няма фермерски профили", "No farmer profiles yet")}
                description={translate(
                  locale,
                  "Фермерските профили ще се появят тук, след като бъдат добавени в Supabase.",
                  "Grower profiles will appear here once they are added in Supabase.",
                )}
              />
            </RevealOnScroll>
          </div>
        </PageSection>
      </main>
    );
  }

  const [farmersResult, viewerContext] = await Promise.all([
    listFarmers(),
    getOptionalServerViewerContext(),
  ]);

  if (!farmersResult.ok) {
    throw new Error(farmersResult.error.message);
  }

  const excludeFarmerProfileId =
    viewerContext?.profile?.farmerProfile?.id ?? null;

  return (
    <main className="flex-1 bg-cream">
      <PageSection tone="cream">
        <div className="page-shell">
          <RevealOnScroll>
            <SectionHeading
              align="left"
              eyebrow={translate(locale, "Фермери", "Farmers")}
              title={translate(
                locale,
                "Българските фермери",
                "The Bulgarian farmers",
              )}
              description={translate(
                locale,
                "Разгледай по област и място. Отвори профил, за да видиш видеа, бележки и какво отглеждат.",
                "Browse by region and town. Open a profile to see their videos, notes, and what they grow.",
              )}
            />
          </RevealOnScroll>

          <RevealOnScroll>
            <FarmersDirectory
              farmers={farmersResult.data}
              excludeFarmerProfileId={excludeFarmerProfileId}
            />
          </RevealOnScroll>
        </div>
      </PageSection>
    </main>
  );
}
