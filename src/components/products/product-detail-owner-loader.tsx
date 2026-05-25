"use client";

import { notFound } from "next/navigation";
import { useEffect, useState } from "react";

import { ProductDetailView } from "@/components/products/product-detail-view";
import { ProfileSkeleton } from "@/components/profile/profile-skeleton";
import { getFarmerProductAccess } from "@/lib/products/access";
import { getProductById } from "@/lib/products/queries";
import type { ProductDetail } from "@/lib/products/types";
import { createSupabaseClient } from "@/lib/supabase";

type ProductDetailOwnerLoaderProps = {
  slug: string;
  productId: string;
};

export function ProductDetailOwnerLoader({
  slug,
  productId,
}: ProductDetailOwnerLoaderProps) {
  const [state, setState] = useState<
    | { status: "loading" }
    | { status: "ready"; product: ProductDetail; isOwner: boolean }
    | { status: "not_found" }
  >({ status: "loading" });

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseClient();

      if (!supabase) {
        setState({ status: "not_found" });
        return;
      }

      try {
        const product = await getProductById(productId);

        if (!product || product.farmerSlug !== slug) {
          setState({ status: "not_found" });
          return;
        }

        const access = await getFarmerProductAccess(supabase);
        const isOwner =
          access.ok &&
          access.access.farmerProfileId === product.farmerId;

        if (product.status === "draft" && !isOwner) {
          setState({ status: "not_found" });
          return;
        }

        setState({
          status: "ready",
          product,
          isOwner,
        });
      } catch {
        setState({ status: "not_found" });
      }
    }

    void load();
  }, [productId, slug]);

  if (state.status === "loading") {
    return <ProfileSkeleton />;
  }

  if (state.status === "not_found") {
    notFound();
  }

  return (
    <ProductDetailView product={state.product} isOwner={state.isOwner} />
  );
}
