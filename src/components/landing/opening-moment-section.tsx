import Image from "next/image";

import { PageSection } from "@/components/ui/page-section";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { StoryHeading } from "@/components/ui/story-heading";
import { landingAtmosphereImage } from "@/lib/landing/visuals";

export function OpeningMomentSection() {
  return (
    <PageSection id="opening-moment" tone="mist" spacing="default">
      <div className="page-shell-wide">
        <div className="layout-split lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center">
          <RevealOnScroll direction="left">
            <StoryHeading
              kicker="Преди всичко друго"
              title="Трябва да усетите земята, преди да срещнете фермер."
              description="Индустриалната храна се движи бързо и остава невидима. Тук темпото е човешко: вятър в редовете, кал по ботушите, светлина, която се променя в оранжерията. Създадохме Farmly за това усещане — не за плащане на каса."
              size="chapter"
            />
          </RevealOnScroll>

          <RevealOnScroll direction="right" className="relative">
            <figure className="relative aspect-[4/5] overflow-hidden rounded-sm shadow-[0_32px_64px_-32px_rgba(26,22,16,0.45)] sm:aspect-[5/6] lg:-mr-8">
              <Image
                src={landingAtmosphereImage.src}
                alt={landingAtmosphereImage.alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 42vw"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(0deg,rgba(31,48,34,0.45)_0%,transparent_42%)]"
              />
              <figcaption className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <p className="editorial-serif text-2xl leading-snug text-mist sm:text-3xl">
                  <span className="italic text-wheat/95">Несъвършена светлина.</span>{" "}
                  Истински ръце. Сезон, който почти можеш да помиришеш.
                </p>
              </figcaption>
            </figure>
          </RevealOnScroll>
        </div>
      </div>
    </PageSection>
  );
}
