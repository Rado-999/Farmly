import type { Metadata } from "next";

import { FarmerCard } from "@/components/farmers/farmer-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSection } from "@/components/ui/page-section";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { RevealStagger } from "@/components/ui/reveal-stagger";
import { SectionHeading } from "@/components/ui/section-heading";
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
      "Отворете профил, за да следвате полски бележки, видеа и историята зад всяка жътва.",
      "Open a profile to follow field notes, videos, and the story behind every harvest.",
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
                  "Запознай се с хората зад сезона",
                  "Meet the growers behind the season",
                )}
                description={translate(
                  locale,
                  "Отворете профил, за да следвате полски бележки, видеа и историята зад всяка жътва.",
                  "Open a profile to follow field notes, videos, and the story behind each harvest.",
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

  const farmersResult = await listFarmers();

  if (!farmersResult.ok) {
    throw new Error(farmersResult.error.message);
  }

  const farmers = farmersResult.data;

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
                "Запознай се с хората зад сезона",
                "Meet the growers behind the season",
              )}
              description={translate(
                locale,
                "Отворете профил, за да следвате полски бележки, видеа и историята зад всяка жътва.",
                "Open a profile to follow field notes, videos, and the story behind each harvest.",
              )}
            />
          </RevealOnScroll>

          {farmers.length === 0 ? (
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
          ) : (
            <RevealStagger className="content-after-head grid-cards md:grid-cols-2 xl:grid-cols-3">
            {farmers.map((farmer) => (
              <FarmerCard
                key={farmer.id}
                href={`/farmers/${farmer.id}`}
                name={farmer.name}
                location={farmer.location}
                description={farmer.bio}
                imageUrl={farmer.profileImage.imageUrl}
                gradientFrom={farmer.profileImage.gradientFrom}
                gradientTo={farmer.profileImage.gradientTo}
                linkLabel={translate(locale, "Виж профила", "View profile")}
                surface="white"
              />
            ))}
            </RevealStagger>
          )}
        </div>
      </PageSection>
    </main>
  );
}
