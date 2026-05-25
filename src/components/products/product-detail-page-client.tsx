"use client";

import { useEffect, useState } from "react";

import { ProductDetailView } from "@/components/products/product-detail-view";
import { getFarmerProductAccess } from "@/lib/products/access";
import type { ProductDetail } from "@/lib/products/types";
import { createSupabaseClient } from "@/lib/supabase";

type ProductDetailPageClientProps = {
  product: ProductDetail;
};

export function ProductDetailPageClient({
  product,
}: ProductDetailPageClientProps) {
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    async function checkOwner() {
      const supabase = createSupabaseClient();

      if (!supabase) {
        return;
      }

      const access = await getFarmerProductAccess(supabase);

      if (access.ok && access.access.farmerProfileId === product.farmerId) {
        setIsOwner(true);
      }
    }

    void checkOwner();
  }, [product.farmerId]);

  return <ProductDetailView product={product} isOwner={isOwner} />;
}
