import type { SupabaseClient } from "@supabase/supabase-js";

import type { ProductImageDraft } from "@/lib/products/image-drafts";
import type { ProductFormValues } from "@/lib/products/types";
import {
  createProduct,
  setProductVideoLinks,
  updateProduct,
} from "@/lib/products/queries";
import { resolveProductImageUrls } from "@/lib/products/resolve-image-urls";
import {
  validateProductDraft,
  validateProductPublish,
} from "@/lib/products/validation";
import type { ProductStatus } from "@/lib/supabase/database.types";

type SaveProductArgs = {
  supabase: SupabaseClient;
  farmerProfileId: string;
  productId?: string;
  values: ProductFormValues;
  imageDrafts: ProductImageDraft[];
  intent: "draft" | "publish";
};

type SaveProductResult =
  | { ok: true; productId: string }
  | { ok: false; message: string };

export async function saveProduct(
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
    return { ok: false, message: validation.message };
  }

  const price =
    args.values.price.trim() === ""
      ? null
      : Number.parseFloat(args.values.price);

  if (status === "published" && (price === null || Number.isNaN(price))) {
    return { ok: false, message: "Въведете валидна цена по-голяма от нула." };
  }

  let productId = args.productId;

  if (!productId) {
    const { product, error } = await createProduct(args.supabase, args.farmerProfileId, {
      title: args.values.title.trim() || "Чернова",
      description: args.values.description || null,
      price: status === "published" ? price : price,
      priceUnit: args.values.priceUnit,
      category: args.values.category || null,
      season: args.values.season || null,
      images: [],
      status: "draft",
    });

    if (error || !product) {
      return { ok: false, message: error ?? "Неуспешно запазване." };
    }

    productId = product.id;
  }

  const resolvedImages = await resolveProductImageUrls(
    args.supabase,
    args.farmerProfileId,
    productId,
    args.imageDrafts,
    status,
  );

  if (resolvedImages.error) {
    return { ok: false, message: resolvedImages.error };
  }

  const { product, error } = await updateProduct(
    args.supabase,
    productId,
    args.farmerProfileId,
    {
      title: args.values.title.trim() || "Чернова",
      description: args.values.description || null,
      price: status === "published" ? price : price,
      priceUnit: args.values.priceUnit,
      category: args.values.category || null,
      season: args.values.season || null,
      images: resolvedImages.urls,
      status,
    },
  );

  if (error || !product) {
    return { ok: false, message: error ?? "Неуспешно запазване." };
  }

  const videoResult = await setProductVideoLinks(
    args.supabase,
    args.farmerProfileId,
    productId,
    args.values.videoIds,
  );

  if (videoResult.error) {
    return { ok: false, message: videoResult.error };
  }

  return { ok: true, productId };
}
