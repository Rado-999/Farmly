"use client";

import { useState } from "react";

import { AuthInput } from "@/components/auth/auth-input";
import { formSelectClassName } from "@/components/ui/form-select";
import { AvatarPhotoPicker } from "@/components/onboarding/avatar-photo-picker";
import { CoverPhotoPicker } from "@/components/profile/cover-photo-picker";
import { OnboardingTextarea } from "@/components/onboarding/onboarding-textarea";
import { BULGARIA_REGIONS } from "@/lib/onboarding/regions";
import type { OnboardingProfile } from "@/lib/onboarding/types";
import {
  updateAccountProfile,
  updateFarmerDetails,
} from "@/lib/profile/update-profile";
import { createSupabaseClient } from "@/lib/supabase";

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
  const [name, setName] = useState(profile.name ?? "");
  const [city, setCity] = useState(profile.city ?? "");
  const [region, setRegion] = useState(profile.region ?? "");
  const [bio, setBio] = useState(profile.farmerProfile?.bio ?? "");
  const [story, setStory] = useState(profile.farmerProfile?.story ?? "");
  const [philosophy, setPhilosophy] = useState(
    profile.farmerProfile?.philosophy ?? "",
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isAdjustingPhoto, setIsAdjustingPhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFarmer =
    profile.role === "farmer" || profile.farmerProfile !== null;

  async function handleSave() {
    setError(null);

    if (isAdjustingPhoto) {
      setError('Натиснете „Използвай тази снимка“, преди да запазите.');
      return;
    }

    const supabase = createSupabaseClient();

    if (!supabase) {
      setError("Не успяхме да се свържем. Опитайте отново.");
      return;
    }

    setIsSaving(true);

    const accountResult = await updateAccountProfile(supabase, profile.id, {
      name,
      avatarFile,
      city,
      region,
    });

    if (!accountResult.ok) {
      setIsSaving(false);
      setError(accountResult.message);
      return;
    }

    if (isFarmer) {
      const farmerResult = await updateFarmerDetails(supabase, profile.id, {
        bio,
        story,
        philosophy,
        coverFile,
      });

      if (!farmerResult.ok) {
        setIsSaving(false);
        setError(farmerResult.message);
        return;
      }
    }

    setIsSaving(false);
    onSaved();
  }

  return (
    <div className="space-y-5">
      <AvatarPhotoPicker
        key={profile.avatarUrl ?? "no-avatar"}
        name={name || displayName}
        initialImageUrl={profile.avatarUrl}
        onCroppedFileChange={setAvatarFile}
        onCroppingChange={setIsAdjustingPhoto}
      />

      <AuthInput
        id="profile-edit-name"
        label="Вашето име"
        value={name}
        onChange={(event) => setName(event.target.value)}
        autoComplete="name"
        placeholder="Как да ви поздравим?"
      />

      <AuthInput
        id="profile-edit-city"
        label="Град или село"
        value={city}
        onChange={(event) => setCity(event.target.value)}
        placeholder="напр. Пловдив"
      />

      <div className="space-y-2">
        <label
          htmlFor="profile-edit-region"
          className="block text-sm font-medium text-stone-700"
        >
          Област в България
        </label>
        <select
          id="profile-edit-region"
          value={region}
          onChange={(event) => setRegion(event.target.value)}
          className={formSelectClassName}
        >
          <option value="">Изберете област</option>
          {BULGARIA_REGIONS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {isFarmer ? (
        <div className="space-y-4 border-t border-stone-200/70 pt-5">
          <CoverPhotoPicker
            key={profile.farmerProfile?.coverImageUrl ?? "no-cover"}
            initialImageUrl={profile.farmerProfile?.coverImageUrl}
            onFileChange={setCoverFile}
          />
          <p className="text-sm font-medium text-stone-700">Фермерска история</p>
          <OnboardingTextarea
            id="profile-edit-bio"
            label="Кратко представяне на фермата"
            value={bio}
            onChange={setBio}
            placeholder="Кратко представяне на фермата ви"
          />
          <OnboardingTextarea
            id="profile-edit-story"
            label="Фермерска история"
            value={story}
            onChange={setStory}
            placeholder="Как започна фермата ви?"
            rows={4}
          />
          <OnboardingTextarea
            id="profile-edit-philosophy"
            label="Философия"
            value={philosophy}
            onChange={setPhilosophy}
            placeholder="Какви принципи насочват начина, по който отглеждате храна?"
          />
        </div>
      ) : null}

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
          Отказ
        </button>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving || isAdjustingPhoto}
          className="inline-flex justify-center rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#324a2f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Запазване..." : "Запази промените"}
        </button>
      </div>
    </div>
  );
}
