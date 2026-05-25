import type { FarmerProfileRow } from "@/lib/supabase/database.types";

export function getFarmerRowName(row: FarmerProfileRow): string {
  return (
    row.public_display_name?.trim() ||
    row.display_name?.trim() ||
    row.slug.replace(/-/g, " ")
  );
}

export function getFarmerRowAvatarUrl(row: FarmerProfileRow): string | null {
  return row.public_avatar_url ?? null;
}

/** Columns safe for anon / public reads (no join to `profiles`). */
export const FARMER_PROFILE_SELECT =
  "id, slug, location, region, bio, story, philosophy, experience_years, cover_image_url, is_verified, display_name, public_display_name, public_avatar_url, listing_profile_complete";
