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

export function FarmerProfileOpening({ farmer }: FarmerProfileOpeningProps) {
  const coverUrl = farmer.coverImage.imageUrl;
  const seasonLine = getCurrentSeasonLabel(farmer);
  const metaLine = [farmer.location, seasonLine].filter(Boolean).join(" · ");

  return (
    <section className="relative overflow-hidden border-b border-loam-300/40 bg-loam-100">
      <div className="relative min-h-[min(72vh,40rem)] w-full">
        {coverUrl ? (
          <>
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
              className="absolute inset-0 bg-[linear-gradient(180deg,rgba(26,36,28,0.35)_0%,rgba(26,36,28,0.12)_42%,rgba(247,243,234,0.92)_88%,rgba(247,243,234,1)_100%)]"
            />
          </>
        ) : (
          <MediaPanel
            from={farmer.coverImage.gradientFrom}
            to={farmer.coverImage.gradientTo}
            label={farmer.coverImage.alt}
            className="absolute inset-0 min-h-full rounded-none"
          />
        )}

        <div className="page-shell relative z-10 flex min-h-[min(72vh,40rem)] flex-col justify-end pb-12 pt-28 sm:pb-16 sm:pt-32">
          <div className="max-w-3xl stack-relaxed">
            {metaLine ? (
              <p className="text-[0.8125rem] font-medium tracking-[0.14em] text-moss-800/90 uppercase">
                {metaLine}
              </p>
            ) : null}

            <h1 className="editorial-serif text-4xl leading-[1.08] font-medium text-moss-900 sm:text-5xl lg:text-[3.35rem]">
              {farmer.name}
            </h1>

            <p className="max-w-2xl text-lg leading-8 text-soil/90 line-clamp-2 sm:text-xl sm:leading-9">
              {farmer.bio ||
                "Производител, който отваря полетата, сезона и ежедневния си ритъм към общността."}
            </p>

            <div className="action-row flex flex-wrap items-center gap-3 pt-2">
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
        </div>
      </div>
    </section>
  );
}
