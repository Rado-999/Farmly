import Image from "next/image";

import { PageSection } from "@/components/ui/page-section";
import { ImageCaptionPanel } from "@/components/ui/image-caption-panel";
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
              kicker="Защо съществува Farmly"
              title="Искаме да виждаш хората зад храната, преди да купуваш."
              description="В магазина виждаш етикет. Тук виждаш фермера — как работи, какво казва, какво споделя тази седмица. Създадохме Farmly за това, не за още един онлайн магазин."
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
                className="absolute inset-0 bg-[linear-gradient(0deg,rgba(31,48,34,0.3)_0%,transparent_38%)]"
              />
              <ImageCaptionPanel textClassName="editorial-serif text-2xl leading-snug sm:text-3xl">
                Реални хора, реални полета.{" "}
                <span className="image-caption-lead">Нищо от студио.</span>
              </ImageCaptionPanel>
            </figure>
          </RevealOnScroll>
        </div>
      </div>
    </PageSection>
  );
}
