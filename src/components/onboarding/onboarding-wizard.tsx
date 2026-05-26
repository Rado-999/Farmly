"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { ProfileSkeleton } from "@/components/profile/profile-skeleton";
import { PROFILE_PATH } from "@/lib/auth/constants";
import { getProfileDisplayName } from "@/lib/auth/profile";
import type { Result } from "@/lib/errors/result";
import {
  clampOnboardingStep,
  getOnboardingStepCount,
  getOnboardingSteps,
} from "@/lib/onboarding/steps";
import { needsOnboarding } from "@/lib/onboarding/state";
import type { OnboardingProfile } from "@/lib/onboarding/types";
import { loadSupabaseClient } from "@/lib/supabase/load-client";

const StepIdentity = dynamic(
  () =>
    import("@/components/onboarding/onboarding-steps").then(
      (module) => module.StepIdentity,
    ),
  { loading: () => <StepLoadingFallback /> },
);

const StepLocation = dynamic(
  () =>
    import("@/components/onboarding/onboarding-steps").then(
      (module) => module.StepLocation,
    ),
  { loading: () => <StepLoadingFallback /> },
);

const StepStory = dynamic(
  () =>
    import("@/components/onboarding/onboarding-steps").then(
      (module) => module.StepStory,
    ),
  { loading: () => <StepLoadingFallback /> },
);

const StepPractice = dynamic(
  () =>
    import("@/components/onboarding/onboarding-steps").then(
      (module) => module.StepPractice,
    ),
  { loading: () => <StepLoadingFallback /> },
);

const StepPreview = dynamic(
  () =>
    import("@/components/onboarding/onboarding-steps").then(
      (module) => module.StepPreview,
    ),
  { loading: () => <StepLoadingFallback /> },
);

const StepBuyerFinish = dynamic(
  () =>
    import("@/components/onboarding/onboarding-steps").then(
      (module) => module.StepBuyerFinish,
    ),
  { loading: () => <StepLoadingFallback /> },
);

const SkipWarningModal = dynamic(
  () =>
    import("@/components/onboarding/skip-warning-modal").then(
      (module) => module.SkipWarningModal,
    ),
);

type OnboardingWizardProps = {
  initialProfile: OnboardingProfile;
};

function StepLoadingFallback() {
  return (
    <div className="space-y-4">
      <div className="h-56 animate-pulse rounded-[1.5rem] bg-white/80" />
      <div className="h-12 animate-pulse rounded-full bg-stone-100" />
    </div>
  );
}

export function OnboardingWizard({ initialProfile }: OnboardingWizardProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<OnboardingProfile | null>(initialProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [buyerFinishMode, setBuyerFinishMode] = useState(false);
  const profileId = initialProfile.id;

  const reloadProfile = useCallback(async () => {
    const supabase = await loadSupabaseClient();

    if (!supabase) {
      return;
    }

    const { fetchOnboardingProfile } = await import("@/lib/onboarding/state");
    const nextProfile = await fetchOnboardingProfile(supabase, profileId);
    if (nextProfile) {
      setProfile(nextProfile);
    }
  }, [profileId]);

  if (!profile) {
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
    action: (supabase: SupabaseClient) => Promise<Result<void, string>>,
    onSuccess?: () => void,
  ) {
    const supabase = await loadSupabaseClient();

    if (!supabase) {
      setError("Удостоверяването все още не е конфигурирано.");
      return;
    }

    setIsSaving(true);
    setError(null);

    const result = await action(supabase);

    setIsSaving(false);

    if (!result.ok) {
      setError(result.error.message ?? "Нещо се обърка. Моля, опитайте отново.");
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
      import("@/lib/onboarding/persistence").then(({ skipOnboarding }) =>
        skipOnboarding(supabase, profile.id),
      ),
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
            void persist(
              (supabase) =>
                import("@/lib/onboarding/persistence").then(
                  ({ completeOnboarding }) =>
                    completeOnboarding(supabase, activeProfile.id),
                ),
              () => {
                router.push("/discover");
                router.refresh();
              },
            )
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
                import("@/lib/onboarding/persistence").then(
                  ({ saveIdentityStep }) =>
                    saveIdentityStep(supabase, activeProfile.id, values),
                ),
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
                  import("@/lib/onboarding/persistence").then(
                    ({ saveLocationStep }) =>
                      saveLocationStep(
                        supabase,
                        activeProfile.id,
                        activeProfile.role,
                        values,
                      ),
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
                import("@/lib/onboarding/persistence").then(
                  ({ saveStoryStep }) =>
                    saveStoryStep(supabase, activeProfile.id, values),
                ),
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
                import("@/lib/onboarding/persistence").then(
                  ({ savePracticeStep }) =>
                    savePracticeStep(supabase, activeProfile.id, values),
                ),
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
                (supabase) =>
                  import("@/lib/onboarding/persistence").then(
                    ({ completeOnboarding }) =>
                      completeOnboarding(supabase, activeProfile.id),
                  ),
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

      {showSkipModal ? (
        <SkipWarningModal
          isOpen={showSkipModal}
          isLoading={isSaving}
          onCancel={() => setShowSkipModal(false)}
          onConfirm={() => void handleSkipConfirm()}
        />
      ) : null}
    </main>
  );
}
