import type { SupabaseClient } from "@supabase/supabase-js";

import { deleteVideoRow } from "@/lib/videos/queries";
import { deleteFarmerVideoFiles } from "@/lib/videos/storage";

type DeleteVideoResult = { ok: true } | { ok: false; message: string };

export async function deleteFarmerVideo(
  supabase: SupabaseClient,
  farmerProfileId: string,
  videoId: string,
): Promise<DeleteVideoResult> {
  const storageResult = await deleteFarmerVideoFiles(
    supabase,
    farmerProfileId,
    videoId,
  );

  if (storageResult.error) {
    return { ok: false, message: storageResult.error };
  }

  const rowResult = await deleteVideoRow(supabase, videoId, farmerProfileId);

  if (rowResult.error) {
    return { ok: false, message: rowResult.error };
  }

  return { ok: true };
}
