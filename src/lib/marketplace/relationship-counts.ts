import type { SupabaseClient } from "@supabase/supabase-js";

import { logger } from "@/lib/logger";
import {
  getFarmerFollowerCount,
  getUserFollowingCount,
} from "@/lib/marketplace/follows";
import { getUserSavedFarmCount } from "@/lib/marketplace/saved-farms";

export type UserRelationshipCounts = {
  followingCount: number;
  savedCount: number;
};

export type ProfileRelationshipCounts = UserRelationshipCounts & {
  /** Set when the viewer owns a farmer profile; null otherwise. */
  followerCount: number | null;
};

/** Buyer-side counts for village and profile surfaces. */
export async function loadUserRelationshipCounts(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserRelationshipCounts> {
  const [followingResult, savedResult] = await Promise.all([
    getUserFollowingCount(supabase, userId),
    getUserSavedFarmCount(supabase, userId),
  ]);

  if (!followingResult.ok) {
    logger.warn({
      operation: "relationshipCounts.loadUserRelationshipCounts.following",
      message: "Failed to load following count; defaulting to zero.",
      userId,
      errorCode: followingResult.error.code,
      error: followingResult.error.message,
    });
  }

  if (!savedResult.ok) {
    logger.warn({
      operation: "relationshipCounts.loadUserRelationshipCounts.saved",
      message: "Failed to load saved farm count; defaulting to zero.",
      userId,
      errorCode: savedResult.error.code,
      error: savedResult.error.message,
    });
  }

  return {
    followingCount: followingResult.ok ? followingResult.data : 0,
    savedCount: savedResult.ok ? savedResult.data : 0,
  };
}

/** Buyer counts plus follower count for farmers viewing their own profile. */
export async function loadProfileRelationshipCounts(
  supabase: SupabaseClient,
  userId: string,
  farmerProfileId: string | null | undefined,
): Promise<ProfileRelationshipCounts> {
  const [relationshipCounts, followerResult] = await Promise.all([
    loadUserRelationshipCounts(supabase, userId),
    farmerProfileId
      ? getFarmerFollowerCount(supabase, farmerProfileId)
      : Promise.resolve(null),
  ]);

  if (followerResult && !followerResult.ok) {
    logger.warn({
      operation: "relationshipCounts.loadProfileRelationshipCounts.follower",
      message: "Failed to load follower count; omitting from profile.",
      userId,
      ...(farmerProfileId ? { farmerId: farmerProfileId } : {}),
      errorCode: followerResult.error.code,
      error: followerResult.error.message,
    });
  }

  return {
    ...relationshipCounts,
    followerCount:
      followerResult && followerResult.ok ? followerResult.data : null,
  };
}
