import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createSignedDraftProductImageUrl,
  isDraftProductImageRef,
} from "@/lib/products/storage";

export type ProductImageDraft =
  | {
      id: string;
      kind: "existing";
      storedValue: string;
      previewUrl: string;
    }
  | { id: string; kind: "new"; file: File; preview: string };

export function createExistingImageDraft(
  storedValue: string,
  previewUrl = storedValue,
): ProductImageDraft {
  return {
    id: `existing-${storedValue}`,
    kind: "existing",
    storedValue,
    previewUrl,
  };
}

export function createNewImageDraft(file: File, preview: string): ProductImageDraft {
  return {
    id: `new-${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 9)}`,
    kind: "new",
    file,
    preview,
  };
}

export function buildImageDraftsFromProduct(
  urls: string[] | null | undefined,
): ProductImageDraft[] {
  return (urls ?? []).map((url) => createExistingImageDraft(url));
}

export async function buildImageDraftsFromStoredProductImages(
  supabase: SupabaseClient,
  storedValues: string[] | null | undefined,
): Promise<ProductImageDraft[]> {
  return Promise.all(
    (storedValues ?? []).map(async (storedValue) => {
      const previewUrl = isDraftProductImageRef(storedValue)
        ? await createSignedDraftProductImageUrl(supabase, storedValue)
        : storedValue;

      return createExistingImageDraft(storedValue, previewUrl);
    }),
  );
}
