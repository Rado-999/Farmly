import { formatExperienceYears } from "@/lib/data/formatters";
import { PageSection } from "@/components/ui/page-section";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { RevealStagger } from "@/components/ui/reveal-stagger";
import { SectionHeading } from "@/components/ui/section-heading";
import type { FarmerProfile } from "@/lib/farmers/types";

type FarmerStoryProps = {
  farmer: Pick<
    FarmerProfile,
    "howIFarm" | "farmingPhilosophy" | "methods" | "experienceYears"
  >;
};

function StoryCard({
  title,
  children,
  muted = false,
}: {
  title: string;
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <article
      className={`surface-card flex h-full flex-col card-pad ${muted ? "surface-card-muted" : "bg-white"}`}
    >
      <h3 className="text-xl font-semibold text-stone-900 sm:text-2xl">
        {title}
      </h3>
      <div className="mt-4 flex flex-1 flex-col text-base leading-7 text-stone-600 sm:text-[1.05rem] sm:leading-8">
        {children}
      </div>
    </article>
  );
}

export function FarmerStory({ farmer }: FarmerStoryProps) {
  const experienceLabel = formatExperienceYears(farmer.experienceYears);
  const hasStory = Boolean(farmer.howIFarm.trim());
  const hasPhilosophy = Boolean(farmer.farmingPhilosophy.trim());

  return (
    <PageSection tone="white" id="story">
      <div className="page-shell">
        <RevealOnScroll>
          <SectionHeading
            align="left"
            eyebrow="Доверие и история"
            title="Как отглеждам"
            description="Прозрачен поглед към практиките и философията зад фермата."
          />
        </RevealOnScroll>

        <RevealStagger className="content-after-head grid-cards lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <StoryCard title="Трудът зад сезона" muted>
            {hasStory ? (
              <p>{farmer.howIFarm}</p>
            ) : (
              <p className="text-stone-500">
                Този фермер още не е написал историята си.
              </p>
            )}
          </StoryCard>

          <StoryCard title="Фермерска философия">
            {hasPhilosophy ? (
              <p>{farmer.farmingPhilosophy}</p>
            ) : (
              <p className="text-stone-500">
                Още не е споделил философията си за отглеждане.
              </p>
            )}
            {experienceLabel || farmer.methods.length > 0 ? (
              <div className="mt-6 space-y-4 border-t border-stone-200/70 pt-6">
                {experienceLabel ? (
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-forest">
                    {experienceLabel}
                  </p>
                ) : null}
                {farmer.methods.length > 0 ? (
                  <ul className="flex flex-wrap gap-2">
                    {farmer.methods.map((method) => (
                      <li
                        key={method}
                        className="rounded-full bg-stone-100/90 px-3 py-1.5 text-sm text-stone-700 transition-colors duration-300 hover:bg-stone-200/80"
                      >
                        {method}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </StoryCard>
        </RevealStagger>
      </div>
    </PageSection>
  );
}
