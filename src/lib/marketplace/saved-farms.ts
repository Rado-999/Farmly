import type { SupabaseClient } from "@supabase/supabase-js";

import { logger } from "@/lib/logger";
import { err, ok, type Result } from "@/lib/errors/result";

export const GUEST_SAVED_FARMER_IDS_KEY = "farmly_saved_farmer_ids";

export type SyncGuestSavedFarmsResult = Result<
  void,
  "saved_farms.sync_failed"
>;

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
  } catch (error) {
    logger.warn({
      operation: "savedFarms.readGuestSavedFarmerIds",
      message: "Failed to read guest saved farms from localStorage.",
      errorCode: "saved_farms.local_storage_read_failed",
      context: { storageKey: GUEST_SAVED_FARMER_IDS_KEY },
      error,
    });
    return [];
  }
}

export function writeGuestSavedFarmerIds(ids: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  const unique = [...new Set(ids)];
  try {
    window.localStorage.setItem(
      GUEST_SAVED_FARMER_IDS_KEY,
      JSON.stringify(unique),
    );
  } catch (error) {
    logger.error({
      operation: "savedFarms.writeGuestSavedFarmerIds",
      message: "Failed to persist guest saved farms to localStorage.",
      errorCode: "saved_farms.local_storage_write_failed",
      context: {
        storageKey: GUEST_SAVED_FARMER_IDS_KEY,
        savedCount: unique.length,
      },
      error,
    });
  }
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
  const result = await supabase
    .from("saved_farms")
    .insert({ user_id: userId, farmer_id: farmerId });

  if (result.error) {
    logger.error({
      operation: "savedFarms.insertSavedFarm",
      message: "Failed to insert saved farm.",
      userId,
      farmerId,
      errorCode: result.error.code ?? "saved_farms.insert_failed",
      context: { table: "saved_farms" },
      error: result.error,
    });
  }

  return result;
}

export async function deleteSavedFarm(
  supabase: SupabaseClient,
  userId: string,
  farmerId: string,
) {
  const result = await supabase
    .from("saved_farms")
    .delete()
    .eq("user_id", userId)
    .eq("farmer_id", farmerId);

  if (result.error) {
    logger.error({
      operation: "savedFarms.deleteSavedFarm",
      message: "Failed to delete saved farm.",
      userId,
      farmerId,
      errorCode: result.error.code ?? "saved_farms.delete_failed",
      context: { table: "saved_farms" },
      error: result.error,
    });
  }

  return result;
}

/** How many farms this user has saved. */
export async function getUserSavedFarmCount(
  supabase: SupabaseClient,
  userId: string,
): Promise<Result<number, "saved_farms.count_failed">> {
  const { count, error } = await supabase
    .from("saved_farms")
    .select("farmer_id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    logger.error({
      operation: "savedFarms.getUserSavedFarmCount",
      message: "Failed to fetch user saved farm count.",
      userId,
      errorCode: error.code ?? "saved_farms.count_failed",
      context: { table: "saved_farms" },
      error,
    });

    return err("saved_farms.count_failed", error.message);
  }

  return ok(count ?? 0);
}

/** Merge guest localStorage saves into the database after login. */
export async function syncGuestSavedFarms(
  supabase: SupabaseClient,
  userId: string,
): Promise<SyncGuestSavedFarmsResult> {
  const guestIds = readGuestSavedFarmerIds();
  if (guestIds.length === 0) {
    return ok();
  }

  const rows = guestIds.map((farmer_id) => ({
    user_id: userId,
    farmer_id,
  }));

  for (const row of rows) {
    const { error } = await supabase
      .from("saved_farms")
      .insert(row)
      .select("id")
      .maybeSingle();

    if (error) {
      logger.error({
        operation: "savedFarms.syncGuestSavedFarms",
        message: "Failed to sync guest saved farms into the database.",
        userId,
        farmerId: row.farmer_id,
        errorCode: error.code ?? "saved_farms.sync_failed",
        context: { guestSavedCount: guestIds.length, table: "saved_farms" },
        error,
      });

      return err(
        "saved_farms.sync_failed",
        error.message,
      );
    }
  }

  writeGuestSavedFarmerIds([]);

  return ok();
}
