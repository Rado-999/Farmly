import { getVillageFeed } from "@/lib/feed/getVillageFeed";
import type { VillageFeedSections } from "@/lib/feed/types";
import { syncGuestSavedFarms } from "@/lib/marketplace/saved-farms";
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
  await syncGuestSavedFarms(supabase, userId);

  const { lastVisitedAt, region } = await fetchVillageVisitState(supabase, userId);

  const feed = await getVillageFeed(supabase, userId, {
    lastVisitedAt,
    region,
  });

  await markVillageVisited(supabase, userId);

  return {
    ...feed,
    lastVisitedAt,
  };
}
