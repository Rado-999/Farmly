import type { SupabaseClient } from "@supabase/supabase-js";

import type { ProductImageDraft } from "@/lib/products/image-drafts";
import type { ProductStatus } from "@/lib/supabase/database.types";
import {
  isDraftProductImageRef,
  privatizePublicProductImage,
  promoteDraftProductImageToPublic,
  uploadDraftProductImageAtIndex,
  uploadProductImageAtIndex,
} from "@/lib/products/storage";

export async function resolveProductImageUrls(
  supabase: SupabaseClient,
  farmerId: string,
  productId: string,
  drafts: ProductImageDraft[],
  status: ProductStatus,
): Promise<{ urls: string[]; error: string | null }> {
  const urls: string[] = [];

  for (let index = 0; index < drafts.length; index += 1) {
    const draft = drafts[index];

    if (draft.kind === "existing") {
      if (status === "published") {
        if (isDraftProductImageRef(draft.storedValue)) {
          const promoted = await promoteDraftProductImageToPublic(
            supabase,
            draft.storedValue,
          );

          if (promoted.error || !promoted.url) {
            return { urls, error: promoted.error ?? "Could not publish image." };
          }

          urls.push(promoted.url);
          continue;
        }

        urls.push(draft.storedValue);
        continue;
      }

      if (isDraftProductImageRef(draft.storedValue)) {
        urls.push(draft.storedValue);
        continue;
      }

      const privatized = await privatizePublicProductImage(
        supabase,
        draft.storedValue,
      );

      if (privatized.error || !privatized.ref) {
        return {
          urls,
          error: privatized.error ?? "Could not secure the draft image.",
        };
      }

      urls.push(privatized.ref);
      continue;
    }

    const upload =
      status === "published"
        ? await uploadProductImageAtIndex(
            supabase,
            farmerId,
            productId,
            draft.file,
            index,
          )
        : await uploadDraftProductImageAtIndex(
            supabase,
            farmerId,
            productId,
            draft.file,
            index,
          );

    if (upload.error) {
      return { urls, error: upload.error };
    }

    if (status === "published" && "url" in upload && upload.url) {
      urls.push(upload.url);
    }

    if (status === "draft" && "ref" in upload && upload.ref) {
      urls.push(upload.ref);
    }
  }

  return { urls, error: null };
}
