import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { ONBOARDING_PATH, PROFILE_PATH } from "@/lib/auth/constants";
import { requireServerProfile } from "@/lib/auth/server";
import { getServerLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();

  return {
    title: translate(
      locale,
      "Настройка на профила | Farmly",
      "Profile setup | Farmly",
    ),
    description: translate(
      locale,
      "Насочена настройка, която ви помага да се представите и да изградите доверие в Farmly.",
      "A guided setup that helps you introduce yourself and build trust on Farmly.",
    ),
  };
}

export default async function OnboardingPage() {
  const { profile } = await requireServerProfile(ONBOARDING_PATH);

  if (profile.isProfileComplete) {
    redirect(PROFILE_PATH);
  }

  return <OnboardingWizard initialProfile={profile} />;
}
