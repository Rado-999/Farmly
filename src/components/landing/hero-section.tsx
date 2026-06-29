import Image from "next/image";

import { HeroScrollCue } from "@/components/landing/hero-scroll-cue";
import { ButtonLink } from "@/components/ui/button-link";
import { landingHeroImage } from "@/lib/landing/visuals";

export function HeroSection() {
  return (
    <section
      data-landing-hero
      className="relative isolate h-below-header overflow-hidden bg-forest-deep"
    >
      {/* Layer 1: CSS background — always visible even if Next/Image fails */}
      <div
        aria-hidden
        className="absolute inset-0 bg-forest-deep bg-cover bg-center"
        style={{ backgroundImage: `url(${landingHeroImage.src})` }}
      />

      {/* Layer 2: optimized image for LCP */}
      <Image
        src={landingHeroImage.src}
        alt=""
        aria-hidden
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* Layer 3: scrim + grain */}
      <div aria-hidden className="cinematic-veil" />
      <div aria-hidden className="film-grain" />

      {/* Layer 4: copy */}
      <div className="relative z-10 flex h-full min-h-0 flex-col justify-end">
        <div className="page-shell-wide w-full pb-14 pt-28 sm:pb-20 sm:pt-36 lg:pb-24">
          <div className="hero-intro max-w-3xl stack-relaxed">
            <p className="text-[0.8125rem] font-medium tracking-[0.14em] text-wheat uppercase">
              Дигитално село в България
            </p>
            <h1 className="editorial-serif max-w-2xl text-[2.75rem] leading-[1.08] font-medium text-mist sm:text-6xl lg:text-7xl">
              Знаеш кой отглежда храната ти.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-mist/90 sm:text-xl sm:leading-9">
              Farmly не е онлайн магазин. Тук виждаш български фермери, гледаш
              видеа от полето и разбираш откъде идва храната ти, преди да решиш
              дали искаш да купуваш.
            </p>
            <div className="action-row">
              <ButtonLink
                href="#field-stories"
                variant="secondary"
                className="!bg-mist !text-forest-deep border-mist/60 hover:!border-white hover:!bg-white"
              >
                Виж как селото се събужда
              </ButtonLink>
              <ButtonLink
                href="#growers"
                variant="quiet"
                className="story-link-on-dark"
              >
                Запознай се с производителите
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>

      <HeroScrollCue />
    </section>
  );
}
