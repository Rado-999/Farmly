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
            {translate(locale, "Чуй гласа им", "Hear their voice")}
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
                "Това са хората зад масата ви.",
                "These are the people behind your table.",
              )}
            </h2>
            <p className="max-w-xl text-base leading-8 text-loam-700/90 sm:text-lg sm:leading-9">
              {translate(
                locale,
                "Не обяви. Съседи с почва под ноктите, сезони в гласа си и ферма, която можете да посетите първо с очите.",
                "Not listings. Neighbors with soil under their nails, seasons in their voices, and farms you can visit with your eyes first.",
              )}
            </p>
          </div>
        </RevealOnScroll>

        {farmers.length === 0 ? (
          <RevealOnScroll className="content-after-head block">
            <EmptyState
              title={translate(
                locale,
                "Производителите намират пътя си тук",
                "Growers are finding their way here",
              )}
              description={translate(
                locale,
                "Нови ферми се присъединяват към селото, докато започват да споделят кои са — бавно, със собствени думи.",
                "New farms join the village as they begin to share who they are, slowly and in their own words.",
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
