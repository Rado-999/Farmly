"use client";

import { useState } from "react";

import { AuthInput } from "@/components/auth/auth-input";
import { useLocale } from "@/components/i18n/language-provider";
import { formSelectClassName } from "@/components/ui/form-select";
import { AvatarPhotoPicker } from "@/components/onboarding/avatar-photo-picker";
import { BULGARIA_REGIONS } from "@/lib/onboarding/regions";
import { translate } from "@/lib/i18n/translate";
import type { OnboardingProfile } from "@/lib/onboarding/types";
import { loadSupabaseClient } from "@/lib/supabase/load-client";

type ProfileEditFormProps = {
  profile: OnboardingProfile;
  displayName: string;
  onSaved: () => void;
  onCancel: () => void;
};

export function ProfileEditForm({
  profile,
  displayName,
  onSaved,
  onCancel,
}: ProfileEditFormProps) {
  const { locale } = useLocale();
  const [name, setName] = useState(profile.name ?? "");
  const [city, setCity] = useState(profile.city ?? "");
  const [region, setRegion] = useState(profile.region ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isAdjustingPhoto, setIsAdjustingPhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFarmer =
    profile.role === "farmer" || profile.farmerProfile !== null;

  async function handleSave() {
    setError(null);

    if (isAdjustingPhoto) {
      setError(
        translate(
          locale,
          'Натиснете „Използвай тази снимка“, преди да запазите.',
          'Press "Use this photo" before saving.',
        ),
      );
      return;
    }

    const supabase = await loadSupabaseClient();

    if (!supabase) {
      setError(
        translate(
          locale,
          "Не успяхме да се свържем. Опитайте отново.",
          "We could not connect. Please try again.",
        ),
      );
      return;
    }

    setIsSaving(true);

    const { updateAccountProfile } = await import("@/lib/profile/update-profile");
    const accountResult = await updateAccountProfile(supabase, profile.id, {
      name,
      avatarFile,
      city,
      region,
    });

    setIsSaving(false);

    if (!accountResult.ok) {
      setError(accountResult.error.message);
      return;
    }

    onSaved();
  }

  return (
    <div className="space-y-5">
      {isFarmer ? (
        <AvatarPhotoPicker
          key={profile.avatarUrl ?? "no-avatar"}
          name={name || displayName}
          initialImageUrl={profile.avatarUrl}
          onCroppedFileChange={setAvatarFile}
          onCroppingChange={setIsAdjustingPhoto}
        />
      ) : null}

      <AuthInput
        id="profile-edit-name"
        label={translate(locale, "Вашето име", "Your name")}
        value={name}
        onChange={(event) => setName(event.target.value)}
        autoComplete="name"
        placeholder={translate(locale, "Как да ви поздравим?", "How should we greet you?")}
      />

      <AuthInput
        id="profile-edit-city"
        label={translate(locale, "Град или село", "Town or village")}
        value={city}
        onChange={(event) => setCity(event.target.value)}
        placeholder={translate(locale, "напр. Пловдив", "e.g. Plovdiv")}
      />

      <div className="space-y-2">
        <label
          htmlFor="profile-edit-region"
          className="block text-sm font-medium text-stone-700"
        >
          {translate(locale, "Област в България", "Region in Bulgaria")}
        </label>
        <select
          id="profile-edit-region"
          value={region}
          onChange={(event) => setRegion(event.target.value)}
          className={formSelectClassName}
        >
          <option value="">
            {translate(locale, "Изберете област", "Choose a region")}
          </option>
          {BULGARIA_REGIONS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
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
          onClick={() => void handleSave()}
          disabled={isSaving || isAdjustingPhoto}
          className="inline-flex justify-center rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#324a2f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving
            ? translate(locale, "Запазване...", "Saving...")
            : translate(locale, "Запази промените", "Save changes")}
        </button>
      </div>
    </div>
  );
}
