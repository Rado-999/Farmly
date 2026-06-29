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
              {translate(locale, "Следваща стъпка", "Next step")}
            </p>
            <h2 className="type-chapter text-loam-900">
              {translate(
                locale,
                "Към село, което ще наречеш свое.",
                "Toward a village you’ll call your own"
              )}
            </h2>
            <p className="mx-auto max-w-xl text-base leading-8 text-stone-700/90 sm:text-lg sm:leading-9">
              {translate(
                locale,
                "Разгледай фермерите, пусни някое видео, виж какво е в сезон. Ако намериш някого, при когото искаш да се върнеш, запази го в селото си.",
                "Browse the farmers, watch a video, see what is in season. If you find someone you want to return to, save them in your village.",
              )}
            </p>
            <div className="action-row justify-center pt-2">
              <ButtonLink href="/farmers" variant="quiet">
                {translate(locale, "Виж фермерите", "See the farmers")}
              </ButtonLink>
              <ButtonLink href="/discover" variant="quiet">
                {translate(locale, "Разходка из селото", "Walk through the village")}
              </ButtonLink>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </PageSection>
  );
}
