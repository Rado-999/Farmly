import type { SupabaseClient } from "@supabase/supabase-js";

const PRODUCT_IMAGES_BUCKET = "product-images";

export async function uploadProductImageAtIndex(
  supabase: SupabaseClient,
  farmerId: string,
  productId: string,
  file: File,
  index: number,
): Promise<{ url: string | null; error: string | null }> {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${farmerId}/${productId}/${index}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    return { url: null, error: uploadError.message };
  }

  const { data } = supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .getPublicUrl(path);

  return { url: data.publicUrl, error: null };
}

export async function uploadProductImages(
  supabase: SupabaseClient,
  farmerId: string,
  productId: string,
  files: File[],
  startIndex = 0,
): Promise<{ urls: string[]; error: string | null }> {
  const urls: string[] = [];

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const upload = await uploadProductImageAtIndex(
      supabase,
      farmerId,
      productId,
      file,
      startIndex + index,
    );

    if (upload.error) {
      return { urls, error: upload.error };
    }

    if (upload.url) {
      urls.push(upload.url);
    }
  }

  return { urls, error: null };
}
