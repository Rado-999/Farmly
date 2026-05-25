import type { SupabaseClient } from "@supabase/supabase-js";

import type { UserRole } from "@/lib/auth/types";
import type { OnboardingProfile } from "@/lib/onboarding/types";

type ProfileRow = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  avatar_url: string | null;
  city: string | null;
  region: string | null;
  is_profile_complete: boolean;
  onboarding_step: number;
  onboarding_skipped_at: string | null;
  created_at: string | null;
  farmer_profiles:
    | {
        id: string;
        slug: string;
        location: string | null;
        region: string | null;
        bio: string | null;
        story: string | null;
        philosophy: string | null;
        experience_years: number | null;
        farming_types: string[] | null;
        cover_image_url: string | null;
      }
    | {
        id: string;
        slug: string;
        location: string | null;
        region: string | null;
        bio: string | null;
        story: string | null;
        philosophy: string | null;
        experience_years: number | null;
        farming_types: string[] | null;
        cover_image_url: string | null;
      }[]
    | null;
};

export function needsOnboarding(profile: Pick<
  OnboardingProfile,
  "isProfileComplete" | "onboardingSkippedAt"
>): boolean {
  return !profile.isProfileComplete && !profile.onboardingSkippedAt;
}

function mapRow(row: ProfileRow): OnboardingProfile {
  const role: UserRole = row.role === "farmer" ? "farmer" : "buyer";
  const farmerRow = Array.isArray(row.farmer_profiles)
    ? (row.farmer_profiles[0] ?? null)
    : row.farmer_profiles;

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role,
    avatarUrl: row.avatar_url,
    city: row.city,
    region: row.region,
    isProfileComplete: row.is_profile_complete,
    onboardingStep: row.onboarding_step,
    onboardingSkippedAt: row.onboarding_skipped_at,
    createdAt: row.created_at,
    farmerProfile: farmerRow
      ? {
          id: farmerRow.id,
          slug: farmerRow.slug,
          location: farmerRow.location,
          region: farmerRow.region,
          bio: farmerRow.bio,
          story: farmerRow.story,
          philosophy: farmerRow.philosophy,
          experienceYears: farmerRow.experience_years,
          farmingTypes: farmerRow.farming_types ?? [],
          coverImageUrl: farmerRow.cover_image_url,
        }
      : null,
  };
}

export async function fetchOnboardingProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<OnboardingProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      name,
      email,
      role,
      avatar_url,
      city,
      region,
      is_profile_complete,
      onboarding_step,
      onboarding_skipped_at,
      created_at,
      farmer_profiles (
        id,
        slug,
        location,
        region,
        bio,
        story,
        philosophy,
        experience_years,
        farming_types,
        cover_image_url
      )
    `,
    )
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapRow(data as ProfileRow);
}
