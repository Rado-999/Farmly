import type { SupabaseClient } from "@supabase/supabase-js";

const PRODUCT_IMAGES_BUCKET = "product-images";
const PRODUCT_DRAFT_IMAGES_BUCKET = "product-draft-images";
const PRODUCT_DRAFT_REF_PREFIX = "draft-image:";

function getFileExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? "jpg";
}

function buildProductImagePath(
  farmerId: string,
  productId: string,
  index: number,
  extension: string,
): string {
  return `${farmerId}/${productId}/${index}.${extension}`;
}

function getPublicProductImagePath(url: string): string | null {
  try {
    const pathname = new URL(url).pathname;
    const prefix = `/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/`;

    if (!pathname.startsWith(prefix)) {
      return null;
    }

    return decodeURIComponent(pathname.slice(prefix.length));
  } catch {
    return null;
  }
}

function createDraftProductImageRef(path: string): string {
  return `${PRODUCT_DRAFT_REF_PREFIX}${path}`;
}

function getDraftProductImagePath(ref: string): string | null {
  if (!isDraftProductImageRef(ref)) {
    return null;
  }

  return ref.slice(PRODUCT_DRAFT_REF_PREFIX.length) || null;
}

async function uploadStorageObject(
  supabase: SupabaseClient,
  bucket: string,
  path: string,
  file: File | Blob,
  contentType?: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    ...(contentType ? { contentType } : {}),
  });

  return { error: error?.message ?? null };
}

async function downloadStorageObject(
  supabase: SupabaseClient,
  bucket: string,
  path: string,
): Promise<{ file: Blob | null; error: string | null }> {
  const { data, error } = await supabase.storage.from(bucket).download(path);

  if (error || !data) {
    return { file: null, error: error?.message ?? "Could not download image." };
  }

  return { file: data, error: null };
}

async function removeStorageObject(
  supabase: SupabaseClient,
  bucket: string,
  path: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.storage.from(bucket).remove([path]);

  return { error: error?.message ?? null };
}

export function isDraftProductImageRef(value: string): boolean {
  return value.startsWith(PRODUCT_DRAFT_REF_PREFIX);
}

export function getDisplayableProductImageUrl(
  value: string | null | undefined,
): string | null {
  if (!value || isDraftProductImageRef(value)) {
    return null;
  }

  return value;
}

export async function uploadProductImageAtIndex(
  supabase: SupabaseClient,
  farmerId: string,
  productId: string,
  file: File,
  index: number,
): Promise<{ url: string | null; error: string | null }> {
  const path = buildProductImagePath(
    farmerId,
    productId,
    index,
    getFileExtension(file.name),
  );
  const upload = await uploadStorageObject(
    supabase,
    PRODUCT_IMAGES_BUCKET,
    path,
    file,
    file.type,
  );

  if (upload.error) {
    return { url: null, error: upload.error };
  }

  const { data } = supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .getPublicUrl(path);

  return { url: data.publicUrl, error: null };
}

export async function uploadDraftProductImageAtIndex(
  supabase: SupabaseClient,
  farmerId: string,
  productId: string,
  file: File,
  index: number,
): Promise<{ ref: string | null; error: string | null }> {
  const path = buildProductImagePath(
    farmerId,
    productId,
    index,
    getFileExtension(file.name),
  );
  const upload = await uploadStorageObject(
    supabase,
    PRODUCT_DRAFT_IMAGES_BUCKET,
    path,
    file,
    file.type,
  );

  if (upload.error) {
    return { ref: null, error: upload.error };
  }

  return { ref: createDraftProductImageRef(path), error: null };
}

export async function createSignedDraftProductImageUrl(
  supabase: SupabaseClient,
  ref: string,
  expiresInSeconds = 3600,
): Promise<string> {
  const path = getDraftProductImagePath(ref);

  if (!path) {
    throw new Error("Invalid draft product image reference.");
  }

  const { data, error } = await supabase.storage
    .from(PRODUCT_DRAFT_IMAGES_BUCKET)
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? "Could not sign the draft image.");
  }

  return data.signedUrl;
}

export async function promoteDraftProductImageToPublic(
  supabase: SupabaseClient,
  ref: string,
): Promise<{ url: string | null; error: string | null }> {
  const path = getDraftProductImagePath(ref);

  if (!path) {
    return { url: null, error: "Invalid draft product image reference." };
  }

  const download = await downloadStorageObject(
    supabase,
    PRODUCT_DRAFT_IMAGES_BUCKET,
    path,
  );

  if (download.error || !download.file) {
    return { url: null, error: download.error };
  }

  const upload = await uploadStorageObject(
    supabase,
    PRODUCT_IMAGES_BUCKET,
    path,
    download.file,
    download.file.type,
  );

  if (upload.error) {
    return { url: null, error: upload.error };
  }

  const cleanup = await removeStorageObject(
    supabase,
    PRODUCT_DRAFT_IMAGES_BUCKET,
    path,
  );

  if (cleanup.error) {
    return { url: null, error: cleanup.error };
  }

  const { data } = supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .getPublicUrl(path);

  return { url: data.publicUrl, error: null };
}

export async function privatizePublicProductImage(
  supabase: SupabaseClient,
  imageUrl: string,
): Promise<{ ref: string | null; error: string | null }> {
  const path = getPublicProductImagePath(imageUrl);

  if (!path) {
    return { ref: null, error: "Invalid public product image URL." };
  }

  const download = await downloadStorageObject(
    supabase,
    PRODUCT_IMAGES_BUCKET,
    path,
  );

  if (download.error || !download.file) {
    return { ref: null, error: download.error };
  }

  const upload = await uploadStorageObject(
    supabase,
    PRODUCT_DRAFT_IMAGES_BUCKET,
    path,
    download.file,
    download.file.type,
  );

  if (upload.error) {
    return { ref: null, error: upload.error };
  }

  return { ref: createDraftProductImageRef(path), error: null };
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
