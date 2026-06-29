import Link from "next/link";

import { FollowFarmerChip } from "@/components/discover/follow-farmer-chip";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSection } from "@/components/ui/page-section";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { RevealStagger } from "@/components/ui/reveal-stagger";
import { StoryHeading } from "@/components/ui/story-heading";
import { getProfileInitials } from "@/lib/auth/profile";
import type { DiscoverPersonalization } from "@/lib/discover/personalize";
import type { VillageFarmer } from "@/lib/discover/types";
import type { Locale } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/translate";

type VillageRingProps = {
  locale: Locale;
  farmers: VillageFarmer[];
  personalization?: DiscoverPersonalization;
};

function RingPortrait({ farmer }: { farmer: VillageFarmer }) {
  if (farmer.imageUrl) {
    return (
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-stone-200 ring-1 ring-stone-300/50 sm:h-16 sm:w-16">
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
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-loam-50 ring-1 ring-stone-300/50 sm:h-16 sm:w-16"
      style={{
        backgroundImage: `linear-gradient(135deg, ${farmer.gradientFrom}, ${farmer.gradientTo})`,
      }}
    >
      {getProfileInitials(farmer.name)}
    </div>
  );
}

function RingFarmerCard({
  farmer,
  locale,
}: {
  farmer: VillageFarmer;
  locale: Locale;
}) {
  const preview = farmer.specialty || farmer.story;

  return (
    <article className="flex h-full flex-col justify-between gap-4 border-t border-stone-400/35 py-5 sm:py-6">
      <Link
        href={`/farmers/${farmer.slug}`}
        className="group flex min-w-0 gap-4"
      >
        <RingPortrait farmer={farmer} />
        <div className="min-w-0 flex-1 stack-tight">
          <p className="type-kicker line-clamp-1">{farmer.location}</p>
          <h3 className="editorial-serif text-xl leading-snug text-loam-900 transition-colors duration-500 group-hover:text-moss-700 sm:text-2xl">
            {farmer.name}
          </h3>
          {preview ? (
            <p className="line-clamp-2 text-sm leading-6 text-loam-700/90 sm:text-[0.9375rem] sm:leading-7">
              {preview}
            </p>
          ) : null}
          <span className="story-link story-link--plain pt-1 text-sm">
            {translate(locale, "Виж профила", "View profile")}
          </span>
        </div>
      </Link>
      <div className="pl-[4.5rem] sm:pl-[5rem]">
        <FollowFarmerChip farmerId={farmer.farmerId} farmerName={farmer.name} />
      </div>
    </article>
  );
}

export function VillageRing({ farmers, locale, personalization }: VillageRingProps) {
  return (
    <PageSection id="village-ring" tone="mist" spacing="default">
      <div className="page-shell-wide">
        <RevealOnScroll>
          <StoryHeading
            kicker={
              personalization
                ? translate(locale, "Нови срещи", "New encounters")
                : translate(locale, "Кого ще срещнеш", "Who you will meet")
            }
            title={
              personalization
                ? translate(
                    locale,
                    "Ферми, които още не са в селото ти",
                    "Farms not in your village yet",
                  )
                : translate(locale, "Фермери по пътя", "Farmers along the path")
            }
            description={translate(
              locale,
              personalization
                ? "Подредени според местата и сезоните, които вече те интересуват."
                : "Прегледай профилите и реши кого искаш да опознаеш по-подробно.",
              personalization
                ? "Arranged around the places and seasons you already care about."
                : "Browse the profiles and decide who you want to get to know better.",
            )}
          />
        </RevealOnScroll>

        {farmers.length === 0 ? (
          <RevealOnScroll className="content-after-head block">
            <EmptyState
              title={translate(locale, "Още няма ферми тук", "No farms here yet")}
              description={translate(
                locale,
                "Когато се присъединят нови производители, ще ги видиш в този раздел.",
                "When new growers join, you will see them in this section.",
              )}
            />
          </RevealOnScroll>
        ) : (
          <RevealStagger className="content-after-head grid gap-x-8 gap-y-0 sm:grid-cols-2 xl:grid-cols-3">
            {farmers.map((farmer) => (
              <RingFarmerCard key={farmer.farmerId} farmer={farmer} locale={locale} />
            ))}
          </RevealStagger>
        )}
      </div>
    </PageSection>
  );
}
