"use client";

import Image from "next/image";

import { FollowButton } from "@/components/farmers/follow-button";
import { MediaPanel } from "@/components/ui/media-panel";
import { getCurrentSeasonLabel } from "@/lib/farmers/profile-helpers";
import type { FarmerProfile } from "@/lib/farmers/types";

type FarmerProfileOpeningProps = {
  farmer: Pick<
    FarmerProfile,
    | "id"
    | "name"
    | "bio"
    | "location"
    | "coverImage"
    | "profileImage"
    | "farmerProfileId"
    | "products"
    | "videos"
    | "region"
  >;
};

function scrollToFeaturedFilm() {
  document.getElementById("featured-film")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function FarmerAvatar({ farmer }: { farmer: FarmerProfileOpeningProps["farmer"] }) {
  return (
    <MediaPanel
      from={farmer.profileImage.gradientFrom}
      to={farmer.profileImage.gradientTo}
      label={farmer.profileImage.alt}
      imageUrl={farmer.profileImage.imageUrl}
      fit="contain"
      className="h-28 w-28 shrink-0 rounded-[1.75rem] border-4 border-loam-100 shadow-[0_24px_52px_-22px_rgba(47,42,36,0.35)] sm:h-36 sm:w-36 lg:h-40 lg:w-40"
    />
  );
}

function FarmerIdentity({ farmer }: { farmer: FarmerProfileOpeningProps["farmer"] }) {
  const seasonLine = getCurrentSeasonLabel(farmer);
  const metaLine = [farmer.location, seasonLine].filter(Boolean).join(" · ");

  return (
    <div className="min-w-0 flex-1 stack-relaxed">
      {metaLine ? (
        <p className="text-[0.8125rem] font-medium tracking-[0.14em] text-moss-800/90 uppercase">
          {metaLine}
        </p>
      ) : null}

      <h1 className="editorial-serif text-4xl leading-[1.08] font-medium text-moss-900 sm:text-5xl lg:text-[3.35rem]">
        {farmer.name}
      </h1>

      <p className="max-w-2xl text-lg leading-8 text-soil/90 line-clamp-3 sm:text-xl sm:leading-9">
        {farmer.bio ||
          "Производител, който отваря полетата, сезона и ежедневния си ритъм към общността."}
      </p>

      <div className="action-row flex flex-wrap items-center gap-3 pt-1">
        <button
          type="button"
          onClick={scrollToFeaturedFilm}
          className="inline-flex cursor-pointer items-center justify-center rounded-full border border-moss-700/25 bg-moss-700 px-6 py-3 text-sm font-medium text-loam-50 shadow-[0_16px_36px_-20px_rgba(31,48,34,0.55)] transition-[background-color,box-shadow] duration-500 ease-[var(--ease-organic)] hover:bg-moss-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss-700"
        >
          Гледай фермата
        </button>
        <FollowButton
          farmerProfileId={farmer.farmerProfileId}
          farmerName={farmer.name}
          followLabel="Следи този сезон"
          followingLabel="Следиш този сезон"
          size="default"
          className="backdrop-blur-sm"
        />
      </div>
    </div>
  );
}

function ProfileHeader({
  farmer,
  className = "",
}: {
  farmer: FarmerProfileOpeningProps["farmer"];
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col gap-6 sm:gap-8 lg:flex-row lg:items-end lg:gap-10 ${className}`}
    >
      <FarmerAvatar farmer={farmer} />
      <FarmerIdentity farmer={farmer} />
    </div>
  );
}

export function FarmerProfileOpening({ farmer }: FarmerProfileOpeningProps) {
  const coverUrl = farmer.coverImage.imageUrl;

  if (coverUrl) {
    return (
      <section className="relative overflow-hidden border-b border-loam-300/40 bg-loam-100">
        <div className="relative min-h-48 sm:min-h-56 lg:min-h-64">
          <Image
            src={coverUrl}
            alt={farmer.coverImage.alt}
            fill
            priority
            className="object-cover cinematic-ken-burns-slow"
            sizes="100vw"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(26,36,28,0.28)_0%,rgba(26,36,28,0.08)_45%,rgba(243,239,230,0.95)_88%,rgba(243,239,230,1)_100%)]"
          />
        </div>

        <div className="page-shell relative z-10 pb-12 pt-0 sm:pb-14">
          <ProfileHeader farmer={farmer} className="-mt-16 sm:-mt-20" />
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden border-b border-loam-300/40 bg-loam-100">
      <div className="page-shell relative z-10 py-10 sm:py-12 lg:py-14">
        <ProfileHeader farmer={farmer} />
      </div>
    </section>
  );
}
