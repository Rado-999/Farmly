import type { SupabaseClient } from "@supabase/supabase-js";

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
  return supabase.from("reviews").insert({
    user_id: args.userId,
    product_id: args.productId,
    farmer_id: args.farmerId,
    author_display_name: args.authorDisplayName.trim() || "Member",
    rating: args.rating,
    comment: args.comment,
  });
}
