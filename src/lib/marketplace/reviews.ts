import type { SupabaseClient } from "@supabase/supabase-js";

import { logger } from "@/lib/logger";

/** Inserts a review. Caller must load `farmer_id` from the product row (app-layer rule). */
export async function insertProductReview(
  supabase: SupabaseClient,
  args: {
    userId: string;
    productId: string;
    farmerId: string;
    authorDisplayName: string;
    rating: number;
    comment: string | null;
  },
) {
  const result = await supabase.from("reviews").insert({
    user_id: args.userId,
    product_id: args.productId,
    farmer_id: args.farmerId,
    author_display_name: args.authorDisplayName.trim() || "Member",
    rating: args.rating,
    comment: args.comment,
  });

  if (result.error) {
    logger.error({
      operation: "reviews.insertProductReview",
      message: "Failed to insert product review.",
      userId: args.userId,
      farmerId: args.farmerId,
      errorCode: result.error.code ?? "reviews.insert_failed",
      context: {
        productId: args.productId,
        rating: args.rating,
        hasComment: Boolean(args.comment),
      },
      error: result.error,
    });
  }

  return result;
}
