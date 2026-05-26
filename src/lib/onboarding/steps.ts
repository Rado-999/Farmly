import type { UserRole } from "@/lib/auth/types";
import type { Locale } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/translate";
import type { OnboardingStepId } from "@/lib/onboarding/types";

export type OnboardingStepMeta = {
  id: OnboardingStepId;
  title: string;
  subtitle: string;
};

function getBuyerSteps(locale: Locale): OnboardingStepMeta[] {
  return [
    {
      id: 1,
      title: translate(locale, "Представете се", "Introduce yourself"),
      subtitle: translate(
        locale,
        "Приятелско лице помага на производителите и купувачите да ви се доверят.",
        "A friendly face helps growers and buyers trust you.",
      ),
    },
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
      id: 1,
      title: translate(locale, "Представете се", "Introduce yourself"),
      subtitle: translate(
        locale,
        "Покажете на купувачите човека зад жътвата.",
        "Show buyers the person behind the harvest.",
      ),
    },
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

export function clampOnboardingStep(
  role: UserRole,
  step: number,
  locale: Locale = "bg",
): OnboardingStepId {
  const max = getOnboardingStepCount(role, locale);
  const safe = Math.min(Math.max(step, 1), max);
  return safe as OnboardingStepId;
}
