import type { SupabaseClient } from "@supabase/supabase-js";

/** True if this user is the owner of the farmer account (cannot follow themselves). */
export async function isSelfFarmerFollow(
  supabase: SupabaseClient,
  profileId: string,
  farmerId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("farmer_profiles")
    .select("id")
    .eq("id", farmerId)
    .eq("profile_id", profileId)
    .maybeSingle();

  return data != null;
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
  return supabase.from("follows").insert({
    user_id: userId,
    farmer_id: farmerId,
    notify_level: options?.notifyLevel ?? "digest",
    followed_via: options?.followedVia ?? "profile",
  });
}

export async function deleteFollow(
  supabase: SupabaseClient,
  userId: string,
  farmerId: string,
) {
  return supabase
    .from("follows")
    .delete()
    .eq("user_id", userId)
    .eq("farmer_id", farmerId);
}

/** Whether the user follows at least one farmer (for gentle return routing). */
export async function userHasFollows(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("follows")
    .select("farmer_id")
    .eq("user_id", userId)
    .limit(1);

  if (error) {
    return false;
  }

  return (data?.length ?? 0) > 0;
}

/** Follower count — visible to the farm owner via RLS only. */
export async function getFarmerFollowerCount(
  supabase: SupabaseClient,
  farmerProfileId: string,
): Promise<number | null> {
  const { count, error } = await supabase
    .from("follows")
    .select("farmer_id", { count: "exact", head: true })
    .eq("farmer_id", farmerProfileId);

  if (error) {
    return null;
  }

  return count ?? 0;
}
