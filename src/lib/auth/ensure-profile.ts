import type { SupabaseClient, User } from "@supabase/supabase-js";

import { becomeFarmer } from "@/lib/auth/become-farmer";

async function ensureFarmerProfileExists(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
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
    return;
  }

  if (farmerProfile) {
    return;
  }

  const result = await becomeFarmer(supabase);

  if (result.status === "error") {
    console.error(
      "[ensureProfileForAuthUser] becomeFarmer failed",
      userId,
      result.message,
    );
  }
}

/**
 * Fallback when `handle_new_user` did not create `public.profiles` (local reset,
 * provider edge cases). Primary path: auth trigger on `auth.users`.
 */
export async function ensureProfileForAuthUser(
  supabase: SupabaseClient,
  user: User,
): Promise<void> {
  const { data: existing, error: selectError } = await supabase
    .from("profiles")
    .select("id, role, name, email")
    .eq("id", user.id)
    .maybeSingle();

  if (selectError) {
    console.error(
      "[ensureProfileForAuthUser] select failed",
      user.id,
      selectError,
    );
    throw new Error(
      `Failed to load profile: ${selectError.message}`,
    );
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
      }
    }

    if (existing.role === "farmer") {
      await ensureFarmerProfileExists(supabase, user.id);
    }

    return;
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

  return;
}
