import type { SupabaseClient } from "@supabase/supabase-js";

export const GUEST_SAVED_FARMER_IDS_KEY = "farmly_saved_farmer_ids";

export function readGuestSavedFarmerIds(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(GUEST_SAVED_FARMER_IDS_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((id): id is string => typeof id === "string" && id.length > 0);
  } catch {
    return [];
  }
}

export function writeGuestSavedFarmerIds(ids: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  const unique = [...new Set(ids)];
  window.localStorage.setItem(GUEST_SAVED_FARMER_IDS_KEY, JSON.stringify(unique));
}

export function addGuestSavedFarmerId(farmerId: string) {
  const ids = readGuestSavedFarmerIds();
  if (!ids.includes(farmerId)) {
    writeGuestSavedFarmerIds([...ids, farmerId]);
  }
}

export function removeGuestSavedFarmerId(farmerId: string) {
  writeGuestSavedFarmerIds(readGuestSavedFarmerIds().filter((id) => id !== farmerId));
}

export async function insertSavedFarm(
  supabase: SupabaseClient,
  userId: string,
  farmerId: string,
) {
  return supabase.from("saved_farms").insert({ user_id: userId, farmer_id: farmerId });
}

export async function deleteSavedFarm(
  supabase: SupabaseClient,
  userId: string,
  farmerId: string,
) {
  return supabase
    .from("saved_farms")
    .delete()
    .eq("user_id", userId)
    .eq("farmer_id", farmerId);
}

/** Merge guest localStorage saves into the database after login. */
export async function syncGuestSavedFarms(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const guestIds = readGuestSavedFarmerIds();
  if (guestIds.length === 0) {
    return;
  }

  const rows = guestIds.map((farmer_id) => ({
    user_id: userId,
    farmer_id,
  }));

  for (const row of rows) {
    await supabase.from("saved_farms").insert(row).select("id").maybeSingle();
  }

  writeGuestSavedFarmerIds([]);
}
