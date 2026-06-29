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
      className="h-28 w-28 shrink-0 rounded-[1.75rem] border-4 border-loam-100 bg-loam-100 shadow-[0_24px_52px_-22px_rgba(47,42,36,0.35)] sm:h-32 sm:w-32 lg:h-36 lg:w-36"
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

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pt-1">
        <button
          type="button"
          onClick={scrollToFeaturedFilm}
          className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-moss-700/25 bg-moss-700 px-6 py-3 text-sm font-medium text-loam-50 shadow-[0_16px_36px_-20px_rgba(31,48,34,0.55)] transition-[background-color,box-shadow] duration-500 ease-[var(--ease-organic)] hover:bg-moss-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss-700"
        >
          Гледай фермата
        </button>
        <FollowButton
          farmerProfileId={farmer.farmerProfileId}
          farmerName={farmer.name}
          followLabel="Добави в селото"
          followingLabel="В селото ти"
          size="hero"
          noticeLayout="below"
        />
      </div>
    </div>
  );
}

function ProfileBody({ farmer }: { farmer: FarmerProfileOpeningProps["farmer"] }) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8 lg:gap-10">
      <div className="shrink-0 self-center sm:self-start sm:-mt-14 lg:-mt-16">
        <FarmerAvatar farmer={farmer} />
      </div>
      <div className="min-w-0 flex-1 pt-1 sm:pt-6">
        <FarmerIdentity farmer={farmer} />
      </div>
    </div>
  );
}

export function FarmerProfileOpening({ farmer }: FarmerProfileOpeningProps) {
  const coverUrl = farmer.coverImage.imageUrl;

  if (coverUrl) {
    return (
      <section className="border-b border-loam-300/40 bg-loam-100">
        <div className="relative aspect-[21/9] w-full min-h-[11rem] max-h-[18rem] overflow-hidden sm:min-h-[13rem] sm:max-h-[20rem]">
          <Image
            src={coverUrl}
            alt={farmer.coverImage.alt}
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(26,36,28,0.18)_0%,rgba(26,36,28,0.04)_55%,rgba(243,239,230,1)_100%)]"
          />
        </div>

        <div className="page-shell pb-12 pt-2 sm:pb-14 sm:pt-0">
          <ProfileBody farmer={farmer} />
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-loam-300/40 bg-loam-100">
      <div className="page-shell py-10 sm:py-12 lg:py-14">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-8 lg:gap-10">
          <FarmerAvatar farmer={farmer} />
          <FarmerIdentity farmer={farmer} />
        </div>
      </div>
    </section>
  );
}
