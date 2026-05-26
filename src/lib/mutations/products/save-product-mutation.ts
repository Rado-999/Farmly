import type { SupabaseClient } from "@supabase/supabase-js";

import { err, ok, type Result } from "@/lib/errors/result";
import type { ProductImageDraft } from "@/lib/products/image-drafts";
import {
  createProduct,
  setProductVideoLinks,
  updateProduct,
} from "@/lib/products/queries";
import { resolveProductImageUrls } from "@/lib/products/resolve-image-urls";
import {
  removeStoredProductImage,
  verifyStoredProductImageExists,
} from "@/lib/products/storage";
import type { ProductFormValues } from "@/lib/products/types";
import {
  type ProductValidationErrorCode,
  validateProductDraft,
  validateProductPublish,
} from "@/lib/products/validation";
import type { ProductRow, ProductStatus } from "@/lib/supabase/database.types";

export type SaveProductArgs = {
  supabase: SupabaseClient;
  farmerProfileId: string;
  productId?: string;
  values: ProductFormValues;
  imageDrafts: ProductImageDraft[];
  intent: "draft" | "publish";
};

type SaveProductErrorCode =
  | ProductValidationErrorCode
  | "product.save_failed"
  | "product.image_resolution_failed"
  | "product.video_link_failed"
  | "conflict"
  | "consistency_error";

export type SaveProductResult = Result<
  { productId: string },
  SaveProductErrorCode
>;

type ProductSnapshot = {
  product: ProductRow | null;
  linkedVideoIds: string[];
};

const PRODUCT_SELECT =
  "id, farmer_id, title, description, price, season, category, images, status, price_unit, published_at";

function normalizePrice(price: string): number | null {
  if (price.trim() === "") {
    return null;
  }

  return Number.parseFloat(price);
}

function normalizeProductPayload(
  values: ProductFormValues,
  status: ProductStatus,
  price: number | null,
  images: string[],
) {
  return {
    title: values.title.trim() || "Чернова",
    description: values.description.trim() || null,
    price,
    priceUnit: values.priceUnit,
    category: values.category || null,
    season: values.season.trim() || null,
    images,
    status,
  };
}

function haveSameIds(left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  const leftSorted = [...left].sort();
  const rightSorted = [...right].sort();

  return leftSorted.every((value, index) => value === rightSorted[index]);
}

async function loadProductSnapshot(
  supabase: SupabaseClient,
  farmerProfileId: string,
  productId?: string,
): Promise<{ snapshot: ProductSnapshot | null; error: string | null }> {
  if (!productId) {
    return { snapshot: null, error: null };
  }

  const [{ data: product, error: productError }, { data: videos, error: videosError }] =
    await Promise.all([
      supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("id", productId)
        .eq("farmer_id", farmerProfileId)
        .maybeSingle(),
      supabase
        .from("videos")
        .select("id")
        .eq("farmer_id", farmerProfileId)
        .eq("product_id", productId),
    ]);

  if (productError) {
    return { snapshot: null, error: productError.message };
  }

  if (videosError) {
    return { snapshot: null, error: videosError.message };
  }

  return {
    snapshot: {
      product: (product as ProductRow | null) ?? null,
      linkedVideoIds: (videos ?? []).map((video) => video.id),
    },
    error: null,
  };
}

function normalizeSnapshotValue(value: ProductRow["price"] | null | undefined) {
  return value == null ? null : String(value);
}

function areProductRowsEquivalent(
  left: ProductRow | null,
  right: ProductRow | null,
): boolean {
  if (!left && !right) {
    return true;
  }

  if (!left || !right) {
    return false;
  }

  return (
    left.id === right.id &&
    left.farmer_id === right.farmer_id &&
    left.title === right.title &&
    (left.description ?? null) === (right.description ?? null) &&
    normalizeSnapshotValue(left.price) === normalizeSnapshotValue(right.price) &&
    (left.season ?? null) === (right.season ?? null) &&
    (left.category ?? null) === (right.category ?? null) &&
    JSON.stringify(left.images ?? []) === JSON.stringify(right.images ?? []) &&
    (left.status ?? null) === (right.status ?? null) &&
    (left.price_unit ?? null) === (right.price_unit ?? null) &&
    (left.published_at ?? null) === (right.published_at ?? null)
  );
}

async function ensureSnapshotStillCurrent(
  supabase: SupabaseClient,
  farmerProfileId: string,
  productId: string,
  expected: ProductSnapshot | null,
): Promise<{ conflict: boolean; error: string | null }> {
  const latest = await loadProductSnapshot(supabase, farmerProfileId, productId);

  if (latest.error) {
    return { conflict: false, error: latest.error };
  }

  const latestSnapshot = latest.snapshot;

  if (!expected || !latestSnapshot) {
    return { conflict: false, error: null };
  }

  const sameProduct = areProductRowsEquivalent(
    latestSnapshot.product,
    expected.product,
  );
  const sameVideos = haveSameIds(
    latestSnapshot.linkedVideoIds,
    expected.linkedVideoIds,
  );

  return { conflict: !(sameProduct && sameVideos), error: null };
}

async function updateExistingProductWithOptimisticLock(
  supabase: SupabaseClient,
  farmerProfileId: string,
  productId: string,
  payload: ReturnType<typeof normalizeProductPayload>,
  snapshot: ProductRow,
): Promise<{
  product: ProductRow | null;
  error: string | null;
  conflict: boolean;
}> {
  let query = supabase
    .from("products")
    .update({
      title: payload.title,
      description: payload.description,
      price: payload.price,
      price_unit: payload.priceUnit,
      category: payload.category,
      season: payload.season,
      images: payload.images,
      status: payload.status,
      published_at: payload.status === "published"
        ? (snapshot.published_at ?? new Date().toISOString())
        : null,
    })
    .eq("id", productId)
    .eq("farmer_id", farmerProfileId)
    .eq("title", snapshot.title);

  query =
    snapshot.description == null
      ? query.is("description", null)
      : query.eq("description", snapshot.description);
  query =
    snapshot.price == null
      ? query.is("price", null)
      : query.eq("price", snapshot.price);
  query =
    snapshot.season == null
      ? query.is("season", null)
      : query.eq("season", snapshot.season);
  query =
    snapshot.category == null
      ? query.is("category", null)
      : query.eq("category", snapshot.category);
  query =
    snapshot.status == null
      ? query.is("status", null)
      : query.eq("status", snapshot.status);
  query =
    snapshot.price_unit == null
      ? query.is("price_unit", null)
      : query.eq("price_unit", snapshot.price_unit);
  query =
    snapshot.published_at == null
      ? query.is("published_at", null)
      : query.eq("published_at", snapshot.published_at);

  const { data, error } = await query.select(PRODUCT_SELECT).maybeSingle();

  if (error) {
    return { product: null, error: error.message, conflict: false };
  }

  if (!data) {
    return { product: null, error: null, conflict: true };
  }

  return { product: data as ProductRow, error: null, conflict: false };
}

async function restoreProductVideoLinks(
  supabase: SupabaseClient,
  farmerProfileId: string,
  productId: string,
  videoIds: string[],
): Promise<{ error: string | null }> {
  const result = await setProductVideoLinks(
    supabase,
    farmerProfileId,
    productId,
    videoIds,
  );

  return { error: result.error };
}

async function cleanupNewUploadedImages(
  supabase: SupabaseClient,
  drafts: ProductImageDraft[],
  resolvedValues: string[],
): Promise<{ error: string | null }> {
  const uploadedValues = drafts.flatMap((draft, index) =>
    draft.kind === "new" && resolvedValues[index] ? [resolvedValues[index]] : [],
  );

  for (const value of uploadedValues) {
    const removal = await removeStoredProductImage(supabase, value);

    if (removal.error) {
      return { error: removal.error };
    }
  }

  return { error: null };
}

async function cleanupCreatedProduct(
  supabase: SupabaseClient,
  farmerProfileId: string,
  productId: string,
): Promise<{ error: string | null }> {
  const clearLinks = await restoreProductVideoLinks(
    supabase,
    farmerProfileId,
    productId,
    [],
  );

  if (clearLinks.error) {
    return { error: clearLinks.error };
  }

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("farmer_id", farmerProfileId);

  return { error: error?.message ?? null };
}

async function verifyProductConsistency(
  supabase: SupabaseClient,
  farmerProfileId: string,
  productId: string,
  expected: ReturnType<typeof normalizeProductPayload>,
  expectedVideoIds: string[],
): Promise<{ consistent: boolean; error: string | null }> {
  const [{ data: product, error: productError }, { data: videos, error: videosError }] =
    await Promise.all([
      supabase
        .from("products")
        .select(
          "id, farmer_id, title, description, price, season, category, images, status, price_unit, published_at",
        )
        .eq("id", productId)
        .eq("farmer_id", farmerProfileId)
        .maybeSingle(),
      supabase
        .from("videos")
        .select("id")
        .eq("farmer_id", farmerProfileId)
        .eq("product_id", productId),
    ]);

  if (productError) {
    return { consistent: false, error: productError.message };
  }

  if (videosError) {
    return { consistent: false, error: videosError.message };
  }

  const row = (product as ProductRow | null) ?? null;

  if (!row) {
    return { consistent: false, error: null };
  }

  const persistedImages = row.images ?? [];
  const persistedPrice =
    row.price == null ? null : Number.parseFloat(String(row.price));
  const currentVideoIds = (videos ?? []).map((video) => video.id);

  const matches =
    row.title === expected.title &&
    (row.description ?? null) === expected.description &&
    persistedPrice === expected.price &&
    (row.price_unit ?? null) === expected.priceUnit &&
    (row.category ?? null) === expected.category &&
    (row.season ?? null) === expected.season &&
    (row.status ?? null) === expected.status &&
    JSON.stringify(persistedImages) === JSON.stringify(expected.images) &&
    haveSameIds(currentVideoIds, expectedVideoIds);

  if (!matches) {
    return { consistent: false, error: null };
  }

  for (const image of expected.images) {
    const exists = await verifyStoredProductImageExists(supabase, image);

    if (exists.error) {
      return { consistent: false, error: exists.error };
    }

    if (!exists.exists) {
      return { consistent: false, error: null };
    }
  }

  return { consistent: true, error: null };
}

export async function executeSaveProductMutation(
  args: SaveProductArgs,
): Promise<SaveProductResult> {
  const status: ProductStatus =
    args.intent === "publish" ? "published" : "draft";
  const imageCount = args.imageDrafts.length;

  const validation =
    status === "published"
      ? validateProductPublish(args.values, imageCount)
      : validateProductDraft(args.values);

  if (!validation.ok) {
    return err(validation.error.code, validation.error.message);
  }

  const price = normalizePrice(args.values.price);

  if (status === "published" && (price === null || Number.isNaN(price))) {
    return err(
      "product.price_invalid",
      "Въведете валидна цена по-голяма от нула.",
    );
  }

  const snapshotResult = await loadProductSnapshot(
    args.supabase,
    args.farmerProfileId,
    args.productId,
  );

  if (snapshotResult.error) {
    return err("product.save_failed", snapshotResult.error);
  }

  const previousSnapshot = snapshotResult.snapshot;
  let productId = args.productId;
  let createdProduct = false;
  let resolvedImageValues: string[] = [];

  if (!productId) {
    const payload = normalizeProductPayload(args.values, "draft", price, []);
    const { product, error } = await createProduct(
      args.supabase,
      args.farmerProfileId,
      payload,
    );

    if (error || !product) {
      return err("product.save_failed", error ?? "Неуспешно запазване.");
    }

    productId = product.id;
    createdProduct = true;
  }

  if (!createdProduct) {
    const preflight = await ensureSnapshotStillCurrent(
      args.supabase,
      args.farmerProfileId,
      productId,
      previousSnapshot,
    );

    if (preflight.error) {
      return err("product.save_failed", preflight.error);
    }

    if (preflight.conflict) {
      return err(
        "conflict",
        "Продуктът беше променен в друга сесия. Обновете и опитайте отново.",
      );
    }
  }

  const resolvedImages = await resolveProductImageUrls(
    args.supabase,
    args.farmerProfileId,
    productId,
    args.imageDrafts,
    status,
  );

  resolvedImageValues = resolvedImages.urls;

  if (resolvedImages.error) {
    const cleanupImages = await cleanupNewUploadedImages(
      args.supabase,
      args.imageDrafts,
      resolvedImageValues,
    );

    if (cleanupImages.error) {
      return err(
        "consistency_error",
        resolvedImages.error ?? "Неуспешно запазване.",
      );
    }

    if (createdProduct) {
      const cleanupProduct = await cleanupCreatedProduct(
        args.supabase,
        args.farmerProfileId,
        productId,
      );

      if (cleanupProduct.error || cleanupImages.error) {
        return err(
          "consistency_error",
          resolvedImages.error ?? "Неуспешно запазване.",
        );
      }
    }

    return err("product.image_resolution_failed", resolvedImages.error);
  }

  const payload = normalizeProductPayload(
    args.values,
    status,
    price,
    resolvedImageValues,
  );

  const { product, error, conflict } =
    !createdProduct && previousSnapshot?.product
      ? await updateExistingProductWithOptimisticLock(
          args.supabase,
          args.farmerProfileId,
          productId,
          payload,
          previousSnapshot.product,
        )
      : await updateProduct(
          args.supabase,
          productId,
          args.farmerProfileId,
          payload,
        ).then((result) => ({ ...result, conflict: false }));

  if (conflict) {
    const cleanupImages = await cleanupNewUploadedImages(
      args.supabase,
      args.imageDrafts,
      resolvedImageValues,
    );

    if (cleanupImages.error) {
      return err(
        "consistency_error",
        "Продуктът беше променен в друга сесия. Обновете и опитайте отново.",
      );
    }

    return err(
      "conflict",
      "Продуктът беше променен в друга сесия. Обновете и опитайте отново.",
    );
  }

  if (error || !product) {
    const cleanupImages = await cleanupNewUploadedImages(
      args.supabase,
      args.imageDrafts,
      resolvedImageValues,
    );

    if (cleanupImages.error) {
      return err(
        "consistency_error",
        error ?? "Неуспешно запазване.",
      );
    }

    if (createdProduct) {
      const cleanupProduct = await cleanupCreatedProduct(
        args.supabase,
        args.farmerProfileId,
        productId,
      );

      if (cleanupProduct.error || cleanupImages.error) {
        return err(
          "consistency_error",
          error ?? "Неуспешно запазване.",
        );
      }
    }

    return err("product.save_failed", error ?? "Неуспешно запазване.");
  }

  const videoResult = await setProductVideoLinks(
    args.supabase,
    args.farmerProfileId,
    productId,
    args.values.videoIds,
  );

  if (videoResult.error) {
    const restoreLinks = await restoreProductVideoLinks(
      args.supabase,
      args.farmerProfileId,
      productId,
      previousSnapshot?.linkedVideoIds ?? [],
    );

    if (createdProduct) {
      const cleanupImages = await cleanupNewUploadedImages(
        args.supabase,
        args.imageDrafts,
        resolvedImageValues,
      );
      const cleanupProduct = await cleanupCreatedProduct(
        args.supabase,
        args.farmerProfileId,
        productId,
      );

      if (cleanupImages.error || cleanupProduct.error || restoreLinks.error) {
        return err("consistency_error", videoResult.error);
      }
    } else if (restoreLinks.error) {
      return err("consistency_error", videoResult.error);
    }

    return err("product.video_link_failed", videoResult.error);
  }

  const verification = await verifyProductConsistency(
    args.supabase,
    args.farmerProfileId,
    productId,
    payload,
    args.values.videoIds,
  );

  if (verification.error || !verification.consistent) {
    if (createdProduct) {
      const cleanupImages = await cleanupNewUploadedImages(
        args.supabase,
        args.imageDrafts,
        resolvedImageValues,
      );
      const cleanupProduct = await cleanupCreatedProduct(
        args.supabase,
        args.farmerProfileId,
        productId,
      );

      if (cleanupImages.error || cleanupProduct.error) {
        return err("consistency_error", "Неуспешно запазване.");
      }
    } else {
      await restoreProductVideoLinks(
        args.supabase,
        args.farmerProfileId,
        productId,
        previousSnapshot?.linkedVideoIds ?? [],
      );
    }

    return err("consistency_error", "Неуспешно запазване.");
  }

  return ok({ productId });
}
