import type { SupabaseClient, User } from "@supabase/supabase-js";

import { becomeFarmer } from "@/lib/auth/become-farmer";

export type ExistingProfileSnapshot = {
  email: string | null;
  name: string | null;
  role: "buyer" | "farmer";
  farmerProfileId: string | null;
};

export type EnsureProfileForAuthUserResult = {
  didChangeProfile: boolean;
};

async function ensureFarmerProfileExists(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data: farmerProfile, error } = await supabase
    .from("farmer_profiles")
    .select("id")
    .eq("profile_id", userId)
    .maybeSingle();

  if (error) {
    console.error(
      "[ensureProfileForAuthUser] farmer profile lookup failed",
      userId,
      error,
    );
    return false;
  }

  if (farmerProfile) {
    return false;
  }

  const result = await becomeFarmer(supabase);

  if (result.status === "error") {
    console.error(
      "[ensureProfileForAuthUser] becomeFarmer failed",
      userId,
      result.message,
    );
    return false;
  }

  return true;
}

type ExistingProfileRow = {
  email: string | null;
  name: string | null;
  role: string;
  farmer_profiles: { id: string } | { id: string }[] | null;
};

function mapExistingProfile(
  row: ExistingProfileRow | null,
): ExistingProfileSnapshot | null {
  if (!row) {
    return null;
  }

  const farmerProfile = Array.isArray(row.farmer_profiles)
    ? (row.farmer_profiles[0] ?? null)
    : row.farmer_profiles;

  return {
    email: row.email,
    name: row.name,
    role: row.role === "farmer" ? "farmer" : "buyer",
    farmerProfileId: farmerProfile?.id ?? null,
  };
}

/**
 * Fallback when `handle_new_user` did not create `public.profiles` (local reset,
 * provider edge cases). Primary path: auth trigger on `auth.users`.
 */
export async function ensureProfileForAuthUser(
  supabase: SupabaseClient,
  user: User,
  options?: {
    existingProfile?: ExistingProfileSnapshot | null;
  },
): Promise<EnsureProfileForAuthUserResult> {
  const existingProfileFromOptions = options?.existingProfile;
  let existing = existingProfileFromOptions;

  if (existing === undefined) {
    const { data, error: selectError } = await supabase
      .from("profiles")
      .select("name, email, role, farmer_profiles ( id )")
      .eq("id", user.id)
      .maybeSingle();

    if (selectError) {
      console.error(
        "[ensureProfileForAuthUser] select failed",
        user.id,
        selectError,
      );
      throw new Error(`Failed to load profile: ${selectError.message}`);
    }

    existing = mapExistingProfile((data as ExistingProfileRow | null) ?? null);
  }

  if (existing) {
    const email = user.email?.trim() ?? "";
    const metaName =
      typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name.trim()
        : "";
    const fallbackName =
      metaName ||
      (email.length > 0 ? (email.split("@")[0] ?? "Farmly member") : "");
    const updates: {
      email?: string | null;
      name?: string | null;
      updated_at?: string;
    } = {};
    let didChangeProfile = false;

    if (!existing.email && email.length > 0) {
      updates.email = email;
    }

    if (!existing.name && fallbackName.length > 0) {
      updates.name = fallbackName;
    }

    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        console.error(
          "[ensureProfileForAuthUser] profile sync failed",
          user.id,
          updateError.message,
        );
      } else {
        didChangeProfile = true;
      }
    }

    if (existing.role === "farmer" && !existing.farmerProfileId) {
      didChangeProfile =
        (await ensureFarmerProfileExists(supabase, user.id)) || didChangeProfile;
    }

    return { didChangeProfile };
  }

  const email = user.email?.trim() ?? "";
  const metaName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name.trim()
      : "";
  const name =
    metaName ||
    (email.length > 0 ? (email.split("@")[0] ?? "Farmly member") : null);

  const { error: upsertError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      name: name && name.length > 0 ? name : null,
      email: email.length > 0 ? email : null,
      role: "buyer",
      is_profile_complete: false,
      onboarding_step: 1,
    },
    { onConflict: "id" },
  );

  if (upsertError) {
    console.error(
      "[ensureProfileForAuthUser] upsert failed",
      user.id,
      upsertError,
    );
    throw new Error(`Failed to create profile: ${upsertError.message}`);
  }

  return { didChangeProfile: true };
}
