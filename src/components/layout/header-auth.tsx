"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useLocale } from "@/components/i18n/language-provider";
import { ProfileImage } from "@/components/ui/profile-image";
import { PROFILE_PATH } from "@/lib/auth/constants";
import { getProfileInitials } from "@/lib/auth/profile";
import { translate } from "@/lib/i18n/translate";
import type { LayoutViewer } from "@/lib/auth/viewer";

const loginLinkClassName =
  "inline-flex rounded-full px-3 py-2 text-sm font-medium text-stone-600 transition-[background-color,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-stone-100/90 hover:text-stone-900";

const joinLinkClassName =
  "story-link story-link--no-arrow text-sm text-forest hover:text-forest-deep";

const navActionClassName =
  "inline-flex h-10 items-center gap-2 rounded-full border border-stone-200/90 bg-white/80 px-3 text-sm font-medium text-stone-800 shadow-[0_8px_18px_-16px_rgba(47,42,36,0.16)] transition-[background-color,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-forest/30 hover:bg-white hover:shadow-[0_14px_28px_-14px_rgba(63,90,58,0.2)]";

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

export function HeaderAuth({ viewer }: { viewer: LayoutViewer }) {
  const pathname = usePathname();
  const { locale } = useLocale();

  if (viewer.status === "authenticated") {
    const displayName = viewer.displayName;
    const initials = getProfileInitials(displayName);
    const isProfileActive = pathname === PROFILE_PATH;
    const farmerPageHref = viewer.farmerPageHref;
    const isFarmerPageActive =
      farmerPageHref !== null && pathname === farmerPageHref;

    return (
      <div className="flex items-center gap-2">
        {farmerPageHref ? (
          <Link
            href={farmerPageHref}
            aria-current={isFarmerPageActive ? "page" : undefined}
            className={`${navActionClassName} ${
              isFarmerPageActive ? "border-forest/35 bg-white text-forest" : ""
            }`}
          >
            {translate(locale, "Моята ферма", "My farm")}
          </Link>
        ) : null}

        <Link
          href={PROFILE_PATH}
          aria-current={isProfileActive ? "page" : undefined}
          className={`${navActionClassName} ${
            isProfileActive ? "border-forest/35 bg-white text-forest" : ""
          }`}
          title={translate(
            locale,
            `Влезли сте като ${displayName}`,
            `Signed in as ${displayName}`,
          )}
        >
          <ProfileAvatar
            label={displayName}
            initials={initials}
            avatarUrl={viewer.avatarUrl}
          />
          <span>{translate(locale, "Профил", "Profile")}</span>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link href="/login" className={loginLinkClassName}>
        {translate(locale, "Вход", "Log in")}
      </Link>
      <Link href="/signup" className={joinLinkClassName}>
        {translate(locale, "Регистрация", "Sign up")}
      </Link>
    </>
  );
}
