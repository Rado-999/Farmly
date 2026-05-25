"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import {
  StepBuyerFinish,
  StepIdentity,
  StepLocation,
  StepPractice,
  StepPreview,
  StepStory,
} from "@/components/onboarding/onboarding-steps";
import { SkipWarningModal } from "@/components/onboarding/skip-warning-modal";
import { ProfileSkeleton } from "@/components/profile/profile-skeleton";
import { PROFILE_PATH } from "@/lib/auth/constants";
import { getProfileDisplayName } from "@/lib/auth/profile";
import {
  completeOnboarding,
  saveIdentityStep,
  saveLocationStep,
  savePracticeStep,
  saveStoryStep,
  skipOnboarding,
} from "@/lib/onboarding/persistence";
import {
  clampOnboardingStep,
  getOnboardingStepCount,
  getOnboardingSteps,
} from "@/lib/onboarding/steps";
import {
  fetchOnboardingProfile,
  needsOnboarding,
} from "@/lib/onboarding/state";
import type { OnboardingProfile } from "@/lib/onboarding/types";
import { createSupabaseClient } from "@/lib/supabase";

type OnboardingWizardProps = {
  initialProfile: OnboardingProfile;
};

export function OnboardingWizard({ initialProfile }: OnboardingWizardProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<OnboardingProfile | null>(initialProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [buyerFinishMode, setBuyerFinishMode] = useState(false);
  const profileId = initialProfile.id;

  const reloadProfile = useCallback(async () => {
    const supabase = createSupabaseClient();

    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const nextProfile = await fetchOnboardingProfile(supabase, profileId);
    setProfile(nextProfile);
    setIsLoading(false);
  }, [profileId]);

  if (isLoading || !profile) {
    return (
      <main className="bg-cream">
        <ProfileSkeleton />
      </main>
    );
  }

  const steps = getOnboardingSteps(profile.role);
  const totalSteps = getOnboardingStepCount(profile.role);
  const currentStep = buyerFinishMode
    ? totalSteps
    : clampOnboardingStep(profile.role, profile.onboardingStep);
  const stepMeta =
    steps.find((step) => step.id === currentStep) ?? steps[0]!;

  async function persist(
    action: (
      supabase: NonNullable<ReturnType<typeof createSupabaseClient>>,
    ) => Promise<{ ok: boolean; message?: string }>,
    onSuccess?: () => void,
  ) {
    const supabase = createSupabaseClient();

    if (!supabase) {
      setError("Удостоверяването все още не е конфигурирано.");
      return;
    }

    setIsSaving(true);
    setError(null);

    const result = await action(supabase);

    setIsSaving(false);

    if (!result.ok) {
      setError(result.message ?? "Нещо се обърка. Моля, опитайте отново.");
      return;
    }

    await reloadProfile();
    onSuccess?.();
  }

  function goToStep(step: number) {
    setProfile((current) =>
      current ? { ...current, onboardingStep: step } : current,
    );
    setBuyerFinishMode(false);
  }

  async function handleSkipConfirm() {
    if (!profile) {
      return;
    }

    await persist(async (supabase) =>
      skipOnboarding(supabase, profile.id),
    );
    setShowSkipModal(false);
    router.push(PROFILE_PATH);
    router.refresh();
  }

  function renderStep(activeProfile: OnboardingProfile) {
    if (buyerFinishMode || (activeProfile.role === "buyer" && currentStep > 2)) {
      return (
        <StepBuyerFinish
          displayName={getProfileDisplayName({
            profileName: activeProfile.name,
            email: activeProfile.email,
          })}
          error={error}
          isLoading={isSaving}
          onBack={() => {
            setBuyerFinishMode(false);
            goToStep(2);
          }}
          onFinish={() =>
            void persist((supabase) => completeOnboarding(supabase, activeProfile.id), () => {
              router.push("/discover");
              router.refresh();
            })
          }
        />
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <StepIdentity
            initialName={activeProfile.name ?? ""}
            initialAvatarUrl={activeProfile.avatarUrl}
            error={error}
            isLoading={isSaving}
            onContinue={(values) => {
              if (!values.name.trim()) {
                setError("Моля, въведете името си.");
                return;
              }

              void persist((supabase) =>
                saveIdentityStep(supabase, activeProfile.id, values),
              );
            }}
          />
        );
      case 2:
        return (
          <StepLocation
            initialCity={
              activeProfile.city ?? activeProfile.farmerProfile?.location ?? ""
            }
            initialRegion={
              activeProfile.region ?? activeProfile.farmerProfile?.region ?? ""
            }
            error={error}
            isLoading={isSaving}
            onBack={() => goToStep(1)}
            continueLabel={
              activeProfile.role === "buyer" ? "Завърши настройката" : undefined
            }
            onContinue={(values) => {
              if (!values.city.trim() || !values.region.trim()) {
                setError("Моля, добавете град и област.");
                return;
              }

              void persist(
                (supabase) =>
                  saveLocationStep(
                    supabase,
                    activeProfile.id,
                    activeProfile.role,
                    values,
                  ),
                () => {
                  if (activeProfile.role === "buyer") {
                    setBuyerFinishMode(true);
                  }
                },
              );
            }}
          />
        );
      case 3:
        return (
          <StepStory
            initialBio={activeProfile.farmerProfile?.bio ?? ""}
            initialStory={activeProfile.farmerProfile?.story ?? ""}
            initialPhilosophy={activeProfile.farmerProfile?.philosophy ?? ""}
            error={error}
            isLoading={isSaving}
            onBack={() => goToStep(2)}
            onContinue={(values) => {
              if (
                !values.bio.trim() ||
                !values.story.trim() ||
                !values.philosophy.trim()
              ) {
                setError("Моля, попълнете биото, историята и философията си.");
                return;
              }

              void persist((supabase) =>
                saveStoryStep(supabase, activeProfile.id, values),
              );
            }}
          />
        );
      case 4:
        return (
          <StepPractice
            initialYears={
              activeProfile.farmerProfile?.experienceYears?.toString() ?? ""
            }
            initialTypes={activeProfile.farmerProfile?.farmingTypes ?? []}
            error={error}
            isLoading={isSaving}
            onBack={() => goToStep(3)}
            onContinue={(values) =>
              void persist((supabase) =>
                savePracticeStep(supabase, activeProfile.id, values),
              )
            }
          />
        );
      case 5:
        return (
          <StepPreview
            profile={activeProfile}
            error={error}
            isLoading={isSaving}
            onBack={() => goToStep(4)}
            onFinish={() =>
              void persist(
                (supabase) => completeOnboarding(supabase, activeProfile.id),
                () => {
                  router.push(
                    activeProfile.farmerProfile
                      ? `/farmers/${activeProfile.farmerProfile.slug}`
                      : PROFILE_PATH,
                  );
                  router.refresh();
                },
              )
            }
          />
        );
      default:
        return null;
    }
  }

  if (!needsOnboarding(profile) && profile.isProfileComplete) {
    return null;
  }

  return (
    <main className="min-h-below-header bg-cream">
      <OnboardingShell
        step={currentStep}
        totalSteps={totalSteps}
        title={buyerFinishMode ? "Почти сте готови" : stepMeta.title}
        subtitle={
          buyerFinishMode
            ? "Прегледайте основните си данни и започнете да откривате Farmly."
            : stepMeta.subtitle
        }
        onSkip={() => setShowSkipModal(true)}
      >
        <div
          key={`${currentStep}-${buyerFinishMode ? "finish" : "step"}`}
          className="flex flex-col animate-[fade-up_0.4s_ease-out]"
        >
          {renderStep(profile)}
        </div>
      </OnboardingShell>

      <SkipWarningModal
        isOpen={showSkipModal}
        isLoading={isSaving}
        onCancel={() => setShowSkipModal(false)}
        onConfirm={() => void handleSkipConfirm()}
      />
    </main>
  );
}
