import "server-only";

import { FARMER_PROFILE_SELECT } from "@/lib/farmers/farmer-profile-row";
import { mapProductDetail } from "@/lib/products/mappers";
import type { ProductDetail } from "@/lib/products/types";
import type {
  FarmerProfileRow,
  ProductRow,
  ReviewRow,
  VideoRow,
} from "@/lib/supabase/database.types";
import { createServerPublicSupabaseClientOrThrow } from "@/lib/supabase/server";

const PRODUCT_SELECT =
  "id, farmer_id, title, description, price, season, category, images, status, price_unit, published_at";

export async function getProductById(
  productId: string,
): Promise<ProductDetail | null> {
  const supabase = createServerPublicSupabaseClientOrThrow();

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

  const productRow = product as ProductRow;

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
