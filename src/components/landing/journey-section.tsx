import { PageSection } from "@/components/ui/page-section";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { villageJourneyBeats } from "@/lib/landing/content";

export function JourneySection() {
  return (
    <PageSection id="the-path" tone="depth" spacing="default">
      <div className="page-shell-wide">
        <RevealOnScroll>
          <div className="stack-relaxed">
            <p className="type-kicker type-kicker-on-dark">Как расте принадлежността</p>
            <h2 className="type-chapter max-w-3xl text-loam-50">
              Земя, усещане, човек — и едва тогава храна на масата.
            </h2>
            <p className="max-w-xl text-base leading-8 text-loam-50/75 sm:text-lg sm:leading-9">
              Отказваме се от фунията. Поканени сте да останете, да гледате, да
              слушате — и да следвате някого, на чиято работа вярвате.
            </p>
          </div>
        </RevealOnScroll>

        <ol className="content-after-head grid gap-0 lg:grid-cols-3 lg:gap-10">
          {villageJourneyBeats.map((beat, index) => (
            <li
              key={beat.step}
              className={`flex flex-col gap-4 py-10 ${
                index > 0
                  ? "border-t border-loam-50/15 lg:border-t-0 lg:border-l lg:border-loam-50/15 lg:pl-10 lg:py-0"
                  : ""
              }`}
            >
              <span
                aria-hidden
                className="editorial-serif text-4xl leading-none text-hearth-300/35 sm:text-[2.75rem]"
              >
                {String(beat.step).padStart(2, "0")}
              </span>
              <div className="stack-tight">
                <h3 className="editorial-serif text-xl leading-snug text-loam-50 sm:text-2xl">
                  {beat.title}
                </h3>
                <p className="max-w-sm text-[0.9375rem] leading-7 text-loam-50/72 sm:text-base">
                  {beat.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </PageSection>
  );
}

