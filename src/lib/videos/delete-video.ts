import type { SupabaseClient } from "@supabase/supabase-js";

import {
  executeDeleteFarmerVideoMutation,
  type DeleteVideoResult,
} from "@/lib/mutations/videos/delete-farmer-video-mutation";

export async function deleteFarmerVideo(
  supabase: SupabaseClient,
  farmerProfileId: string,
  videoId: string,
): Promise<DeleteVideoResult> {
  return executeDeleteFarmerVideoMutation(supabase, farmerProfileId, videoId);
}
