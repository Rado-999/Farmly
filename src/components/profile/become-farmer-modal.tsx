"use client";

import { useEffect } from "react";

import { useLocale } from "@/components/i18n/language-provider";
import { FarmerProfileSetupForm } from "@/components/profile/farmer-profile-setup-form";
import { translate } from "@/lib/i18n/translate";
import type { OnboardingProfile } from "@/lib/onboarding/types";

type BecomeFarmerModalProps = {
  isOpen: boolean;
  profile: OnboardingProfile;
  displayName: string;
  isSaving?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (values: {
    avatarFile: File | null;
    coverFile: File | null;
    bio: string;
    story: string;
    philosophy: string;
  }) => void;
};

export function BecomeFarmerModal({
  isOpen,
  profile,
  displayName,
  isSaving = false,
  error = null,
  onClose,
  onSubmit,
}: BecomeFarmerModalProps) {
  const { locale } = useLocale();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSaving) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, isSaving, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-stone-900/35 p-4 backdrop-blur-sm sm:items-center"
      role="presentation"
      onClick={isSaving ? undefined : onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="become-farmer-title"
        className="flex max-h-[min(90vh,820px)] w-full max-w-lg flex-col overflow-hidden rounded-[1.75rem] border border-stone-200/90 bg-cream shadow-[0_28px_60px_-24px_rgba(47,42,36,0.45)] animate-[fade-up_0.35s_ease-out]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 border-b border-stone-200/70 px-6 py-5 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-forest">
                {translate(locale, "Фермерски профил", "Farmer profile")}
              </p>
              <h2
                id="become-farmer-title"
                className="mt-1 text-xl font-semibold text-stone-900"
              >
                {translate(locale, "Станете фермер", "Become a farmer")}
              </h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                {translate(
                  locale,
                  "Представете фермата си със снимка, корица и кратка история. След това ще довършите останалите детайли.",
                  "Introduce your farm with a photo, cover image, and short story. You will finish the remaining details next.",
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              aria-label={translate(locale, "Затвори", "Close")}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-200/90 bg-white text-stone-600 transition-colors hover:border-stone-300 hover:text-stone-900 disabled:opacity-60"
            >
              <span aria-hidden>×</span>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-6 py-5 sm:px-8 sm:py-6">
          <FarmerProfileSetupForm
            displayName={displayName}
            initialAvatarUrl={profile.avatarUrl}
            initialCoverImageUrl={profile.farmerProfile?.coverImageUrl}
            initialBio={profile.farmerProfile?.bio ?? ""}
            initialStory={profile.farmerProfile?.story ?? ""}
            initialPhilosophy={profile.farmerProfile?.philosophy ?? ""}
            requireAvatar
            submitLabel={translate(locale, "Създай фермерски профил", "Create farmer profile")}
            isSaving={isSaving}
            error={error}
            onSubmit={onSubmit}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}
