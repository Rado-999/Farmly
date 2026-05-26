import type { SupabaseClient } from "@supabase/supabase-js";

import {
  queryAllowed,
  queryDatabaseError,
  queryDenied,
  queryNotFound,
  type QueryAccessResult,
  type QueryResult,
} from "@/lib/errors/query-result";
import { ok } from "@/lib/errors/result";
import { FARMER_PROFILE_SELECT } from "@/lib/farmers/farmer-profile-row";
import { mapProductDetail, mapProductListItem } from "@/lib/products/mappers";
import type { ProductDetail, ProductListItem } from "@/lib/products/types";
import type {
  FarmerProfileRow,
  ProductPriceUnit,
  ProductRow,
  ProductStatus,
  ReviewRow,
  VideoRow,
} from "@/lib/supabase/database.types";
import { createSupabaseClient } from "@/lib/supabase";

const PRODUCT_SELECT =
  "id, farmer_id, title, description, price, season, category, images, status, price_unit, published_at";

function getSupabaseResult(): QueryResult<SupabaseClient> {
  const supabase = createSupabaseClient();

  if (!supabase) {
    return queryDatabaseError(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local.",
    );
  }

  return ok(supabase);
}

export async function listFarmerProducts(
  farmerProfileId: string,
  farmerSlug: string,
  options: { includeDrafts?: boolean } = {},
): Promise<QueryResult<ProductListItem[]>> {
  const supabaseResult = getSupabaseResult();

  if (!supabaseResult.ok) {
    return supabaseResult;
  }

  const supabase = supabaseResult.data;

  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("farmer_id", farmerProfileId)
    .order("created_at", { ascending: false });

  if (!options.includeDrafts) {
    query = query.eq("status", "published");
  }

  const { data, error } = await query;

  if (error) {
    return queryDatabaseError(error.message);
  }

  return ok(
    ((data ?? []) as ProductRow[]).map((product) =>
      mapProductListItem(product, farmerSlug),
    ),
  );
}

export async function getProductById(
  productId: string,
): Promise<QueryResult<ProductDetail>> {
  const supabaseResult = getSupabaseResult();

  if (!supabaseResult.ok) {
    return supabaseResult;
  }

  const supabase = supabaseResult.data;

  const { data: product, error: productError } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", productId)
    .maybeSingle();

  if (productError) {
    return queryDatabaseError(productError.message);
  }

  if (!product) {
    return queryNotFound("Product not found.");
  }

  const productRow = product as ProductRow;

  const { data: farmer, error: farmerError } = await supabase
    .from("farmer_profiles")
    .select(FARMER_PROFILE_SELECT)
    .eq("id", productRow.farmer_id ?? "")
    .maybeSingle();

  if (farmerError) {
    return queryDatabaseError(farmerError.message);
  }

  if (!farmer) {
    return queryNotFound("Farmer not found.");
  }

  const [
    { data: videos, error: videosError },
    { data: reviews, error: reviewsError },
  ] = await Promise.all([
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

  if (videosError) {
    return queryDatabaseError(videosError.message);
  }

  if (reviewsError) {
    return queryDatabaseError(reviewsError.message);
  }

  return ok(
    mapProductDetail(
      productRow,
      farmer as FarmerProfileRow,
      (videos ?? []) as VideoRow[],
      (reviews ?? []) as ReviewRow[],
    ),
  );
}

export async function listFarmerVideosForPicker(
  supabase: SupabaseClient,
  farmerProfileId: string,
): Promise<QueryResult<VideoRow[]>> {
  const { data, error } = await supabase
    .from("videos")
    .select(
      "id, farmer_id, product_id, title, description, type, video_url, poster_url, duration_seconds",
    )
    .eq("farmer_id", farmerProfileId)
    .order("created_at", { ascending: false });

  if (error) {
    return queryDatabaseError(error.message);
  }

  return ok((data ?? []) as VideoRow[]);
}

export async function getProductForEdit(
  supabase: SupabaseClient,
  productId: string,
  farmerProfileId: string,
): Promise<QueryResult<ProductRow>> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", productId)
    .eq("farmer_id", farmerProfileId)
    .maybeSingle();

  if (error) {
    return queryDatabaseError(error.message);
  }

  if (!data) {
    return queryNotFound("Product not found.");
  }

  return ok(data as ProductRow);
}

export async function createProduct(
  supabase: SupabaseClient,
  farmerProfileId: string,
  payload: {
    title: string;
    description: string | null;
    price: number | null;
    priceUnit: ProductPriceUnit;
    category: string | null;
    season: string | null;
    images: string[];
    status: ProductStatus;
  },
): Promise<{ product: ProductRow | null; error: string | null }> {
  const { data, error } = await supabase
    .from("products")
    .insert({
      farmer_id: farmerProfileId,
      title: payload.title.trim(),
      description: payload.description?.trim() || null,
      price: payload.price,
      price_unit: payload.priceUnit,
      category: payload.category,
      season: payload.season?.trim() || null,
      images: payload.images,
      status: payload.status,
      published_at: payload.status === "published" ? new Date().toISOString() : null,
    })
    .select(PRODUCT_SELECT)
    .single();

  if (error) {
    return { product: null, error: error.message };
  }

  return { product: data as ProductRow, error: null };
}

export async function updateProduct(
  supabase: SupabaseClient,
  productId: string,
  farmerProfileId: string,
  payload: {
    title: string;
    description: string | null;
    price: number | null;
    priceUnit: ProductPriceUnit;
    category: string | null;
    season: string | null;
    images: string[];
    status: ProductStatus;
  },
): Promise<{ product: ProductRow | null; error: string | null }> {
  const { data: existing } = await supabase
    .from("products")
    .select("published_at, status")
    .eq("id", productId)
    .eq("farmer_id", farmerProfileId)
    .maybeSingle();

  const publishedAt =
    payload.status === "published"
      ? (existing?.published_at ?? new Date().toISOString())
      : null;

  const { data, error } = await supabase
    .from("products")
    .update({
      title: payload.title.trim(),
      description: payload.description?.trim() || null,
      price: payload.price,
      price_unit: payload.priceUnit,
      category: payload.category,
      season: payload.season?.trim() || null,
      images: payload.images,
      status: payload.status,
      published_at: publishedAt,
    })
    .eq("id", productId)
    .eq("farmer_id", farmerProfileId)
    .select(PRODUCT_SELECT)
    .single();

  if (error) {
    return { product: null, error: error.message };
  }

  return { product: data as ProductRow, error: null };
}

export async function deleteProduct(
  supabase: SupabaseClient,
  productId: string,
  farmerProfileId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("farmer_id", farmerProfileId);

  return { error: error?.message ?? null };
}

export async function setProductVideoLinks(
  supabase: SupabaseClient,
  farmerProfileId: string,
  productId: string,
  videoIds: string[],
): Promise<{ error: string | null }> {
  const { error: clearError } = await supabase
    .from("videos")
    .update({ product_id: null })
    .eq("farmer_id", farmerProfileId)
    .eq("product_id", productId);

  if (clearError) {
    return { error: clearError.message };
  }

  if (videoIds.length === 0) {
    return { error: null };
  }

  const { error: linkError } = await supabase
    .from("videos")
    .update({ product_id: productId })
    .eq("farmer_id", farmerProfileId)
    .in("id", videoIds);

  return { error: linkError?.message ?? null };
}

export async function isProductOwner(
  supabase: SupabaseClient,
  productId: string,
  userId: string,
): Promise<QueryAccessResult> {
  const { data, error } = await supabase
    .from("products")
    .select("farmer_id, farmer_profiles!inner(profile_id)")
    .eq("id", productId)
    .maybeSingle();

  if (error) {
    return queryDatabaseError(error.message);
  }

  if (!data) {
    return queryDenied("not_found");
  }

  const farmerProfiles = data.farmer_profiles as
    | { profile_id: string }
    | { profile_id: string }[];

  const farmerProfile = Array.isArray(farmerProfiles)
    ? farmerProfiles[0]
    : farmerProfiles;

  if (farmerProfile?.profile_id !== userId) {
    return queryDenied("unauthorized");
  }

  return queryAllowed();
}
