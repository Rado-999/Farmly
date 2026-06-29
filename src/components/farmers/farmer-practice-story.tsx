import { formatExperienceYears } from "@/lib/data/formatters";
import { PageSection } from "@/components/ui/page-section";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { formatLastUpdatedLabel } from "@/lib/farmers/profile-helpers";
import type { FarmerProfile } from "@/lib/farmers/types";

type FarmerPracticeStoryProps = {
  farmer: Pick<
    FarmerProfile,
    | "howIFarm"
    | "farmingPhilosophy"
    | "methods"
    | "experienceYears"
    | "videos"
    | "products"
  >;
};

export function FarmerPracticeStory({ farmer }: FarmerPracticeStoryProps) {
  const experienceLabel = formatExperienceYears(farmer.experienceYears);
  const hasStory = Boolean(farmer.howIFarm.trim());
  const hasPhilosophy = Boolean(farmer.farmingPhilosophy.trim());
  const lastUpdated = formatLastUpdatedLabel(farmer.videos, farmer.products);

  return (
    <PageSection id="practice" tone="meadow" spacing="default">
      <div className="page-shell">
        <RevealOnScroll>
          <p className="text-[0.8125rem] font-medium tracking-[0.14em] text-clay uppercase">
            Прозрачност
          </p>
          <h2 className="editorial-serif mt-3 max-w-2xl text-3xl leading-tight text-moss-900 sm:text-4xl">
            Как отглеждам
          </h2>
        </RevealOnScroll>

        <div className="content-after-head layout-split grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.75fr)] lg:gap-16">
          <RevealOnScroll className="stack-relaxed">
            {hasStory ? (
              <div className="prose-farmly text-base leading-8 text-soil/90 sm:text-lg sm:leading-9">
                {farmer.howIFarm.split("\n").map((paragraph, index) => (
                  <p key={index} className="mb-6 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-base leading-8 text-soil/70 sm:text-lg sm:leading-9">
                Този фермер още не е написал историята си.
              </p>
            )}

            {hasPhilosophy ? (
              <blockquote className="editorial-serif border-l-2 border-moss-600/35 pl-6 text-xl leading-relaxed text-moss-900 italic sm:text-2xl">
                {farmer.farmingPhilosophy}
              </blockquote>
            ) : null}
          </RevealOnScroll>

          <RevealOnScroll>
            <aside className="stack-relaxed border-t border-loam-400/40 pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
              {experienceLabel ? (
                <div>
                  <h3 className="text-[0.6875rem] font-medium tracking-[0.16em] text-clay uppercase">
                    На земята
                  </h3>
                  <p className="mt-2 text-base text-moss-900">{experienceLabel}</p>
                </div>
              ) : null}

              {farmer.methods.length > 0 ? (
                <div>
                  <h3 className="text-[0.6875rem] font-medium tracking-[0.16em] text-clay uppercase">
                    Практики
                  </h3>
                  <ul className="mt-3 space-y-2 text-base leading-7 text-soil/85">
                    {farmer.methods.map((method) => (
                      <li key={method}>{method}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {lastUpdated ? (
                <p className="text-sm text-soil/65">{lastUpdated}</p>
              ) : null}
            </aside>
          </RevealOnScroll>
        </div>
      </div>
    </PageSection>
  );
}
