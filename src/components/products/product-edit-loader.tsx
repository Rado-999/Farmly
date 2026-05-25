"use client";

import { notFound } from "next/navigation";
import { useEffect, useState } from "react";

import { FarmerProductGuard } from "@/components/products/farmer-product-guard";
import { ProductForm } from "@/components/products/product-form";
import { ProfileSkeleton } from "@/components/profile/profile-skeleton";
import {
  getProductForEdit,
  listFarmerVideosForPicker,
} from "@/lib/products/queries";
import type { FarmerProductAccess } from "@/lib/products/types";
import type { ProductRow } from "@/lib/supabase/database.types";
import { createSupabaseClient } from "@/lib/supabase";

type ProductEditLoaderProps = {
  productId: string;
};

function EditProductContent({
  access,
  productId,
}: {
  access: FarmerProductAccess;
  productId: string;
}) {
  const [product, setProduct] = useState<ProductRow | null | undefined>(
    undefined,
  );
  const [videoIds, setVideoIds] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseClient();

      if (!supabase) {
        setProduct(null);
        return;
      }

      const row = await getProductForEdit(
        supabase,
        productId,
        access.farmerProfileId,
      );

      if (!row) {
        setProduct(null);
        return;
      }

      const videos = await listFarmerVideosForPicker(
        supabase,
        access.farmerProfileId,
      );
      setVideoIds(
        videos
          .filter((video) => video.product_id === productId)
          .map((video) => video.id),
      );
      setProduct(row);
    }

    void load();
  }, [access.farmerProfileId, productId]);

  if (product === undefined) {
    return <ProfileSkeleton />;
  }

  if (!product) {
    notFound();
  }

  return (
    <ProductForm
      access={access}
      product={product}
      initialVideoIds={videoIds}
    />
  );
}

export function ProductEditLoader({ productId }: ProductEditLoaderProps) {
  return (
    <FarmerProductGuard>
      {(access) => (
        <EditProductContent access={access} productId={productId} />
      )}
    </FarmerProductGuard>
  );
}
