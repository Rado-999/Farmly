"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { FarmerProductsList } from "@/components/products/farmer-products-list";
import { FarmerVideosList } from "@/components/videos/farmer-videos-list";
import { BecomeFarmerButton } from "@/components/profile/become-farmer-button";
import { IncompleteProfileBanner } from "@/components/profile/incomplete-profile-banner";
import { ProfileEditModal } from "@/components/profile/profile-edit-modal";
import { ProfileSkeleton } from "@/components/profile/profile-skeleton";
import { UserAvatar } from "@/components/profile/user-avatar";
import {
  formatUserRole,
  getProfileDisplayName,
  isFarmerUser,
} from "@/lib/auth/profile";
import { formatLocation } from "@/lib/data/formatters";
import { fetchOnboardingProfile } from "@/lib/onboarding/state";
import type { OnboardingProfile } from "@/lib/onboarding/types";
import { createSupabaseClient } from "@/lib/supabase";

function formatMemberSince(createdAt: string | null): string | null {
  if (!createdAt) {
    return null;
  }

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("bg-BG", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function AccountDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-stone-200/70 py-4 last:border-b-0 last:pb-0 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
      <dt className="text-sm font-medium text-stone-500">{label}</dt>
      <dd className="text-sm font-medium text-stone-900">{value}</dd>
    </div>
  );
}

type ProfileViewProps = {
  initialProfile: OnboardingProfile;
  sessionEmail: string | null;
  sessionMetadataName: string | null;
};

export function ProfileView({
  initialProfile,
  sessionEmail,
  sessionMetadataName,
}: ProfileViewProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<OnboardingProfile | null>(initialProfile);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const profileId = initialProfile.id;

  const loadProfile = useCallback(async () => {
    const supabase = createSupabaseClient();

    if (!supabase) {
      setIsProfileLoading(false);
      return;
    }

    setIsProfileLoading(true);
    const nextProfile = await fetchOnboardingProfile(supabase, profileId);
    if (nextProfile) {
      setProfile(nextProfile);
    }
    setIsProfileLoading(false);
  }, [profileId]);

  async function handleSignOut() {
    const supabase = createSupabaseClient();

    if (!supabase) {
      return;
    }

    setIsSigningOut(true);
    await supabase.auth.signOut();
    setIsSigningOut(false);
    router.push("/");
    router.refresh();
  }

  if (isProfileLoading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return <ProfileSkeleton />;
  }

  const displayName = getProfileDisplayName({
    profileName: profile?.name,
    metadataName: sessionMetadataName,
    email: profile?.email ?? sessionEmail,
  });
  const email = profile?.email ?? sessionEmail ?? "Няма информация";
  const memberSince = formatMemberSince(profile?.createdAt ?? null);
  const isFarmer = profile ? isFarmerUser(profile) : false;
  const farmerSlug = profile?.farmerProfile?.slug;
  const showIncompleteBanner = profile && !profile.isProfileComplete;
  const location =
    profile && (profile.city || profile.region)
      ? formatLocation(profile.city, profile.region)
      : "";

  return (
    <div className="page-shell max-w-3xl page-y">
      <div className="animate-[fade-up_0.45s_ease-out] stack-relaxed">
        {showIncompleteBanner ? (
          <IncompleteProfileBanner
            wasSkipped={Boolean(profile.onboardingSkippedAt)}
          />
        ) : null}

        <section className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-end sm:gap-8 sm:text-left lg:gap-10">
          <UserAvatar
            name={displayName}
            avatarUrl={profile?.avatarUrl}
            size="lg"
          />

          <div className="stack-tight">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-forest">
              Вашият акаунт
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
              {displayName}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <p className="inline-flex rounded-full border border-forest/15 bg-forest/8 px-3 py-1 text-sm font-medium text-forest">
                {isFarmer ? "Купувач и фермер" : "Купувач"}
              </p>
              {!profile?.isProfileComplete ? (
                <p className="inline-flex rounded-full border border-amber-300/80 bg-amber-50 px-3 py-1 text-sm font-medium text-amber-900">
                  Непълен профил
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-stone-200/80 bg-white/92 p-6 shadow-[0_22px_52px_-28px_rgba(63,90,58,0.28)] sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">
                Данни за акаунта
              </h2>
              <p className="mt-1 text-sm text-stone-600">
                Една самоличност за разглеждане и отглеждане в Farmly.
              </p>
            </div>
            {profile ? (
              <button
                type="button"
                onClick={() => setIsEditOpen(true)}
                className="inline-flex shrink-0 justify-center rounded-full border border-stone-300/90 bg-white px-4 py-2 text-sm font-medium text-stone-800 transition-[background-color,border-color,color] duration-300 hover:border-forest/35 hover:text-forest"
              >
                Редактирай профила
              </button>
            ) : null}
          </div>

          <dl className="mt-6">
            <AccountDetail label="Име" value={displayName} />
            <AccountDetail label="Имейл" value={email} />
            {location ? (
              <AccountDetail label="Местоположение" value={location} />
            ) : null}
            <AccountDetail
              label="Членство"
              value={isFarmer ? "Купувач с фермерски профил" : "Купувач"}
            />
            {profile?.role ? (
              <AccountDetail label="Роля" value={formatUserRole(profile.role)} />
            ) : null}
            {memberSince ? (
              <AccountDetail label="Член от" value={memberSince} />
            ) : null}
          </dl>
        </section>

        {isFarmer && farmerSlug ? (
          <>
            <section className="rounded-[1.75rem] border border-forest/15 bg-forest/5 p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-stone-900">
                Фермерски профил
              </h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Публичната ви страница е активна. Можете да разглеждате и купувате
                като купувач със същия акаунт.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {profile?.isProfileComplete ? (
                  <Link
                    href="/farmer/products/new"
                    className="inline-flex rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white transition-[background-color] duration-300 hover:bg-[#324a2f]"
                  >
                    Добави продукт
                  </Link>
                ) : (
                  <p className="text-sm text-amber-900">
                    Попълнете профила си, за да добавяте продукти.
                  </p>
                )}
                <Link
                  href={`/farmers/${farmerSlug}`}
                  className="inline-flex rounded-full border border-forest/25 bg-white/80 px-5 py-2.5 text-sm font-medium text-forest transition-[background-color,border-color] duration-300 hover:bg-white"
                >
                  Виж публичната страница
                </Link>
              </div>
            </section>

            {profile?.farmerProfile?.id ? (
              <>
                <section className="rounded-[1.75rem] border border-stone-200/80 bg-white/92 p-6 sm:p-8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-stone-900">
                        Моите видеа
                      </h2>
                      <p className="mt-1 text-sm text-stone-600">
                        Полски истории, които изграждат доверие във вашия профил.
                      </p>
                    </div>
                    {profile?.isProfileComplete ? (
                      <Link
                        href="/farmer/videos/new"
                        className="inline-flex shrink-0 justify-center rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white transition-[background-color] duration-300 hover:bg-[#324a2f]"
                      >
                        Качи видео
                      </Link>
                    ) : null}
                  </div>
                  <div className="mt-5">
                    <FarmerVideosList
                      farmerProfileId={profile.farmerProfile.id}
                      farmerSlug={farmerSlug}
                    />
                  </div>
                </section>

                <section className="rounded-[1.75rem] border border-stone-200/80 bg-white/92 p-6 sm:p-8">
                  <h2 className="text-lg font-semibold text-stone-900">
                    Моите продукти
                  </h2>
                  <p className="mt-1 text-sm text-stone-600">
                    Чернови и публикувани сезонни продукти.
                  </p>
                  <div className="mt-5">
                    <FarmerProductsList
                      farmerProfileId={profile.farmerProfile.id}
                      farmerSlug={farmerSlug}
                    />
                  </div>
                </section>
              </>
            ) : null}
          </>
        ) : (
          <section className="rounded-[1.75rem] border border-dashed border-stone-200/90 bg-stone-50/80 p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-stone-900">Станете фермер</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Споделете историята, продуктите и сезонните си новини без нов акаунт.
              Запазвате пълен достъп като купувач.
            </p>
            <div className="mt-5">
              <BecomeFarmerButton />
            </div>
          </section>
        )}

        <div className="flex flex-col gap-3 border-t border-stone-200/80 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-stone-600">
            Влезли сте като <span className="font-medium text-stone-900">{email}</span>
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/discover"
              className="inline-flex rounded-full border border-stone-300/90 bg-white/85 px-4 py-2 text-sm font-medium text-stone-800 transition-[background-color,border-color,color] duration-300 hover:border-forest/35 hover:text-forest"
            >
              Разгледай фермерите
            </Link>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              disabled={isSigningOut}
              className="inline-flex rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-[background-color,opacity] duration-300 hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSigningOut ? "Излизане..." : "Изход"}
            </button>
          </div>
        </div>
      </div>

      {profile ? (
        <ProfileEditModal
          isOpen={isEditOpen}
          profile={profile}
          displayName={displayName}
          onClose={() => setIsEditOpen(false)}
          onSaved={() => {
            void loadProfile();
            router.refresh();
          }}
        />
      ) : null}
    </div>
  );
}
