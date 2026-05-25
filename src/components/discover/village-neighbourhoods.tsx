import Link from "next/link";

import { FollowFarmerChip } from "@/components/discover/follow-farmer-chip";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSection } from "@/components/ui/page-section";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { RevealStagger } from "@/components/ui/reveal-stagger";
import { StoryHeading } from "@/components/ui/story-heading";
import { getProfileInitials } from "@/lib/auth/profile";
import type { VillageNeighbourhood } from "@/lib/discover/types";

type VillageNeighbourhoodsProps = {
  neighbourhoods: VillageNeighbourhood[];
};

export function VillageNeighbourhoods({
  neighbourhoods,
}: VillageNeighbourhoodsProps) {
  return (
    <PageSection id="neighbourhoods" tone="mist" spacing="default">
      <div className="page-shell-wide">
        <RevealOnScroll>
          <StoryHeading
            kicker="Квартали по селото"
            title="Следвай местата, не категориите."
            description="Всяка местност събира свои ферми — различен ритъм, различен сезон, същото спокойствие."
          />
        </RevealOnScroll>

        {neighbourhoods.length === 0 ? (
          <RevealOnScroll className="content-after-head block">
            <EmptyState
              title="Картата се оформя"
              description="С производителите идат и местата — постепенно, с истински имена."
            />
          </RevealOnScroll>
        ) : (
          <div className="content-after-head stack-relaxed">
            {neighbourhoods.map((hood) => (
              <RevealOnScroll key={hood.id}>
                <section className="rounded-2xl border border-stone-400/25 bg-white/45 p-6 sm:p-8">
                  <header className="stack-tight max-w-2xl">
                    <h3 className="editorial-serif text-2xl text-forest-deep sm:text-3xl">
                      {hood.label}
                    </h3>
                    <p className="text-sm leading-7 text-stone-700/90 sm:text-base">
                      {hood.description}
                    </p>
                  </header>

                  <RevealStagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {hood.farmers.map((farmer) => (
                      <article
                        key={farmer.farmerId}
                        className="flex items-start gap-4 rounded-xl border border-stone-400/20 bg-cream/80 p-4"
                      >
                        {farmer.imageUrl ? (
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-stone-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={farmer.imageUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div
                            aria-hidden
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-mist"
                            style={{
                              backgroundImage: `linear-gradient(135deg, ${farmer.gradientFrom}, ${farmer.gradientTo})`,
                            }}
                          >
                            {getProfileInitials(farmer.name)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1 stack-tight">
                          <Link
                            href={`/farmers/${farmer.slug}`}
                            className="editorial-serif text-lg text-forest-deep hover:text-forest"
                          >
                            {farmer.name}
                          </Link>
                          <p className="text-xs text-soil">{farmer.specialty}</p>
                          <FollowFarmerChip
                            farmerId={farmer.farmerId}
                            farmerName={farmer.name}
                          />
                        </div>
                      </article>
                    ))}
                  </RevealStagger>
                </section>
              </RevealOnScroll>
            ))}
          </div>
        )}
      </div>
    </PageSection>
  );
}
