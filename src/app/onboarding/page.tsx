import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { ONBOARDING_PATH, PROFILE_PATH } from "@/lib/auth/constants";
import { requireServerProfile } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Настройка на профила | Farmly",
  description:
    "Насочена настройка, която ви помага да се представите и да изградите доверие в Farmly.",
};

export default async function OnboardingPage() {
  const { profile } = await requireServerProfile(ONBOARDING_PATH);

  if (profile.isProfileComplete) {
    redirect(PROFILE_PATH);
  }

  return <OnboardingWizard initialProfile={profile} />;
}
