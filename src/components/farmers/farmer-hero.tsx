import Image from "next/image";

import { FarmerHeroActions } from "@/components/farmers/farmer-hero-actions";
import { FarmerMeta } from "@/components/farmers/farmer-meta";
import { MediaPanel } from "@/components/ui/media-panel";
import type { FarmerProfile } from "@/lib/farmers/types";

type FarmerHeroProps = {
  farmer: Pick<
    FarmerProfile,
    | "name"
    | "location"
    | "bio"
    | "experienceYears"
    | "profileImage"
    | "coverImage"
    | "farmerProfileId"
  >;
};

function FarmerIdentity({
  farmer,
  className = "",
}: {
  farmer: FarmerHeroProps["farmer"];
  className?: string;
}) {
  return (
    <div className={`max-w-3xl stack ${className}`}>
      <FarmerMeta
        location={farmer.location}
        experienceYears={farmer.experienceYears}
      />
      <div className="space-y-4">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-forest">
          Фермерски профил
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl lg:text-[3.35rem] lg:leading-[1.05]">
          {farmer.name}
        </h1>
        {farmer.bio ? (
          <p className="max-w-2xl text-lg leading-8 text-stone-600 sm:text-xl sm:leading-9">
            {farmer.bio}
          </p>
        ) : (
          <p className="max-w-2xl text-lg leading-8 text-stone-500 sm:text-xl sm:leading-9">
            Производител, който отваря полетата, сезона и ежедневния си ритъм
            към общността.
          </p>
        )}
        <FarmerHeroActions
          farmerProfileId={farmer.farmerProfileId}
          farmerName={farmer.name}
        />
      </div>
    </div>
  );
}

function FarmerAvatar({ farmer }: { farmer: FarmerHeroProps["farmer"] }) {
  return (
    <MediaPanel
      from={farmer.profileImage.gradientFrom}
      to={farmer.profileImage.gradientTo}
      label={farmer.profileImage.alt}
      imageUrl={farmer.profileImage.imageUrl}
      fit="contain"
      className="h-32 w-32 shrink-0 rounded-[1.9rem] border-[5px] border-cream shadow-[0_24px_52px_-22px_rgba(47,42,36,0.35)] sm:h-40 sm:w-40 lg:h-44 lg:w-44"
    />
  );
}

export function FarmerHero({ farmer }: FarmerHeroProps) {
  const coverUrl = farmer.coverImage.imageUrl;

  if (coverUrl) {
    return (
      <section className="relative overflow-hidden border-b border-stone-200/70 bg-cream">
        <div className="relative min-h-48 sm:min-h-60 lg:min-h-72">
          <Image
            src={coverUrl}
            alt={farmer.coverImage.alt}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(31,48,34,0.18)_0%,rgba(247,243,234,0.08)_45%,rgba(247,243,234,1)_100%)]"
          />
        </div>

        <div className="page-shell relative z-10 pb-12 pt-0 sm:pb-14 lg:pb-16">
          <div className="-mt-20 flex flex-col gap-8 sm:-mt-24 lg:flex-row lg:items-end lg:gap-10">
            <FarmerAvatar farmer={farmer} />
            <FarmerIdentity farmer={farmer} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden border-b border-stone-200/70 bg-cream">
      <div aria-hidden className="ambient-glow pointer-events-none" />

      <div className="page-shell relative z-10 py-10 sm:py-12 lg:py-14">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:gap-10">
          <FarmerAvatar farmer={farmer} />
          <FarmerIdentity farmer={farmer} />
        </div>
      </div>
    </section>
  );
}
