import { ButtonLink } from "@/components/ui/button-link";
import { PageSection } from "@/components/ui/page-section";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";

export function BelongingSection() {
  return (
    <PageSection tone="mist" spacing="default">
      <div className="page-shell-wide">
        <RevealOnScroll>
          <div className="mx-auto max-w-3xl stack-relaxed text-center">
            <p className="type-kicker">Когато сте готови</p>
            <h2 className="type-chapter text-loam-900">
              Останете за историите. Следвайте сезоните. Оставете доверието да
              дойде в свое време.
            </h2>
            <p className="mx-auto max-w-xl text-base leading-8 text-stone-700/90 sm:text-lg sm:leading-9">
              Тук няма бързане. Разхождайте се из селото, гледайте сутрешното на
              един фермер и се върнете, когато земята започне да ви се струва и
              ваша.
            </p>
            <div className="action-row justify-center pt-2">
              <ButtonLink href="/farmers" variant="quiet">
                Влез в селото
              </ButtonLink>
              <ButtonLink href="/discover" variant="quiet">
                Разхождай се без план
              </ButtonLink>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </PageSection>
  );
}
