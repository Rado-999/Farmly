import type { Metadata } from "next";
import { Suspense } from "react";

import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { ProfileSkeleton } from "@/components/profile/profile-skeleton";

export const metadata: Metadata = {
  title: "Настройка на профила | Farmly",
  description:
    "Насочена настройка, която ви помага да се представите и да изградите доверие в Farmly.",
};

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <main className="bg-cream">
          <ProfileSkeleton />
        </main>
      }
    >
      <OnboardingWizard />
    </Suspense>
  );
}
