import "server-only";

import { unstable_cache } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import { FARMER_PROFILE_SELECT } from "@/lib/farmers/farmer-profile-row";
import { mapProductDetail } from "@/lib/products/mappers";
import {
  createSignedDraftProductImageUrl,
  isDraftProductImageRef,
} from "@/lib/products/storage";
import type { ProductDetail } from "@/lib/products/types";
import type {
  FarmerProfileRow,
  ProductRow,
  ReviewRow,
  VideoRow,
} from "@/lib/supabase/database.types";
import { createServerPublicSupabaseClientOrThrow } from "@/lib/supabase/server";

const REVALIDATE_SECONDS = 60;

const PRODUCT_SELECT =
  "id, farmer_id, title, description, price, season, category, images, status, price_unit, published_at";

async function resolveProductImagesForRead(
  supabase: SupabaseClient,
  product: ProductRow,
): Promise<ProductRow> {
  const images = await Promise.all(
    (product.images ?? []).map(async (image) =>
      isDraftProductImageRef(image)
        ? createSignedDraftProductImageUrl(supabase, image)
        : image,
    ),
  );

  return {
    ...product,
    images,
  };
}

export async function getProductByIdWithSupabase(
  supabase: SupabaseClient,
  productId: string,
): Promise<ProductDetail | null> {
  const { data: product, error: productError } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", productId)
    .maybeSingle();

  if (productError) {
    throw new Error(productError.message);
  }

  if (!product) {
    return null;
  }

  const productRow = await resolveProductImagesForRead(
    supabase,
    product as ProductRow,
  );

  const { data: farmer, error: farmerError } = await supabase
    .from("farmer_profiles")
    .select(FARMER_PROFILE_SELECT)
    .eq("id", productRow.farmer_id ?? "")
    .maybeSingle();

  if (farmerError) {
    throw new Error(farmerError.message);
  }

  if (!farmer) {
    return null;
  }

  const [{ data: videos }, { data: reviews }] = await Promise.all([
    supabase
      .from("videos")
      .select(
        "id, farmer_id, product_id, title, description, type, video_url, poster_url, duration_seconds",
      )
      .eq("product_id", productId)
      .order("created_at", { ascending: false }),
    supabase
      .from("reviews")
      .select(
        "id, farmer_id, product_id, rating, comment, created_at, author_display_name",
      )
      .eq("product_id", productId)
      .order("created_at", { ascending: false }),
  ]);

  return mapProductDetail(
    productRow,
    farmer as FarmerProfileRow,
    (videos ?? []) as VideoRow[],
    (reviews ?? []) as ReviewRow[],
  );
}

async function fetchPublicProductById(
  productId: string,
): Promise<ProductDetail | null> {
  const supabase = createServerPublicSupabaseClientOrThrow();

  return getProductByIdWithSupabase(supabase, productId);
}

const getCachedPublicProductById = unstable_cache(
  fetchPublicProductById,
  ["public-product-detail"],
  { revalidate: REVALIDATE_SECONDS },
);

export async function getProductById(
  productId: string,
): Promise<ProductDetail | null> {
  return getCachedPublicProductById(productId);
}
