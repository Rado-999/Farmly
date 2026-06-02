"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { useLocale } from "@/components/i18n/language-provider";
import { BecomeFarmerButton } from "@/components/profile/become-farmer-button";
import { IncompleteProfileBanner } from "@/components/profile/incomplete-profile-banner";
import { ProfileSkeleton } from "@/components/profile/profile-skeleton";
import { UserAvatar } from "@/components/profile/user-avatar";
import {
  formatUserRole,
  getProfileDisplayName,
  isFarmerUser,
} from "@/lib/auth/profile";
import { formatLocation } from "@/lib/data/formatters";
import { getLocaleDateFormat } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/translate";
import { fetchOnboardingProfile } from "@/lib/onboarding/state";
import type { OnboardingProfile } from "@/lib/onboarding/types";
import type { ProfileRelationshipCounts } from "@/lib/marketplace/relationship-counts";
import { loadSupabaseClient } from "@/lib/supabase/load-client";
import { VillageRelationshipStats } from "@/components/village/village-relationship-stats";

const ProfileEditModal = dynamic(
  () =>
    import("@/components/profile/profile-edit-modal").then(
      (module) => module.ProfileEditModal,
    ),
  { ssr: false },
);

const FarmerVideosList = dynamic(
  () =>
    import("@/components/videos/farmer-videos-list").then(
      (module) => module.FarmerVideosList,
    ),
  { loading: () => <p className="text-sm text-stone-500">Зареждане на видеа...</p> },
);

const FarmerProductsList = dynamic(
  () =>
    import("@/components/products/farmer-products-list").then(
      (module) => module.FarmerProductsList,
    ),
  { loading: () => <p className="text-sm text-stone-500">Зареждане на продукти...</p> },
);

function formatMemberSince(
  createdAt: string | null,
  locale: "bg" | "en",
): string | null {
  if (!createdAt) {
    return null;
  }

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(getLocaleDateFormat(locale), {
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
  relationshipCounts: ProfileRelationshipCounts;
};

export function ProfileView({
  initialProfile,
  sessionEmail,
  sessionMetadataName,
  relationshipCounts,
}: ProfileViewProps) {
  const router = useRouter();
  const { locale } = useLocale();
  const [profile, setProfile] = useState<OnboardingProfile | null>(initialProfile);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const profileId = initialProfile.id;

  const loadProfile = useCallback(async () => {
    const supabase = await loadSupabaseClient();

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
    const supabase = await loadSupabaseClient();

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
    locale,
  });
  const email =
    profile?.email ??
    sessionEmail ??
    translate(locale, "Няма информация", "No information");
  const memberSince = formatMemberSince(profile?.createdAt ?? null, locale);
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
              {translate(locale, "Вашият акаунт", "Your account")}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
              {displayName}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <p className="inline-flex rounded-full border border-forest/15 bg-forest/8 px-3 py-1 text-sm font-medium text-forest">
                {isFarmer
                  ? translate(locale, "Купувач и фермер", "Buyer and farmer")
                  : translate(locale, "Купувач", "Buyer")}
              </p>
              {!profile?.isProfileComplete ? (
                <p className="inline-flex rounded-full border border-amber-300/80 bg-amber-50 px-3 py-1 text-sm font-medium text-amber-900">
                  {translate(locale, "Непълен профил", "Incomplete profile")}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-stone-200/80 bg-white/92 p-6 shadow-[0_22px_52px_-28px_rgba(63,90,58,0.28)] sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">
                {translate(locale, "Моето село", "My village")}
              </h2>
              <p className="mt-1 text-sm text-stone-600">
                {translate(
                  locale,
                  "Ферми, които следиш или си запазил за по-късно.",
                  "Farms you follow or saved for later.",
                )}
              </p>
              <VillageRelationshipStats
                locale={locale}
                followingCount={relationshipCounts.followingCount}
                savedCount={relationshipCounts.savedCount}
                followerCount={relationshipCounts.followerCount}
                className="mt-4 justify-start"
              />
            </div>
            <Link
              href="/village"
              className="inline-flex shrink-0 justify-center rounded-full border border-forest/25 bg-white/80 px-4 py-2 text-sm font-medium text-forest transition-[background-color,border-color] duration-300 hover:bg-white"
            >
              {translate(locale, "Отвори Моето село", "Open My village")}
            </Link>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-stone-200/80 bg-white/92 p-6 shadow-[0_22px_52px_-28px_rgba(63,90,58,0.28)] sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">
                {translate(locale, "Данни за акаунта", "Account details")}
              </h2>
              <p className="mt-1 text-sm text-stone-600">
                {translate(
                  locale,
                  "Една самоличност за разглеждане и отглеждане в Farmly.",
                  "One identity for browsing and growing on Farmly.",
                )}
              </p>
            </div>
            {profile ? (
              <button
                type="button"
                onClick={() => setIsEditOpen(true)}
                className="inline-flex shrink-0 justify-center rounded-full border border-stone-300/90 bg-white px-4 py-2 text-sm font-medium text-stone-800 transition-[background-color,border-color,color] duration-300 hover:border-forest/35 hover:text-forest"
              >
                {translate(locale, "Редактирай профила", "Edit profile")}
              </button>
            ) : null}
          </div>

          <dl className="mt-6">
            <AccountDetail
              label={translate(locale, "Име", "Name")}
              value={displayName}
            />
            <AccountDetail
              label={translate(locale, "Имейл", "Email")}
              value={email}
            />
            {location ? (
              <AccountDetail
                label={translate(locale, "Местоположение", "Location")}
                value={location}
              />
            ) : null}
            <AccountDetail
              label={translate(locale, "Членство", "Membership")}
              value={
                isFarmer
                  ? translate(
                      locale,
                      "Купувач с фермерски профил",
                      "Buyer with farmer profile",
                    )
                  : translate(locale, "Купувач", "Buyer")
              }
            />
            {profile?.role ? (
              <AccountDetail
                label={translate(locale, "Роля", "Role")}
                value={formatUserRole(profile.role, locale)}
              />
            ) : null}
            {memberSince ? (
              <AccountDetail
                label={translate(locale, "Член от", "Member since")}
                value={memberSince}
              />
            ) : null}
          </dl>
        </section>

        {isFarmer && farmerSlug ? (
          <>
            <section className="rounded-[1.75rem] border border-forest/15 bg-forest/5 p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-stone-900">
                {translate(locale, "Фермерски профил", "Farmer profile")}
              </h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                {translate(
                  locale,
                  "Публичната ви страница е активна. Можете да разглеждате и купувате като купувач със същия акаунт.",
                  "Your public page is active. You can still browse and buy as a buyer with the same account.",
                )}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {profile?.isProfileComplete ? (
                  <Link
                    href="/farmer/products/new"
                    className="inline-flex rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white transition-[background-color] duration-300 hover:bg-[#324a2f]"
                  >
                    {translate(locale, "Добави продукт", "Add product")}
                  </Link>
                ) : (
                  <p className="text-sm text-amber-900">
                    {translate(
                      locale,
                      "Попълнете профила си, за да добавяте продукти.",
                      "Complete your profile to add products.",
                    )}
                  </p>
                )}
                <Link
                  href={`/farmers/${farmerSlug}`}
                  className="inline-flex rounded-full border border-forest/25 bg-white/80 px-5 py-2.5 text-sm font-medium text-forest transition-[background-color,border-color] duration-300 hover:bg-white"
                >
                  {translate(locale, "Виж публичната страница", "View public page")}
                </Link>
              </div>
            </section>

            {profile?.farmerProfile?.id ? (
              <>
                <section className="rounded-[1.75rem] border border-stone-200/80 bg-white/92 p-6 sm:p-8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-stone-900">
                        {translate(locale, "Моите видеа", "My videos")}
                      </h2>
                      <p className="mt-1 text-sm text-stone-600">
                        {translate(
                          locale,
                          "Полски истории, които изграждат доверие във вашия профил.",
                          "Field stories that build trust in your profile.",
                        )}
                      </p>
                    </div>
                    {profile?.isProfileComplete ? (
                      <Link
                        href="/farmer/videos/new"
                        className="inline-flex shrink-0 justify-center rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white transition-[background-color] duration-300 hover:bg-[#324a2f]"
                      >
                        {translate(locale, "Качи видео", "Upload video")}
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
                    {translate(locale, "Моите продукти", "My products")}
                  </h2>
                  <p className="mt-1 text-sm text-stone-600">
                    {translate(
                      locale,
                      "Чернови и публикувани сезонни продукти.",
                      "Draft and published seasonal products.",
                    )}
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
            <h2 className="text-lg font-semibold text-stone-900">
              {translate(locale, "Станете фермер", "Become a farmer")}
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              {translate(
                locale,
                "Споделете историята, продуктите и сезонните си новини без нов акаунт. Запазвате пълен достъп като купувач.",
                "Share your story, products, and seasonal updates without creating a new account. You keep full access as a buyer.",
              )}
            </p>
            <div className="mt-5">
              <BecomeFarmerButton />
            </div>
          </section>
        )}

        <div className="flex flex-col gap-3 border-t border-stone-200/80 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-stone-600">
            {translate(locale, "Влезли сте като ", "Signed in as ")}
            <span className="font-medium text-stone-900">{email}</span>
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/discover"
              className="inline-flex rounded-full border border-stone-300/90 bg-white/85 px-4 py-2 text-sm font-medium text-stone-800 transition-[background-color,border-color,color] duration-300 hover:border-forest/35 hover:text-forest"
            >
              {translate(locale, "Разгледай фермерите", "Browse farmers")}
            </Link>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              disabled={isSigningOut}
              className="inline-flex rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-[background-color,opacity] duration-300 hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSigningOut
                ? translate(locale, "Излизане...", "Signing out...")
                : translate(locale, "Изход", "Sign out")}
            </button>
          </div>
        </div>
      </div>

      {profile && isEditOpen ? (
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
