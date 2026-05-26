import { ButtonLink } from "@/components/ui/button-link";
import { PageSection } from "@/components/ui/page-section";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import type { Locale } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/translate";

export function BelongingSection({ locale }: { locale: Locale }) {
  return (
    <PageSection tone="mist" spacing="default">
      <div className="page-shell-wide">
        <RevealOnScroll>
          <div className="mx-auto max-w-3xl stack-relaxed text-center">
            <p className="type-kicker">
              {translate(locale, "Когато сте готови", "When you are ready")}
            </p>
            <h2 className="type-chapter text-loam-900">
              {translate(
                locale,
                "Останете за историите. Следвайте сезоните. Оставете доверието да дойде в свое време.",
                "Stay for the stories. Follow the seasons. Let trust arrive in its own time.",
              )}
            </h2>
            <p className="mx-auto max-w-xl text-base leading-8 text-stone-700/90 sm:text-lg sm:leading-9">
              {translate(
                locale,
                "Тук няма бързане. Разхождайте се из селото, гледайте сутрешното на един фермер и се върнете, когато земята започне да ви се струва и ваша.",
                "There is no rush here. Wander through the village, watch a farmer's morning, and come back when the land starts to feel like yours too.",
              )}
            </p>
            <div className="action-row justify-center pt-2">
              <ButtonLink href="/farmers" variant="quiet">
                {translate(locale, "Влез в селото", "Enter the village")}
              </ButtonLink>
              <ButtonLink href="/discover" variant="quiet">
                {translate(locale, "Разхождай се без план", "Wander without a plan")}
              </ButtonLink>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </PageSection>
  );
}
