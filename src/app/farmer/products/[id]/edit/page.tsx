import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FarmerProductBlocked } from "@/components/products/farmer-product-blocked";
import { ProductForm } from "@/components/products/product-form";
import { requireServerFarmerProductAccess } from "@/lib/auth/server";
import { buildImageDraftsFromStoredProductImages } from "@/lib/products/image-drafts";
import {
  getProductForEdit,
  listFarmerVideosForPicker,
} from "@/lib/products/queries";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Редактирай продукт | Farmly",
  description: "Редактирайте сезонен продукт във вашия фермерски профил.",
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const result = await requireServerFarmerProductAccess(
    `/farmer/products/${id}/edit`,
  );

  if (result.kind === "blocked") {
    return (
      <FarmerProductBlocked
        reason={result.reason}
        href={result.href}
        label={result.label}
      />
    );
  }

  const { supabase, access } = result;
  const productResult = await getProductForEdit(supabase, id, access.farmerProfileId);

  if (!productResult.ok) {
    if (productResult.error.code === "query.not_found") {
      notFound();
    }

    throw new Error(productResult.error.message);
  }

  const product = productResult.data;

  const videosResult = await listFarmerVideosForPicker(
    supabase,
    access.farmerProfileId,
  );

  if (!videosResult.ok) {
    throw new Error(videosResult.error.message);
  }

  if (!product) {
    notFound();
  }

  const initialImageDrafts = await buildImageDraftsFromStoredProductImages(
    supabase,
    product.images,
  );
  const videos = videosResult.data;
  const initialVideoIds = videos
    .filter((video) => video.product_id === id)
    .map((video) => video.id);

  return (
    <ProductForm
      access={access}
      product={product}
      initialImageDrafts={initialImageDrafts}
      initialVideoIds={initialVideoIds}
    />
  );
}
