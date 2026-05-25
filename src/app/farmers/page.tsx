import type { Metadata } from "next";

import { FarmerCard } from "@/components/farmers/farmer-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSection } from "@/components/ui/page-section";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { RevealStagger } from "@/components/ui/reveal-stagger";
import { SectionHeading } from "@/components/ui/section-heading";
import { listFarmers } from "@/lib/farmers/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Farmly | Фермери",
  description:
    "Отворете профил, за да следвате полски бележки, видеа и историята зад всяка жътва.",
};

export default async function FarmersPage() {
  const farmers = await listFarmers();

  return (
    <main className="flex-1 bg-cream">
      <PageSection tone="cream">
        <div className="page-shell">
          <RevealOnScroll>
            <SectionHeading
              align="left"
              eyebrow="Farmers"
              title="Meet the growers behind the season"
              description="Open a profile to follow field notes, videos, and the story behind each harvest."
            />
          </RevealOnScroll>

          {farmers.length === 0 ? (
            <RevealOnScroll className="content-after-head block">
              <EmptyState
                title="No farmer profiles yet"
                description="Grower profiles will appear here once they are added in Supabase."
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
                linkLabel="View profile"
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
