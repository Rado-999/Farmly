"use client";

import { useState } from "react";

import { useLocale } from "@/components/i18n/language-provider";
import { AvatarPhotoPicker } from "@/components/onboarding/avatar-photo-picker";
import { OnboardingTextarea } from "@/components/onboarding/onboarding-textarea";
import { CoverPhotoPicker } from "@/components/profile/cover-photo-picker";
import { translate } from "@/lib/i18n/translate";

type FarmerProfileSetupFormProps = {
  displayName: string;
  initialAvatarUrl?: string | null;
  initialCoverImageUrl?: string | null;
  initialBio?: string;
  initialStory?: string;
  initialPhilosophy?: string;
  requireAvatar?: boolean;
  submitLabel: string;
  isSaving?: boolean;
  error?: string | null;
  onSubmit: (values: {
    avatarFile: File | null;
    coverFile: File | null;
    bio: string;
    story: string;
    philosophy: string;
  }) => void;
  onCancel: () => void;
};

export function FarmerProfileSetupForm({
  displayName,
  initialAvatarUrl = null,
  initialCoverImageUrl = null,
  initialBio = "",
  initialStory = "",
  initialPhilosophy = "",
  requireAvatar = false,
  submitLabel,
  isSaving = false,
  error = null,
  onSubmit,
  onCancel,
}: FarmerProfileSetupFormProps) {
  const { locale } = useLocale();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [bio, setBio] = useState(initialBio);
  const [story, setStory] = useState(initialStory);
  const [philosophy, setPhilosophy] = useState(initialPhilosophy);
  const [isAdjustingPhoto, setIsAdjustingPhoto] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleSubmit() {
    setValidationError(null);

    if (isAdjustingPhoto) {
      setValidationError(
        translate(
          locale,
          'Натиснете „Използвай тази снимка“, преди да продължите.',
          'Press "Use this photo" before continuing.',
        ),
      );
      return;
    }

    if (requireAvatar && !avatarFile && !initialAvatarUrl) {
      setValidationError(
        translate(
          locale,
          "Моля, добавете профилна снимка.",
          "Please add a profile photo.",
        ),
      );
      return;
    }

    if (!bio.trim() || !story.trim() || !philosophy.trim()) {
      setValidationError(
        translate(
          locale,
          "Моля, попълнете представянето, историята и философията на фермата.",
          "Please fill in your farm introduction, story, and philosophy.",
        ),
      );
      return;
    }

    onSubmit({ avatarFile, coverFile, bio, story, philosophy });
  }

  const resolvedError = validationError ?? error;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-sm font-medium text-stone-700">
          {translate(locale, "Профилна снимка", "Profile photo")}
        </p>
        <AvatarPhotoPicker
          key={initialAvatarUrl ?? "no-avatar"}
          name={displayName}
          initialImageUrl={initialAvatarUrl}
          onCroppedFileChange={setAvatarFile}
          onCroppingChange={setIsAdjustingPhoto}
        />
      </div>

      <CoverPhotoPicker
        key={initialCoverImageUrl ?? "no-cover"}
        initialImageUrl={initialCoverImageUrl}
        onFileChange={setCoverFile}
      />

      <OnboardingTextarea
        id="farmer-setup-bio"
        label={translate(locale, "Кратко представяне на фермата", "Short farm introduction")}
        value={bio}
        onChange={setBio}
        placeholder={translate(
          locale,
          "Кратко представяне на фермата ви",
          "A short introduction to your farm",
        )}
      />

      <OnboardingTextarea
        id="farmer-setup-story"
        label={translate(locale, "Фермерска история", "Farmer story")}
        value={story}
        onChange={setStory}
        placeholder={translate(
          locale,
          "Как започна фермата ви?",
          "How did your farm begin?",
        )}
        rows={4}
      />

      <OnboardingTextarea
        id="farmer-setup-philosophy"
        label={translate(locale, "Философия", "Philosophy")}
        value={philosophy}
        onChange={setPhilosophy}
        placeholder={translate(
          locale,
          "Какви принципи насочват начина, по който отглеждате храна?",
          "What principles guide the way you grow food?",
        )}
      />

      {resolvedError ? (
        <p
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {resolvedError}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 border-t border-stone-200/70 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="inline-flex justify-center rounded-full border border-stone-300/90 bg-white px-5 py-2.5 text-sm font-medium text-stone-800 transition-colors hover:border-forest/35 hover:text-forest disabled:opacity-60"
        >
          {translate(locale, "Отказ", "Cancel")}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving || isAdjustingPhoto}
          className="inline-flex justify-center rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#324a2f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving
            ? translate(locale, "Запазване...", "Saving...")
            : submitLabel}
        </button>
      </div>
    </div>
  );
}
