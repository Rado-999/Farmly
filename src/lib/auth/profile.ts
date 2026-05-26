import type { SupabaseClient } from "@supabase/supabase-js";

import type { UserRole } from "@/lib/auth/types";
import type { Locale } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/translate";

export type FarmerProfileSummary = {
  id: string;
  slug: string;
};

export type UserProfile = {
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
  farmerProfile: FarmerProfileSummary | null;
};

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
    | { id: string; slug: string }
    | { id: string; slug: string }[]
    | null;
};

export function formatUserRole(role: string, locale: Locale = "bg"): string {
  if (role === "farmer") {
    return translate(locale, "Фермер", "Farmer");
  }

  if (role === "buyer") {
    return translate(locale, "Купувач", "Buyer");
  }

  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function isFarmerUser(profile: Pick<UserProfile, "role" | "farmerProfile">): boolean {
  return profile.role === "farmer" || profile.farmerProfile !== null;
}

export function getProfileDisplayName({
  profileName,
  metadataName,
  email,
  locale = "bg",
}: {
  profileName?: string | null;
  metadataName?: string | null;
  email?: string | null;
  locale?: Locale;
}): string {
  const trimmedProfileName = profileName?.trim();
  if (trimmedProfileName) {
    return trimmedProfileName;
  }

  const trimmedMetadataName = metadataName?.trim();
  if (trimmedMetadataName) {
    return trimmedMetadataName;
  }

  if (email) {
    return (
      email.split("@")[0] ??
      translate(locale, "Член на Farmly", "Farmly member")
    );
  }

  return translate(locale, "Член на Farmly", "Farmly member");
}

export function getProfileInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "F";
  }

  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }

  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function mapProfileRow(row: ProfileRow): UserProfile {
  const role = row.role === "farmer" ? "farmer" : "buyer";
  const farmerProfiles = row.farmer_profiles;
  const farmerProfile = Array.isArray(farmerProfiles)
    ? (farmerProfiles[0] ?? null)
    : farmerProfiles;

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
    farmerProfile: farmerProfile
      ? { id: farmerProfile.id, slug: farmerProfile.slug }
      : null,
  };
}

export async function fetchUserProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, name, email, role, avatar_url, city, region, is_profile_complete, onboarding_step, onboarding_skipped_at, created_at, farmer_profiles ( id, slug )",
    )
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapProfileRow(data as ProfileRow);
}
