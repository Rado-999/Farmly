import type { SupabaseClient } from "@supabase/supabase-js";

import { logger } from "@/lib/logger";
import { err, ok, type Result } from "@/lib/errors/result";

/** True if this user is the owner of the farmer account (cannot follow themselves). */
export async function isSelfFarmerFollow(
  supabase: SupabaseClient,
  profileId: string,
  farmerId: string,
): Promise<Result<boolean, "follows.self_check_failed">> {
  const { data, error } = await supabase
    .from("farmer_profiles")
    .select("id")
    .eq("id", farmerId)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    logger.error({
      operation: "follows.isSelfFarmerFollow",
      message: "Failed to resolve self-follow relationship.",
      userId: profileId,
      farmerId,
      errorCode: error.code ?? "follows.self_check_failed",
      context: { table: "farmer_profiles" },
      error,
    });

    return err("follows.self_check_failed", error.message);
  }

  return ok(data != null);
}

export type FollowNotifyLevel = "off" | "digest" | "harvest" | "all_gentle";

export type FollowedVia = "profile" | "onboarding" | "video" | "seasonal";

/** Follow a farmer. Enforce “no self-follow” in UI / route handlers before calling. */
export async function insertFollow(
  supabase: SupabaseClient,
  userId: string,
  farmerId: string,
  options?: {
    notifyLevel?: FollowNotifyLevel;
    followedVia?: FollowedVia;
  },
) {
  const result = await supabase.from("follows").insert({
    user_id: userId,
    farmer_id: farmerId,
    notify_level: options?.notifyLevel ?? "digest",
    followed_via: options?.followedVia ?? "profile",
  });

  if (result.error) {
    logger.error({
      operation: "follows.insertFollow",
      message: "Failed to insert follow.",
      userId,
      farmerId,
      errorCode: result.error.code ?? "follows.insert_failed",
      context: {
        notifyLevel: options?.notifyLevel ?? "digest",
        followedVia: options?.followedVia ?? "profile",
      },
      error: result.error,
    });
  }

  return result;
}

export async function deleteFollow(
  supabase: SupabaseClient,
  userId: string,
  farmerId: string,
) {
  const result = await supabase
    .from("follows")
    .delete()
    .eq("user_id", userId)
    .eq("farmer_id", farmerId);

  if (result.error) {
    logger.error({
      operation: "follows.deleteFollow",
      message: "Failed to delete follow.",
      userId,
      farmerId,
      errorCode: result.error.code ?? "follows.delete_failed",
      context: { table: "follows" },
      error: result.error,
    });
  }

  return result;
}

/** Whether the user follows at least one farmer (for gentle return routing). */
export async function userHasFollows(
  supabase: SupabaseClient,
  userId: string,
): Promise<Result<boolean, "follows.lookup_failed">> {
  const { data, error } = await supabase
    .from("follows")
    .select("farmer_id")
    .eq("user_id", userId)
    .limit(1);

  if (error) {
    logger.error({
      operation: "follows.userHasFollows",
      message: "Failed to resolve whether the user has follows.",
      userId,
      errorCode: error.code ?? "follows.lookup_failed",
      context: { table: "follows" },
      error,
    });

    return err("follows.lookup_failed", error.message);
  }

  return ok((data?.length ?? 0) > 0);
}

/** How many farmers this user follows. */
export async function getUserFollowingCount(
  supabase: SupabaseClient,
  userId: string,
): Promise<Result<number, "follows.count_failed">> {
  const { count, error } = await supabase
    .from("follows")
    .select("farmer_id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    logger.error({
      operation: "follows.getUserFollowingCount",
      message: "Failed to fetch user following count.",
      userId,
      errorCode: error.code ?? "follows.count_failed",
      context: { table: "follows" },
      error,
    });

    return err("follows.count_failed", error.message);
  }

  return ok(count ?? 0);
}

/** Follower count — visible to the farm owner via RLS only. */
export async function getFarmerFollowerCount(
  supabase: SupabaseClient,
  farmerProfileId: string,
): Promise<Result<number, "follows.count_failed">> {
  const { count, error } = await supabase
    .from("follows")
    .select("farmer_id", { count: "exact", head: true })
    .eq("farmer_id", farmerProfileId);

  if (error) {
    logger.error({
      operation: "follows.getFarmerFollowerCount",
      message: "Failed to fetch farmer follower count.",
      farmerId: farmerProfileId,
      errorCode: error.code ?? "follows.count_failed",
      context: { table: "follows" },
      error,
    });

    return err("follows.count_failed", error.message);
  }

  return ok(count ?? 0);
}
