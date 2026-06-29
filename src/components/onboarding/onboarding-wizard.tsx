"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

import { useLocale } from "@/components/i18n/language-provider";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { ProfileSkeleton } from "@/components/profile/profile-skeleton";
import { PROFILE_PATH } from "@/lib/auth/constants";
import { getProfileDisplayName } from "@/lib/auth/profile";
import type { Result } from "@/lib/errors/result";
import { translate } from "@/lib/i18n/translate";
import {
  getDisplayStepIndex,
  getEffectiveOnboardingStep,
  getOnboardingStepCount,
  getOnboardingSteps,
} from "@/lib/onboarding/steps";
import { needsOnboarding } from "@/lib/onboarding/state";
import type { OnboardingProfile } from "@/lib/onboarding/types";
import { loadSupabaseClient } from "@/lib/supabase/load-client";

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
  const { locale } = useLocale();
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

  const steps = getOnboardingSteps(profile.role, locale);
  const totalSteps = getOnboardingStepCount(profile.role, locale);
  const currentStep = getEffectiveOnboardingStep(profile, locale);
  const displayStep = buyerFinishMode
    ? totalSteps
    : getDisplayStepIndex(profile.role, currentStep, locale);
  const stepMeta =
    steps.find((step) => step.id === currentStep) ?? steps[0]!;

  async function persist(
    action: (supabase: SupabaseClient) => Promise<Result<void, string>>,
    onSuccess?: () => void,
  ) {
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

    setIsSaving(true);
    setError(null);

    const result = await action(supabase);

    setIsSaving(false);

    if (!result.ok) {
      setError(
        result.error.message ??
          translate(
            locale,
            "Нещо се обърка. Моля, опитайте отново.",
            "Something went wrong. Please try again.",
          ),
      );
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
            locale,
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
            continueLabel={
              activeProfile.role === "buyer"
                ? translate(locale, "Завърши настройката", "Finish setup")
                : undefined
            }
            onContinue={(values) => {
              if (!values.city.trim() || !values.region.trim()) {
                setError(
                  translate(
                    locale,
                    "Моля, добавете град и област.",
                    "Please add a town and region.",
                  ),
                );
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
                setError(
                  translate(
                    locale,
                    "Моля, попълнете биото, историята и философията си.",
                    "Please fill in your bio, story, and philosophy.",
                  ),
                );
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
        step={displayStep}
        totalSteps={totalSteps}
        title={
          buyerFinishMode
            ? translate(locale, "Почти сте готови", "You are almost ready")
            : stepMeta.title
        }
        subtitle={
          buyerFinishMode
            ? translate(
                locale,
                "Прегледайте основните си данни и започнете да откривате Farmly.",
                "Review your basics and start discovering Farmly.",
              )
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
