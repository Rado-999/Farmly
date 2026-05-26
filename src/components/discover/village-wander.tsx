import Link from "next/link";

import { ButtonLink } from "@/components/ui/button-link";
import { PageSection } from "@/components/ui/page-section";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import type { VillageFarmer } from "@/lib/discover/types";
import type { Locale } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/translate";

type VillageWanderProps = {
  locale: Locale;
  farmers: VillageFarmer[];
};

function pickWanderTargets(farmers: VillageFarmer[], count: number) {
  if (farmers.length <= count) {
    return farmers;
  }

  const dayOffset = new Date().getUTCDate() % farmers.length;

  return Array.from({ length: count }, (_, index) => {
    return farmers[(dayOffset + index) % farmers.length];
  });
}

export function VillageWander({ farmers, locale }: VillageWanderProps) {
  const suggestions = pickWanderTargets(farmers, 3);

  return (
    <PageSection id="wander" tone="depth" spacing="default">
      <div className="page-shell-wide">
        <RevealOnScroll>
          <div className="mx-auto max-w-2xl text-center stack-relaxed">
            <p className="text-[0.8125rem] font-medium tracking-[0.14em] text-wheat/90 uppercase">
              {translate(locale, "Продължи без план", "Keep going without a plan")}
            </p>
            <h2 className="editorial-serif text-3xl leading-tight text-mist sm:text-4xl">
              {translate(
                locale,
                "Селото няма край — само следваща завийка.",
                "The village has no end, only another bend.",
              )}
            </h2>
            <p className="text-base leading-8 text-mist/80 sm:text-lg">
              {translate(
                locale,
                "Върни се утре. Следи фермер, който те закачи. Или просто избери посока и тръгни — любопитството е достатъчна карта.",
                "Come back tomorrow. Follow a farmer who stays with you. Or just choose a direction and go. Curiosity is map enough.",
              )}
            </p>

            {suggestions.length > 0 ? (
              <ul className="mt-6 flex flex-wrap justify-center gap-3">
                {suggestions.map((farmer) => (
                  <li key={farmer.farmerId}>
                    <Link
                      href={`/farmers/${farmer.slug}`}
                      className="inline-flex rounded-full border border-mist/25 bg-mist/10 px-4 py-2 text-sm text-mist transition-colors duration-500 hover:border-mist/40 hover:bg-mist/20"
                    >
                      {farmer.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="action-row mt-8 justify-center">
              <ButtonLink
                href="/farmers"
                variant="secondary"
                className="border-mist/30 bg-mist/15 text-mist hover:bg-mist/25"
              >
                {translate(locale, "Всички ферми", "All farms")}
              </ButtonLink>
              <ButtonLink
                href="#village-ring"
                variant="quiet"
                className="text-wheat hover:text-mist"
              >
                {translate(locale, "Започни отначало", "Start again")}
              </ButtonLink>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </PageSection>
  );
}
