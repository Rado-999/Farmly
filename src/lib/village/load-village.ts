import { getVillageFeed } from "@/lib/feed/getVillageFeed";
import { logger } from "@/lib/logger";
import type { VillageFeedSections } from "@/lib/feed/types";
import {
  fetchVillageVisitState,
  markVillageVisited,
} from "@/lib/village/visit";
import type { SupabaseClient } from "@supabase/supabase-js";

export type VillagePageData = VillageFeedSections & {
  lastVisitedAt: string | null;
};

/** Load feed using prior visit timestamp, then record this visit. */
export async function loadVillagePageData(
  supabase: SupabaseClient,
  userId: string,
): Promise<VillagePageData> {
  const { lastVisitedAt, region } = await fetchVillageVisitState(supabase, userId);

  const feedResult = await getVillageFeed(supabase, userId, {
    lastVisitedAt,
    region,
  });

  if (!feedResult.ok) {
    logger.error({
      operation: "village.loadVillagePageData.getVillageFeed",
      message: "Failed to load the village feed.",
      userId,
      errorCode: feedResult.error.code,
      error: feedResult.error.message,
    });
    throw new Error(feedResult.error.message);
  }

  const feed = feedResult.data;

  try {
    await markVillageVisited(supabase, userId);
  } catch (error) {
    logger.warn({
      operation: "village.loadVillagePageData.markVillageVisited",
      message: "Failed to update the village visit timestamp after loading the page.",
      userId,
      errorCode: "village.visit_mark_failed",
      error,
    });
  }

  return {
    ...feed,
    lastVisitedAt,
  };
}
