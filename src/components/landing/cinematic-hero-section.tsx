import { HeroScrollCue } from "@/components/landing/hero-scroll-cue";
import { HeroVideoBackground } from "@/components/landing/hero-video-background";
import type { Locale } from "@/lib/i18n/config";
import { getHeroCopy } from "@/lib/landing/narrative";

export function CinematicHeroSection({ locale }: { locale: Locale }) {
  const heroCopy = getHeroCopy(locale);

  return (
    <section
      data-landing-hero
      className="relative min-h-below-header overflow-hidden bg-moss-900"
    >
      <HeroVideoBackground className="bg-moss-900" />

      <div aria-hidden className="cinematic-veil absolute inset-0" />

      <div className="relative z-10 flex min-h-below-header flex-col justify-end">
        <div className="page-shell-wide w-full pb-16 pt-28 sm:pb-24 sm:pt-36 lg:pb-28">
          <div className="hero-intro mx-auto max-w-4xl stack-relaxed text-center lg:mx-0 lg:text-left">
            <p className="type-kicker type-kicker-on-dark">{heroCopy.whisper}</p>
            <h1 className="type-hero max-w-3xl text-loam-50 lg:mx-0">
              {heroCopy.headline}
            </h1>
            <p className="mx-auto max-w-xl text-lg leading-8 text-loam-50/82 sm:text-xl sm:leading-9 lg:mx-0">
              {heroCopy.subline}
            </p>
          </div>
        </div>
      </div>

      <HeroScrollCue />
    </section>
  );
}
