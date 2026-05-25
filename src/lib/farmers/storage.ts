import type { SupabaseClient } from "@supabase/supabase-js";

const FARMER_COVERS_BUCKET = "farmer-covers";

export async function uploadFarmerCover(
  supabase: SupabaseClient,
  farmerProfileId: string,
  file: File,
): Promise<{ url: string | null; error: string | null }> {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${farmerProfileId}/cover.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(FARMER_COVERS_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    return { url: null, error: uploadError.message };
  }

  const { data } = supabase.storage
    .from(FARMER_COVERS_BUCKET)
    .getPublicUrl(path);

  return { url: data.publicUrl, error: null };
}
