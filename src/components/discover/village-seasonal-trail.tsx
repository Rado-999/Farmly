import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import { MediaPanel } from "@/components/ui/media-panel";
import { PageSection } from "@/components/ui/page-section";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { StoryHeading } from "@/components/ui/story-heading";
import type { VillageMoment } from "@/lib/discover/types";

type VillageSeasonalTrailProps = {
  moments: VillageMoment[];
};

export function VillageSeasonalTrail({ moments }: VillageSeasonalTrailProps) {
  return (
    <PageSection id="seasonal-trail" tone="dawn" spacing="default">
      <div className="page-shell-wide">
        <RevealOnScroll>
          <StoryHeading
            kicker="Сезонът днес"
            title="Какво е готово сега"
            description="Продукти и бележки, които фермерите споделят като налични в момента."
          />
        </RevealOnScroll>

        {moments.length === 0 ? (
          <RevealOnScroll className="content-after-head block">
            <EmptyState
              title="Полетата почиват"
              description="Ще се появи тук, когато фермерите споделят какво е готово за жътва."
            />
          </RevealOnScroll>
        ) : (
          <ul className="content-after-head relative m-0 list-none p-0 pl-6 sm:pl-8">
            <div
              aria-hidden
              className="absolute bottom-4 left-[0.6875rem] top-4 w-px bg-stone-400/50 sm:left-[0.8125rem]"
            />
            {moments.map((moment, index) => {
              const href = moment.farmerSlug
                ? `/farmers/${moment.farmerSlug}`
                : null;

              const row = (
                <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_8.5rem] sm:items-center sm:gap-8">
                  <div className="stack-tight min-w-0 py-6 sm:py-8">
                    <p className="text-sm font-medium tracking-wide text-clay">
                      {moment.season}
                    </p>
                    <h3 className="editorial-serif text-2xl text-forest-deep sm:text-[1.75rem]">
                      {moment.title}
                    </h3>
                    <p className="text-sm text-soil">
                      При {moment.farmerName}
                    </p>
                    {moment.note ? (
                      <p className="max-w-lg text-sm leading-7 text-stone-700/90">
                        {moment.note}
                      </p>
                    ) : null}
                    {href ? (
                      <span className="story-link text-sm">Посети фермата</span>
                    ) : null}
                  </div>
                  <MediaPanel
                    from={moment.gradientFrom}
                    to={moment.gradientTo}
                    label={moment.title}
                    imageUrl={moment.imageUrl}
                    className="aspect-square w-full max-w-[8.5rem] rounded-lg sm:justify-self-end"
                  />
                </div>
              );

              return (
                <li key={moment.id} className="relative">
                  <span
                    aria-hidden
                    className="absolute -left-6 top-9 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-stone-400/60 bg-cream sm:-left-8"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-olive/70" />
                  </span>
                  <RevealOnScroll>
                    {href ? (
                      <Link
                        href={href}
                        className={`block rounded-xl transition-colors duration-300 hover:bg-white/30 ${
                          index === 0 ? "pt-0" : ""
                        }`}
                      >
                        {row}
                      </Link>
                    ) : (
                      <article>{row}</article>
                    )}
                  </RevealOnScroll>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </PageSection>
  );
}
