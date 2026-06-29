import Link from "next/link";

import { ButtonLink } from "@/components/ui/button-link";
import { PageSection } from "@/components/ui/page-section";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { RevealStagger } from "@/components/ui/reveal-stagger";
import { StoryHeading } from "@/components/ui/story-heading";
import { getProfileInitials } from "@/lib/auth/profile";
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

function WanderPortrait({ farmer }: { farmer: VillageFarmer }) {
  if (farmer.imageUrl) {
    return (
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-stone-200 ring-1 ring-stone-300/50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={farmer.imageUrl}
          alt=""
          className="h-full w-full object-cover object-center"
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-base font-semibold text-loam-50 ring-1 ring-stone-300/50"
      style={{
        backgroundImage: `linear-gradient(135deg, ${farmer.gradientFrom}, ${farmer.gradientTo})`,
      }}
    >
      {getProfileInitials(farmer.name)}
    </div>
  );
}

function WanderSuggestionCard({
  farmer,
  locale,
}: {
  farmer: VillageFarmer;
  locale: Locale;
}) {
  const preview = farmer.specialty || farmer.story;

  return (
    <Link
      href={`/farmers/${farmer.slug}`}
      className="group flex h-full flex-col items-center gap-4 rounded-sm border border-stone-400/30 bg-loam-50/70 px-5 py-6 text-center transition-[background-color,border-color,box-shadow] duration-500 hover:border-moss-700/20 hover:bg-white/80 hover:shadow-[0_16px_40px_-24px_rgba(26,22,16,0.28)] sm:px-6 sm:py-7"
    >
      <WanderPortrait farmer={farmer} />
      <div className="min-w-0 flex-1 stack-tight">
        <p className="type-kicker line-clamp-1">{farmer.location}</p>
        <h3 className="editorial-serif text-xl leading-snug text-loam-900 transition-colors duration-500 group-hover:text-moss-700 sm:text-2xl">
          {farmer.name}
        </h3>
        {preview ? (
          <p className="line-clamp-2 text-sm leading-6 text-loam-700/90">
            {preview}
          </p>
        ) : null}
      </div>
      <span className="story-link story-link--plain text-sm">
        {translate(locale, "Виж профила", "View profile")}
      </span>
    </Link>
  );
}

export function VillageWander({ farmers, locale }: VillageWanderProps) {
  const suggestions = pickWanderTargets(farmers, 3);
  const hasSuggestions = suggestions.length > 0;

  return (
    <PageSection id="wander" tone="hearth" spacing="default" texture>
      <div className="page-shell-wide">
        <RevealOnScroll>
          <StoryHeading
            align="center"
            maxWidth="3xl"
            kicker={translate(locale, "Преди да тръгнеш", "Before you go")}
            title={translate(
              locale,
              hasSuggestions
                ? "Още няколко ферми за разглеждане"
                : "Разгледай всички ферми",
              hasSuggestions
                ? "A few more farms to browse"
                : "Browse all farms",
            )}
            description={translate(
              locale,
              hasSuggestions
                ? "Избрахме ги за днес. Отвори профил, виж видеата и реши дали искаш да ги добавиш в селото си."
                : "Пълният списък с производители е на едно място — с профили, видеа и какво предлагат в момента.",
              hasSuggestions
                ? "We picked these for today. Open a profile, watch their videos, and decide if you want them in your village."
                : "The full list of growers is in one place — with profiles, videos, and what they offer right now.",
            )}
          />
        </RevealOnScroll>

        {hasSuggestions ? (
          <RevealStagger className="content-after-head grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((farmer) => (
              <WanderSuggestionCard key={farmer.farmerId} farmer={farmer} locale={locale} />
            ))}
          </RevealStagger>
        ) : null}

        <RevealOnScroll className="content-after-head block">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 border-t border-stone-400/35 pt-8 text-center sm:pt-10">
            <p className="max-w-lg text-sm leading-7 text-loam-700/90 sm:text-base sm:leading-8">
              {translate(
                locale,
                "Можеш да се върнеш утре — селото ще те очаква.",
                "No rush. You can come back tomorrow — the village will be here.",
              )}
            </p>
            <div className="action-row justify-center">
              <ButtonLink href="/farmers" variant="primary">
                {translate(locale, "Всички фермери", "All farmers")}
              </ButtonLink>
              <ButtonLink href="#village-path" variant="quiet">
                {translate(locale, "Към началото на разходката", "Back to the start of the walk")}
              </ButtonLink>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </PageSection>
  );
}
