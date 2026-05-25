import type { SupabaseClient } from "@supabase/supabase-js";

function slugifySegment(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

/** Base slug from display name + short user id segment (not guaranteed unique). */
export function baseFarmerSlug(displayName: string, userId: string): string {
  const fromName = slugifySegment(displayName.trim());
  const compactId = userId.replace(/-/g, "").slice(0, 8);
  const base = fromName ? `${fromName}-${compactId}` : `farmer-${compactId}`;
  return base.slice(0, 80);
}

/** Resolves a slug unused in `farmer_profiles.slug`. */
export async function pickUniqueFarmerSlug(
  supabase: SupabaseClient,
  displayName: string,
  userId: string,
): Promise<string> {
  const root = baseFarmerSlug(displayName, userId);

  for (let i = 0; i < 50; i += 1) {
    const candidate = (i === 0 ? root : `${root}-${i}`).slice(0, 96);
    const { data, error } = await supabase
      .from("farmer_profiles")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) {
      throw new Error(`Could not verify slug availability: ${error.message}`);
    }

    if (!data) {
      return candidate;
    }
  }

  throw new Error("Could not allocate a unique farmer slug.");
}
