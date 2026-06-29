"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useLocale } from "@/components/i18n/language-provider";
import { ONBOARDING_PATH } from "@/lib/auth/constants";
import { translate } from "@/lib/i18n/translate";
import type { OnboardingProfile } from "@/lib/onboarding/types";
import { loadSupabaseClient } from "@/lib/supabase/load-client";

const BecomeFarmerModal = dynamic(
  () =>
    import("@/components/profile/become-farmer-modal").then(
      (module) => module.BecomeFarmerModal,
    ),
  { ssr: false },
);

type BecomeFarmerButtonProps = {
  profile: OnboardingProfile;
  displayName: string;
  onSuccess?: () => void;
};

export function BecomeFarmerButton({
  profile,
  displayName,
  onSuccess,
}: BecomeFarmerButtonProps) {
  const router = useRouter();
  const { locale } = useLocale();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(values: {
    avatarFile: File | null;
    coverFile: File | null;
    bio: string;
    story: string;
    philosophy: string;
  }) {
    setError(null);

    const supabase = await loadSupabaseClient();

    if (!supabase) {
      setError(
        translate(
          locale,
          "Удостоверяването все още не е конфигурирано.",
          "Authentication is not configured yet.",
        ),
      );
      return;
    }

    setIsLoading(true);

    const { completeBecomeFarmerSetup } = await import(
      "@/lib/profile/become-farmer-setup"
    );
    const result = await completeBecomeFarmerSetup(supabase, profile.id, values, {
      existingAvatarUrl: profile.avatarUrl,
      existingCity: profile.city,
      existingRegion: profile.region,
    });

    setIsLoading(false);

    if (!result.ok) {
      const { getAuthErrorMessage } = await import("@/lib/auth/messages");
      setError(getAuthErrorMessage({ message: result.error.message }, locale));
      return;
    }

    setIsModalOpen(false);
    onSuccess?.();
    router.push(ONBOARDING_PATH);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setIsModalOpen(true);
        }}
        className="inline-flex rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white transition-[background-color,opacity] duration-300 hover:bg-[#324a2f]"
      >
        {translate(locale, "Станете фермер", "Become a farmer")}
      </button>

      {isModalOpen ? (
        <BecomeFarmerModal
          isOpen={isModalOpen}
          profile={profile}
          displayName={displayName}
          isSaving={isLoading}
          error={error}
          onClose={() => {
            if (!isLoading) {
              setIsModalOpen(false);
              setError(null);
            }
          }}
          onSubmit={(values) => void handleSubmit(values)}
        />
      ) : null}
    </>
  );
}
