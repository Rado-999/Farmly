"use client";

import { useEffect } from "react";

import { useLocale } from "@/components/i18n/language-provider";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import { translate } from "@/lib/i18n/translate";
import type { OnboardingProfile } from "@/lib/onboarding/types";

type ProfileEditModalProps = {
  isOpen: boolean;
  profile: OnboardingProfile;
  displayName: string;
  onClose: () => void;
  onSaved: () => void;
};

export function ProfileEditModal({
  isOpen,
  profile,
  displayName,
  onClose,
  onSaved,
}: ProfileEditModalProps) {
  const { locale } = useLocale();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  function handleSaved() {
    onSaved();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-stone-900/35 p-4 backdrop-blur-sm sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-edit-title"
        className="flex max-h-[min(90vh,820px)] w-full max-w-lg flex-col overflow-hidden rounded-[1.75rem] border border-stone-200/90 bg-cream shadow-[0_28px_60px_-24px_rgba(47,42,36,0.45)] animate-[fade-up_0.35s_ease-out]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 border-b border-stone-200/70 px-6 py-5 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-forest">
                {translate(locale, "Вашият акаунт", "Your account")}
              </p>
              <h2
                id="profile-edit-title"
                className="mt-1 text-xl font-semibold text-stone-900"
              >
                {translate(locale, "Редактирай профила", "Edit profile")}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={translate(locale, "Затвори", "Close")}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-200/90 bg-white text-stone-600 transition-colors hover:border-stone-300 hover:text-stone-900"
            >
              <span aria-hidden>×</span>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-6 py-5 sm:px-8 sm:py-6">
          <ProfileEditForm
            key={`${profile.id}-${profile.avatarUrl ?? "none"}`}
            profile={profile}
            displayName={displayName}
            onSaved={handleSaved}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}
