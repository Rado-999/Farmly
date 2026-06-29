import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import { PageSection } from "@/components/ui/page-section";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { getProfileInitials } from "@/lib/auth/profile";
import type { Locale } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/translate";
import type { FarmerPreview } from "@/lib/landing/types";

type FeaturedFarmersSectionProps = {
  locale: Locale;
  farmers: FarmerPreview[];
};

const portraitSizeClass = "h-20 w-20 sm:h-24 sm:w-24";

function GrowerPortrait({
  locale,
  name,
  imageUrl,
  gradientFrom,
  gradientTo,
}: Pick<
  FarmerPreview,
  "name" | "imageUrl" | "gradientFrom" | "gradientTo"
> & {
  locale: Locale;
}) {
  if (imageUrl) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden rounded-full bg-stone-200 ring-1 ring-stone-300/50 ${portraitSizeClass}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- farmer profile URL */}
        <img
          src={imageUrl}
          alt={translate(locale, `${name} — профил`, `${name} profile`)}
          className="h-full w-full object-cover object-center"
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full text-lg font-semibold text-loam-50 ring-1 ring-stone-300/50 sm:text-xl ${portraitSizeClass}`}
      style={{
        backgroundImage: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
      }}
    >
      {getProfileInitials(name)}
    </div>
  );
}

function GrowerGridCard({
  farmer,
  locale,
}: {
  farmer: FarmerPreview;
  locale: Locale;
}) {
  return (
    <li className="h-full">
      <Link
        href={`/farmers/${farmer.id}`}
        className="group flex h-full flex-col items-center gap-4 rounded-sm px-3 py-6 text-center transition-colors duration-500 hover:bg-loam-50/60 sm:px-4 sm:py-8"
      >
        <GrowerPortrait
          locale={locale}
          name={farmer.name}
          imageUrl={farmer.imageUrl}
          gradientFrom={farmer.gradientFrom}
          gradientTo={farmer.gradientTo}
        />
        <div className="flex w-full min-w-0 flex-1 flex-col items-center stack-tight">
          <p className="type-kicker line-clamp-1">{farmer.location}</p>
          <h3 className="editorial-serif text-xl text-loam-900 transition-colors duration-500 group-hover:text-moss-700 sm:text-2xl">
            {farmer.name}
          </h3>
          {farmer.specialty ? (
            <p className="text-sm font-medium tracking-wide text-moss-700">
              {farmer.specialty}
            </p>
          ) : null}
          {farmer.story ? (
            <p className="line-clamp-3 text-sm leading-7 text-loam-700/90 sm:text-base sm:leading-8">
              {farmer.story}
            </p>
          ) : null}
          <span className="story-link mt-auto pt-2">
            {translate(locale, "Запознай се", "Hear their voice")}
          </span>
        </div>
      </Link>
    </li>
  );
}

export function FeaturedFarmersSection({
  farmers,
  locale,
}: FeaturedFarmersSectionProps) {
  return (
    <PageSection id="growers" tone="dawn" spacing="default">
      <div className="page-shell-wide">
        <RevealOnScroll>
          <div className="stack-relaxed">
            <p className="type-kicker">
              {translate(locale, "Истински хора", "Real people")}
            </p>
            <h2 className="type-chapter max-w-3xl text-loam-900">
              {translate(
                locale,
                "Ето с кого започва запознаването.",
                "Here is where you start getting to know them.",
              )}
            </h2>
            <p className="max-w-xl text-base leading-8 text-loam-700/90 sm:text-lg sm:leading-9">
              {translate(
                locale,
                "Зад всеки профил стои фермер, място и история. Прочети неговата история, запознай се с неговата ферма и реши дали искаш да я добавиш в селото си.",
                "Every profile is a farmer with a place and a story. Read their story, explore their farm, and decide if you want to add them to your village.",
              )}
            </p>
          </div>
        </RevealOnScroll>

        {farmers.length === 0 ? (
          <RevealOnScroll className="content-after-head block">
            <EmptyState
              title={translate(
                locale,
                "Още няма профили",
                "No profiles yet",
              )}
              description={translate(
                locale,
                "Ще се появят, когато фермерите се регистрират и попълнят данните си.",
                "They will show up here once farmers sign up and fill in their details.",
              )}
            />
          </RevealOnScroll>
        ) : (
          <RevealOnScroll className="content-after-head">
            <ul className="m-0 grid list-none grid-cols-1 gap-x-6 gap-y-2 p-0 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-3 xl:grid-cols-4">
              {farmers.map((farmer) => (
                <GrowerGridCard key={farmer.id} farmer={farmer} locale={locale} />
              ))}
            </ul>
          </RevealOnScroll>
        )}
      </div>
    </PageSection>
  );
}
