import Link from "next/link";

import { FollowFarmerChip } from "@/components/discover/follow-farmer-chip";
import { PageSection } from "@/components/ui/page-section";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { StoryHeading } from "@/components/ui/story-heading";
import { getProfileInitials } from "@/lib/auth/profile";
import type { VillageFarmer } from "@/lib/discover/types";

type VillageRingProps = {
  farmers: VillageFarmer[];
};

function RingPortrait({ farmer }: { farmer: VillageFarmer }) {
  if (farmer.imageUrl) {
    return (
      <div className="relative h-[4.25rem] w-[4.25rem] overflow-hidden rounded-full bg-stone-200 ring-2 ring-white sm:h-20 sm:w-20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={farmer.imageUrl}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className="flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-full text-sm font-semibold text-mist ring-2 ring-white sm:h-20 sm:w-20 sm:text-base"
      style={{
        backgroundImage: `linear-gradient(135deg, ${farmer.gradientFrom}, ${farmer.gradientTo})`,
      }}
    >
      {getProfileInitials(farmer.name)}
    </div>
  );
}

export function VillageRing({ farmers }: VillageRingProps) {
  return (
    <PageSection id="village-ring" tone="mist" spacing="default">
      <div className="page-shell-wide">
        <RevealOnScroll>
          <StoryHeading
            kicker="Кого ще срещнеш"
            title="Лицата по пътеката."
            description="Премини покрай тях — без бързане. Всяка ферма е врата към история, не към кошница."
          />
        </RevealOnScroll>

        <div className="content-after-head -mx-5 overflow-x-auto px-5 pb-2 sm:-mx-7 sm:px-7 lg:-mx-10 lg:px-10">
          <ul className="flex w-max items-stretch gap-4 sm:gap-5">
            {farmers.map((farmer) => (
              <li key={farmer.farmerId} className="w-[10.5rem] shrink-0 sm:w-[13rem] lg:w-[15.5rem]">
                <article className="flex h-full flex-col items-center rounded-2xl border border-stone-400/25 bg-white/60 p-4 text-center shadow-[0_12px_32px_-20px_rgba(26,22,16,0.2)] backdrop-blur-sm sm:p-5">
                  <Link
                    href={`/farmers/${farmer.slug}`}
                    className="group flex w-full flex-1 flex-col items-center gap-3"
                  >
                    <RingPortrait farmer={farmer} />
                    <div className="flex w-full min-w-0 flex-1 flex-col">
                      <p className="text-xs text-soil sm:text-sm">{farmer.location}</p>
                      <h3 className="editorial-serif text-lg leading-tight text-forest-deep transition-colors duration-500 group-hover:text-forest sm:text-xl">
                        {farmer.name}
                      </h3>
                      <p className="line-clamp-2 min-h-10 text-xs leading-5 text-stone-600 sm:min-h-12 sm:text-sm sm:leading-6">
                        {farmer.specialty || "\u00A0"}
                      </p>
                    </div>
                  </Link>
                  <div className="mt-auto flex w-full justify-center pt-3 sm:pt-4">
                    <FollowFarmerChip
                      farmerId={farmer.farmerId}
                      farmerName={farmer.name}
                    />
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PageSection>
  );
}
