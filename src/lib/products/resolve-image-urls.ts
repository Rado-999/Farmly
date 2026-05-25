import type { SupabaseClient } from "@supabase/supabase-js";

import type { ProductImageDraft } from "@/lib/products/image-drafts";
import { uploadProductImageAtIndex } from "@/lib/products/storage";

export async function resolveProductImageUrls(
  supabase: SupabaseClient,
  farmerId: string,
  productId: string,
  drafts: ProductImageDraft[],
): Promise<{ urls: string[]; error: string | null }> {
  const urls: string[] = [];

  for (let index = 0; index < drafts.length; index += 1) {
    const draft = drafts[index];

    if (draft.kind === "existing") {
      urls.push(draft.url);
      continue;
    }

    const upload = await uploadProductImageAtIndex(
      supabase,
      farmerId,
      productId,
      draft.file,
      index,
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
