import type { UserRole } from "@/lib/auth/types";
import type { Locale } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/translate";
import type { OnboardingProfile, OnboardingStepId } from "@/lib/onboarding/types";

export type OnboardingStepMeta = {
  id: OnboardingStepId;
  title: string;
  subtitle: string;
};

function getBuyerSteps(locale: Locale): OnboardingStepMeta[] {
  return [
    {
      id: 2,
      title: translate(locale, "Къде се намирате?", "Where are you located?"),
      subtitle: translate(
        locale,
        "Местният контекст прави откриването по-лично.",
        "Local context makes discovery feel more personal.",
      ),
    },
  ];
}

function getFarmerSteps(locale: Locale): OnboardingStepMeta[] {
  return [
    {
      id: 2,
      title: translate(
        locale,
        "Местоположение на фермата",
        "Farm location",
      ),
      subtitle: translate(
        locale,
        "Помогнете на близките купувачи да ви открият.",
        "Help nearby buyers discover you.",
      ),
    },
    {
      id: 3,
      title: translate(
        locale,
        "Историята на вашата ферма",
        "Your farm's story",
      ),
      subtitle: translate(
        locale,
        "Споделете какво прави вашата практика на отглеждане уникална.",
        "Share what makes your growing practice unique.",
      ),
    },
    {
      id: 4,
      title: translate(locale, "Как отглеждате", "How you grow"),
      subtitle: translate(
        locale,
        "Няколко думи за опита и фокуса ви.",
        "A few words about your experience and focus.",
      ),
    },
    {
      id: 5,
      title: translate(locale, "Преглед на профила", "Profile preview"),
      subtitle: translate(
        locale,
        "Вижте как купувачите ще ви откриват в Farmly.",
        "See how buyers will discover you on Farmly.",
      ),
    },
  ];
}

export function getOnboardingSteps(
  role: UserRole,
  locale: Locale = "bg",
): OnboardingStepMeta[] {
  return role === "farmer" ? getFarmerSteps(locale) : getBuyerSteps(locale);
}

export function getOnboardingStepCount(
  role: UserRole,
  locale: Locale = "bg",
): number {
  return getOnboardingSteps(role, locale).length;
}

/** DB step 1 (legacy identity) is skipped when the name is already set at signup. */
export function getEffectiveOnboardingStep(
  profile: Pick<OnboardingProfile, "role" | "name" | "onboardingStep">,
  locale: Locale = "bg",
): OnboardingStepId {
  const rawStep = profile.onboardingStep;

  if (rawStep === 1 && profile.name?.trim()) {
    return 2;
  }

  return clampOnboardingStep(profile.role, rawStep, locale);
}

export function getDisplayStepIndex(
  role: UserRole,
  step: OnboardingStepId,
  locale: Locale = "bg",
): number {
  const steps = getOnboardingSteps(role, locale);
  const index = steps.findIndex((item) => item.id === step);

  return index >= 0 ? index + 1 : 1;
}

export function clampOnboardingStep(
  role: UserRole,
  step: number,
  locale: Locale = "bg",
): OnboardingStepId {
  const steps = getOnboardingSteps(role, locale);
  const allowedIds = steps.map((item) => item.id);

  if (step <= allowedIds[0]!) {
    return allowedIds[0]! as OnboardingStepId;
  }

  const lastId = allowedIds[allowedIds.length - 1]!;

  if (step >= lastId) {
    return lastId as OnboardingStepId;
  }

  const next = allowedIds.find((id) => id >= step);

  return (next ?? lastId) as OnboardingStepId;
}
