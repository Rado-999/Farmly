import type { SupabaseClient } from "@supabase/supabase-js";

/** Keeps listing-only columns in sync when `profiles` fields change (replaces DB trigger). */
export async function syncFarmerPublicMirrorFromProfile(
  supabase: SupabaseClient,
  userId: string,
  fields: {
    name?: string | null;
    avatar_url?: string | null;
    is_profile_complete?: boolean;
  },
): Promise<void> {
  const { data: row } = await supabase
    .from("farmer_profiles")
    .select("id")
    .eq("profile_id", userId)
    .maybeSingle();

  if (!row) {
    return;
  }

  const patch: Record<string, unknown> = {};

  if ("name" in fields) {
    const trimmed = fields.name?.trim();
    patch.public_display_name = trimmed && trimmed.length > 0 ? trimmed : null;
  }

  if ("avatar_url" in fields) {
    patch.public_avatar_url = fields.avatar_url ?? null;
  }

  if ("is_profile_complete" in fields) {
    patch.listing_profile_complete = fields.is_profile_complete ?? false;
  }

  if (Object.keys(patch).length === 0) {
    return;
  }

  await supabase.from("farmer_profiles").update(patch).eq("profile_id", userId);
}
