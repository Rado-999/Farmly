import type { SupabaseClient } from "@supabase/supabase-js";

import { pickUniqueFarmerSlug } from "@/lib/farmers/farmer-slug";

type BecomeFarmerResult =
  | { status: "success"; farmerProfileId: string }
  | { status: "error"; message: string };

function isSlugConflict(error: { code?: string; message?: string }): boolean {
  return (
    error.code === "23505" &&
    (error.message?.includes("farmer_profiles_slug_key") ?? false)
  );
}

async function findFarmerProfileForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ id: string } | null> {
  const { data, error } = await supabase
    .from("farmer_profiles")
    .select("id")
    .eq("profile_id", userId)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data;
}

/**
 * App-layer become-farmer flow (replaces `become_farmer` DB RPC).
 * Creates `farmer_profiles` for the signed-in user, then sets `profiles.role` to farmer.
 */
export async function becomeFarmer(
  supabase: SupabaseClient,
): Promise<BecomeFarmerResult> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { status: "error", message: "You must be signed in." };
  }

  const existingFarmer = await findFarmerProfileForUser(supabase, user.id);

  if (existingFarmer) {
    const { error: roleError } = await supabase
      .from("profiles")
      .update({ role: "farmer", updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (roleError) {
      return { status: "error", message: roleError.message };
    }

    return { status: "success", farmerProfileId: existingFarmer.id };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("name, avatar_url, is_profile_complete")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return {
      status: "error",
      message: profileError?.message ?? "Profile missing. Try signing in again.",
    };
  }

  const displayBase = profile.name?.trim() || "Farmer";
  const publicName = profile.name?.trim() || displayBase;
  const listingComplete = profile.is_profile_complete ?? false;

  const { error: roleError } = await supabase
    .from("profiles")
    .update({ role: "farmer", updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (roleError) {
    return { status: "error", message: roleError.message };
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    let slug: string;

    try {
      slug = await pickUniqueFarmerSlug(supabase, displayBase, user.id);
    } catch (e) {
      return {
        status: "error",
        message: e instanceof Error ? e.message : "Could not create slug.",
      };
    }

    const { data: inserted, error: insertError } = await supabase
      .from("farmer_profiles")
      .insert({
        profile_id: user.id,
        slug,
        public_display_name: publicName,
        public_avatar_url: profile.avatar_url,
        listing_profile_complete: listingComplete,
      })
      .select("id")
      .single();

    if (inserted) {
      return { status: "success", farmerProfileId: inserted.id };
    }

    if (!insertError) {
      return { status: "error", message: "Could not create farmer profile." };
    }

    const raced = await findFarmerProfileForUser(supabase, user.id);

    if (raced) {
      return { status: "success", farmerProfileId: raced.id };
    }

    if (!isSlugConflict(insertError)) {
      return { status: "error", message: insertError.message };
    }
  }

  return {
    status: "error",
    message: "Could not create farmer profile. Please try again.",
  };
}
