import type { UserRole } from "@/lib/auth/types";
import type { OnboardingStepId } from "@/lib/onboarding/types";

export type OnboardingStepMeta = {
  id: OnboardingStepId;
  title: string;
  subtitle: string;
};

const buyerSteps: OnboardingStepMeta[] = [
  {
    id: 1,
    title: "Представете се",
    subtitle: "Приятелско лице помага на производителите и купувачите да ви се доверят.",
  },
  {
    id: 2,
    title: "Къде се намирате?",
    subtitle: "Местният контекст прави откриването по-лично.",
  },
];

const farmerSteps: OnboardingStepMeta[] = [
  {
    id: 1,
    title: "Представете се",
    subtitle: "Покажете на купувачите човека зад жътвата.",
  },
  {
    id: 2,
    title: "Местоположение на фермата",
    subtitle: "Помогнете на близките купувачи да ви открият.",
  },
  {
    id: 3,
    title: "Историята на вашата ферма",
    subtitle: "Споделете какво прави вашата практика на отглеждане уникална.",
  },
  {
    id: 4,
    title: "Как отглеждате",
    subtitle: "Няколко думи за опита и фокуса ви.",
  },
  {
    id: 5,
    title: "Преглед на профила",
    subtitle: "Вижте как купувачите ще ви откриват в Farmly.",
  },
];

export function getOnboardingSteps(role: UserRole): OnboardingStepMeta[] {
  return role === "farmer" ? farmerSteps : buyerSteps;
}

export function getOnboardingStepCount(role: UserRole): number {
  return getOnboardingSteps(role).length;
}

export function clampOnboardingStep(
  role: UserRole,
  step: number,
): OnboardingStepId {
  const max = getOnboardingStepCount(role);
  const safe = Math.min(Math.max(step, 1), max);
  return safe as OnboardingStepId;
}
