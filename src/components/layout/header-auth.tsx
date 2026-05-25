"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ProfileImage } from "@/components/ui/profile-image";
import { PROFILE_PATH } from "@/lib/auth/constants";
import {
  getProfileDisplayName,
  getProfileInitials,
} from "@/lib/auth/profile";
import { useUserProfile } from "@/lib/auth/use-user-profile";

const loginLinkClassName =
  "inline-flex rounded-full px-3 py-2 text-sm font-medium text-stone-600 transition-[background-color,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-stone-100/90 hover:text-stone-900";

const joinLinkClassName =
  "story-link story-link--no-arrow text-sm text-forest hover:text-forest-deep";

const navActionClassName =
  "inline-flex h-10 items-center gap-2 rounded-full border border-stone-200/90 bg-white/80 px-3 text-sm font-medium text-stone-800 shadow-[0_8px_18px_-16px_rgba(47,42,36,0.16)] transition-[background-color,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-forest/30 hover:bg-white hover:shadow-[0_14px_28px_-14px_rgba(63,90,58,0.2)]";

/** Visible pending state — old skeleton looked like broken empty buttons. */
function AuthHeaderPending() {
  return (
    <div
      className="flex min-h-9 items-center gap-3"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="inline-flex h-2 w-2 shrink-0 animate-pulse rounded-full bg-forest/50" />
      <span className="text-sm font-medium text-stone-600">
        Проверка на акаунта…
      </span>
    </div>
  );
}

function ProfileAvatar({
  label,
  initials,
  avatarUrl,
}: {
  label: string;
  initials: string;
  avatarUrl?: string | null;
}) {
  if (avatarUrl) {
    return (
      <ProfileImage
        src={avatarUrl}
        alt={label}
        decorative
        shape="circle"
        className="h-8 w-8 shrink-0 ring-1 ring-stone-200/80"
      />
    );
  }

  return (
    <span
      aria-hidden
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest/12 text-xs font-semibold text-forest"
    >
      <span className="sr-only">{label}</span>
      {initials}
    </span>
  );
}

export function HeaderAuth() {
  const pathname = usePathname();
  const {
    authState,
    status: profileStatus,
    profile,
    isFarmer,
  } = useUserProfile();

  if (authState.status === "loading") {
    return <AuthHeaderPending />;
  }

  if (authState.status === "authenticated") {
    const displayName = getProfileDisplayName({
      profileName: profile?.name,
      metadataName:
        typeof authState.user.user_metadata?.full_name === "string"
          ? authState.user.user_metadata.full_name
          : null,
      email: profile?.email ?? authState.user.email,
    });
    const initials = getProfileInitials(displayName);
    const isProfileActive = pathname === PROFILE_PATH;
    const farmerSlug = profile?.farmerProfile?.slug;
    const farmerPageHref = farmerSlug ? `/farmers/${farmerSlug}` : null;
    const isFarmerPageActive =
      farmerPageHref !== null && pathname === farmerPageHref;

    return (
      <div className="flex items-center gap-2">
        {profileStatus !== "loading" && isFarmer && farmerPageHref ? (
          <Link
            href={farmerPageHref}
            aria-current={isFarmerPageActive ? "page" : undefined}
            className={`${navActionClassName} ${
              isFarmerPageActive ? "border-forest/35 bg-white text-forest" : ""
            }`}
          >
            Моята ферма
          </Link>
        ) : null}

        <Link
          href={PROFILE_PATH}
          aria-current={isProfileActive ? "page" : undefined}
          className={`${navActionClassName} ${
            isProfileActive ? "border-forest/35 bg-white text-forest" : ""
          }`}
          title={`Влезли сте като ${displayName}`}
        >
          <ProfileAvatar
            label={displayName}
            initials={initials}
            avatarUrl={profile?.avatarUrl}
          />
          <span>Профил</span>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link href="/login" className={loginLinkClassName}>
        Вход
      </Link>
      <Link href="/signup" className={joinLinkClassName}>
        Регистрация
      </Link>
    </>
  );
}
