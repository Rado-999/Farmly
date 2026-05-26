import type { SupabaseClient } from "@supabase/supabase-js";

import { logger } from "@/lib/logger";

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
  const { data: row, error: lookupError } = await supabase
    .from("farmer_profiles")
    .select("id")
    .eq("profile_id", userId)
    .maybeSingle();

  if (lookupError) {
    logger.error({
      operation: "farmers.syncFarmerPublicMirrorFromProfile.lookup",
      message: "Failed to load farmer profile before mirror sync.",
      userId,
      errorCode: lookupError.code ?? "farmer_public_mirror.lookup_failed",
      context: { fieldKeys: Object.keys(fields) },
      error: lookupError,
    });
    return;
  }

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

  const { error: updateError } = await supabase
    .from("farmer_profiles")
    .update(patch)
    .eq("profile_id", userId);

  if (updateError) {
    logger.error({
      operation: "farmers.syncFarmerPublicMirrorFromProfile.update",
      message: "Failed to update farmer public mirror.",
      userId,
      farmerId: row.id,
      errorCode: updateError.code ?? "farmer_public_mirror.update_failed",
      context: { patchKeys: Object.keys(patch) },
      error: updateError,
    });
  }
}
