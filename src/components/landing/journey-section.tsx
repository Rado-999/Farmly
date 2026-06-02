import { PageSection } from "@/components/ui/page-section";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import type { Locale } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/translate";
import { getVillageJourneyBeats } from "@/lib/landing/content";

export function JourneySection({ locale }: { locale: Locale }) {
  const villageJourneyBeats = getVillageJourneyBeats(locale);

  return (
    <PageSection id="the-path" tone="depth" spacing="default">
      <div className="page-shell-wide">
        <RevealOnScroll>
          <div className="stack-relaxed">
            <p className="type-kicker type-kicker-on-dark">
              {translate(locale, "Как расте принадлежността", "How belonging grows")}
            </p>
            <h2 className="type-chapter max-w-3xl text-loam-50">
              {translate(
                locale,
                "Земя, усещане, човек — и едва тогава храна на масата.",
                "Land, feeling, person, and only then food on the table.",
              )}
            </h2>
            <p className="max-w-xl text-base leading-8 text-loam-50/75 sm:text-lg sm:leading-9">
              {translate(
                locale,
                "Отказваме се от фунията. Поканени сте да останете, да гледате, да слушате — и да следвате някого, на чиято работа вярвате.",
                "We give up the funnel. You are invited to stay, watch, listen, and follow someone whose work you trust.",
              )}
            </p>
          </div>
        </RevealOnScroll>

        <ol className="content-after-head m-0 list-none grid divide-y divide-loam-50/15 p-0 lg:grid-cols-3 lg:items-start lg:gap-x-10 lg:divide-x lg:divide-y-0">
          {villageJourneyBeats.map((beat) => (
            <li
              key={beat.step}
              className="flex flex-col gap-4 py-10 lg:py-0"
            >
              <span
                aria-hidden
                className="editorial-serif shrink-0 text-4xl leading-none text-hearth-300/35 sm:text-[2.75rem]"
              >
                {String(beat.step).padStart(2, "0")}
              </span>
              <h3 className="editorial-serif text-xl leading-snug text-loam-50 sm:text-2xl lg:min-h-[2.75em]">
                {beat.title}
              </h3>
              <p className="max-w-sm text-[0.9375rem] leading-7 text-loam-50/72 sm:text-base">
                {beat.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </PageSection>
  );
}

