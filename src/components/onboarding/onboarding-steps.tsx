"use client";

import { useState } from "react";

import { AvatarPhotoPicker } from "@/components/onboarding/avatar-photo-picker";
import { AuthInput } from "@/components/auth/auth-input";
import { formSelectClassName } from "@/components/ui/form-select";
import { OnboardingTextarea } from "@/components/onboarding/onboarding-textarea";
import { ProfileImage } from "@/components/ui/profile-image";
import { UserAvatar } from "@/components/profile/user-avatar";
import { FARMING_TYPE_OPTIONS } from "@/lib/onboarding/farming-types";
import { BULGARIA_REGIONS } from "@/lib/onboarding/regions";
import type { OnboardingProfile } from "@/lib/onboarding/types";
import { getProfileDisplayName } from "@/lib/auth/profile";
import { formatLocation } from "@/lib/data/formatters";

const primaryButtonClassName =
  "inline-flex w-full items-center justify-center rounded-full bg-forest px-5 py-3.5 text-sm font-medium text-white shadow-[0_14px_30px_-18px_rgba(63,90,58,0.5)] transition-[background-color,opacity] duration-300 hover:bg-[#324a2f] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto";

const secondaryButtonClassName =
  "inline-flex w-full items-center justify-center rounded-full border border-stone-300/90 bg-white px-5 py-3.5 text-sm font-medium text-stone-800 transition-colors hover:border-forest/35 hover:text-forest disabled:opacity-60 sm:w-auto";

type StepActionsProps = {
  onBack?: () => void;
  onContinue: () => void;
  continueLabel?: string;
  isLoading?: boolean;
  continueDisabled?: boolean;
};

function StepActions({
  onBack,
  onContinue,
  continueLabel = "Напред",
  isLoading = false,
  continueDisabled = false,
}: StepActionsProps) {
  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className={secondaryButtonClassName}
        >
          Назад
        </button>
      ) : (
        <span className="hidden sm:block" />
      )}
      <button
        type="button"
        onClick={onContinue}
        disabled={isLoading || continueDisabled}
        className={primaryButtonClassName}
      >
        {isLoading ? "Запазване..." : continueLabel}
      </button>
    </div>
  );
}

type StepIdentityProps = {
  initialName: string;
  initialAvatarUrl: string | null;
  error: string | null;
  isLoading: boolean;
  onContinue: (values: { name: string; avatarFile: File | null }) => void;
};

export function StepIdentity({
  initialName,
  initialAvatarUrl,
  error,
  isLoading,
  onContinue,
}: StepIdentityProps) {
  const [name, setName] = useState(initialName);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isAdjustingPhoto, setIsAdjustingPhoto] = useState(false);

  return (
    <div className="flex flex-col">
      <div className="stack">
        <AvatarPhotoPicker
          name={name}
          initialImageUrl={initialAvatarUrl}
          onCroppedFileChange={setAvatarFile}
          onCroppingChange={setIsAdjustingPhoto}
        />

        <AuthInput
          id="onboarding-name"
          label="Вашето име"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          placeholder="Как да ви поздравим?"
        />

        {error ? (
          <p
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </p>
        ) : null}
      </div>

      <StepActions
        isLoading={isLoading}
        continueDisabled={isAdjustingPhoto}
        onContinue={() => onContinue({ name, avatarFile })}
      />
    </div>
  );
}

type StepLocationProps = {
  initialCity: string;
  initialRegion: string;
  error: string | null;
  isLoading: boolean;
  onBack: () => void;
  onContinue: (values: { city: string; region: string }) => void;
  continueLabel?: string;
};

export function StepLocation({
  initialCity,
  initialRegion,
  error,
  isLoading,
  onBack,
  onContinue,
  continueLabel,
}: StepLocationProps) {
  const [city, setCity] = useState(initialCity);
  const [region, setRegion] = useState(initialRegion);

  return (
    <div className="flex flex-col">
      <div className="space-y-5">
        <AuthInput
          id="onboarding-city"
          label="Град или село"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder="напр. Пловдив"
        />

        <div className="space-y-2">
          <label
            htmlFor="onboarding-region"
            className="block text-sm font-medium text-stone-700"
          >
            Област в България
          </label>
          <select
            id="onboarding-region"
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

        {error ? (
          <p
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </p>
        ) : null}
      </div>

      <StepActions
        onBack={onBack}
        isLoading={isLoading}
        continueLabel={continueLabel}
        onContinue={() => onContinue({ city, region })}
      />
    </div>
  );
}

type StepStoryProps = {
  initialBio: string;
  initialStory: string;
  initialPhilosophy: string;
  error: string | null;
  isLoading: boolean;
  onBack: () => void;
  onContinue: (values: {
    bio: string;
    story: string;
    philosophy: string;
  }) => void;
};

export function StepStory({
  initialBio,
  initialStory,
  initialPhilosophy,
  error,
  isLoading,
  onBack,
  onContinue,
}: StepStoryProps) {
  const [bio, setBio] = useState(initialBio);
  const [story, setStory] = useState(initialStory);
  const [philosophy, setPhilosophy] = useState(initialPhilosophy);

  return (
    <div className="flex flex-col">
      <div className="space-y-5">
        <OnboardingTextarea
          id="onboarding-bio"
          label="Кратко представяне на фермата"
          value={bio}
          onChange={setBio}
          placeholder="Кратко представяне на фермата ви"
          hint="Едно-две изречения са достатъчни за начало."
        />
        <OnboardingTextarea
          id="onboarding-story"
          label="Фермерска история"
          value={story}
          onChange={setStory}
          placeholder="Как започна фермата ви? Какво отглеждате днес?"
          rows={5}
        />
        <OnboardingTextarea
          id="onboarding-philosophy"
          label="Философия"
          value={philosophy}
          onChange={setPhilosophy}
          placeholder="Какви принципи насочват начина, по който отглеждате храна?"
        />
        {error ? (
          <p
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </p>
        ) : null}
      </div>

      <StepActions
        onBack={onBack}
        isLoading={isLoading}
        onContinue={() => onContinue({ bio, story, philosophy })}
      />
    </div>
  );
}

type StepPracticeProps = {
  initialYears: string;
  initialTypes: string[];
  error: string | null;
  isLoading: boolean;
  onBack: () => void;
  onContinue: (values: { experienceYears: string; farmingTypes: string[] }) => void;
};

export function StepPractice({
  initialYears,
  initialTypes,
  error,
  isLoading,
  onBack,
  onContinue,
}: StepPracticeProps) {
  const [experienceYears, setExperienceYears] = useState(initialYears);
  const [farmingTypes, setFarmingTypes] = useState(initialTypes);

  function toggleType(type: string) {
    setFarmingTypes((current) =>
      current.includes(type)
        ? current.filter((item) => item !== type)
        : [...current, type],
    );
  }

  return (
    <div className="flex flex-col">
      <div className="space-y-5">
        <AuthInput
          id="onboarding-experience"
          label="Години опит"
          type="number"
          min={0}
          max={80}
          value={experienceYears}
          onChange={(event) => setExperienceYears(event.target.value)}
          placeholder="напр. 12"
        />

        <div className="space-y-3">
          <p className="text-sm font-medium text-stone-700">
            Фокус в отглеждането <span className="font-normal text-stone-500">(по избор)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {FARMING_TYPE_OPTIONS.map((type) => {
              const isSelected = farmingTypes.includes(type);

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleType(type)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    isSelected
                      ? "border-forest/40 bg-forest/10 text-forest"
                      : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {error ? (
          <p
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </p>
        ) : null}
      </div>

      <StepActions
        onBack={onBack}
        isLoading={isLoading}
        onContinue={() => onContinue({ experienceYears, farmingTypes })}
      />
    </div>
  );
}

type StepPreviewProps = {
  profile: OnboardingProfile;
  error: string | null;
  isLoading: boolean;
  onBack: () => void;
  onFinish: () => void;
};

export function StepPreview({
  profile,
  error,
  isLoading,
  onBack,
  onFinish,
}: StepPreviewProps) {
  const farmer = profile.farmerProfile;
  const displayName = getProfileDisplayName({
    profileName: profile.name,
    email: profile.email,
  });
  const location = formatLocation(
    farmer?.location ?? profile.city,
    farmer?.region ?? profile.region,
  );

  return (
    <div className="flex flex-col">
      <article className="overflow-hidden rounded-[1.75rem] border border-stone-200/80 bg-white shadow-[0_22px_52px_-28px_rgba(63,90,58,0.28)]">
        <div className="h-28 bg-[linear-gradient(135deg,#d9e2cf_0%,#8a9a7b_100%)]" />
        <div className="px-6 pb-6">
          <div className="-mt-12 flex items-end gap-4">
            {profile.avatarUrl ? (
              <ProfileImage
                src={profile.avatarUrl}
                alt={displayName}
                className="h-24 w-24 rounded-[1.25rem] border-4 border-white shadow-md"
              />
            ) : (
              <UserAvatar name={displayName} size="lg" />
            )}
            <div>
              <h2 className="text-xl font-semibold text-stone-900">{displayName}</h2>
              <p className="text-sm text-stone-600">{location}</p>
            </div>
          </div>

          {farmer?.bio ? (
            <p className="mt-5 text-sm leading-6 text-stone-700">{farmer.bio}</p>
          ) : null}
          {farmer?.story ? (
            <p className="mt-3 text-sm leading-6 text-stone-600">{farmer.story}</p>
          ) : null}
          {farmer?.farmingTypes.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {farmer.farmingTypes.map((type) => (
                <span
                  key={type}
                  className="rounded-full bg-forest/8 px-3 py-1 text-xs font-medium text-forest"
                >
                  {type}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </article>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </p>
      ) : null}

      <StepActions
        onBack={onBack}
        isLoading={isLoading}
        continueLabel="Публикувай профила"
        onContinue={onFinish}
      />
    </div>
  );
}

type StepBuyerFinishProps = {
  displayName: string;
  error: string | null;
  isLoading: boolean;
  onBack: () => void;
  onFinish: () => void;
};

export function StepBuyerFinish({
  displayName,
  error,
  isLoading,
  onBack,
  onFinish,
}: StepBuyerFinishProps) {
  return (
    <div className="flex flex-col">
      <div className="rounded-[1.75rem] border border-forest/15 bg-forest/5 p-6 text-center sm:p-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-forest">
          Готови сте
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-stone-900">
          Добре дошли, {displayName}
        </h2>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          Основните ви данни са запазени. Разгледайте местни производители и
          следвайте сезоните, които са важни за вас.
        </p>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </p>
      ) : null}

      <StepActions
        onBack={onBack}
        isLoading={isLoading}
        continueLabel="Започни да откриваш"
        onContinue={onFinish}
      />
    </div>
  );
}
