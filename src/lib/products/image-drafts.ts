export type ProductImageDraft =
  | { id: string; kind: "existing"; url: string }
  | { id: string; kind: "new"; file: File; preview: string };

export function createExistingImageDraft(url: string): ProductImageDraft {
  return { id: `existing-${url}`, kind: "existing", url };
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
