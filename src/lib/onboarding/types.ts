import type { UserRole } from "@/lib/auth/types";

export type OnboardingStepId = 1 | 2 | 3 | 4 | 5;

export type FarmerProfileDraft = {
  id: string;
  slug: string;
  location: string | null;
  region: string | null;
  bio: string | null;
  story: string | null;
  philosophy: string | null;
  experienceYears: number | null;
  farmingTypes: string[];
  coverImageUrl: string | null;
};

export type OnboardingProfile = {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  avatarUrl: string | null;
  city: string | null;
  region: string | null;
  isProfileComplete: boolean;
  onboardingStep: number;
  onboardingSkippedAt: string | null;
  createdAt: string | null;
  farmerProfile: FarmerProfileDraft | null;
};

export type StepIdentityValues = {
  name: string;
  avatarFile: File | null;
};

export type StepLocationValues = {
  city: string;
  region: string;
};

export type StepStoryValues = {
  bio: string;
  story: string;
  philosophy: string;
};

export type StepPracticeValues = {
  experienceYears: string;
  farmingTypes: string[];
};
