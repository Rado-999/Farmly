import type { SupabaseClient } from "@supabase/supabase-js";

const RETURN_GAP_MS = 3 * 24 * 60 * 60 * 1000;

export function shouldShowSinceYouWereHere(
  lastVisitedAt: string | null | undefined,
): boolean {
  if (!lastVisitedAt) {
    return false;
  }

  const last = new Date(lastVisitedAt).getTime();
  if (Number.isNaN(last)) {
    return false;
  }

  return Date.now() - last >= RETURN_GAP_MS;
}

export async function fetchVillageVisitState(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ lastVisitedAt: string | null; region: string | null }> {
  const { data, error } = await supabase
    .from("profiles")
    .select("village_last_visited_at, region")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return {
    lastVisitedAt: data?.village_last_visited_at ?? null,
    region: data?.region ?? null,
  };
}

export async function markVillageVisited(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({
      village_last_visited_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }
}
