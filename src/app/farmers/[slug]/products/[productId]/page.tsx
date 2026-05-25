import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetailView } from "@/components/products/product-detail-view";
import { getFarmerProductAccess } from "@/lib/products/access";
import {
  getProductById,
  getProductByIdWithSupabase,
} from "@/lib/products/server-queries";
import { createServerSupabaseClientOrThrow } from "@/lib/supabase/server";

type ProductPageProps = {
  params: Promise<{ slug: string; productId: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { productId } = await params;
  const product = await getProductById(productId);

  if (!product) {
    return { title: "Продукт не е намерен | Farmly" };
  }

  return {
    title: `${product.title} | Farmly`,
    description: product.description || product.availability,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug, productId } = await params;
  const publicProduct = await getProductById(productId);

  if (publicProduct && publicProduct.farmerSlug !== slug) {
    notFound();
  }

  const supabase = await createServerSupabaseClientOrThrow();
  const access = await getFarmerProductAccess(supabase);
  let product = publicProduct;
  let isOwner = false;

  if (product && access.ok) {
    isOwner = access.access.farmerProfileId === product.farmerId;
  }

  if (!product && access.ok) {
    const privateProduct = await getProductByIdWithSupabase(supabase, productId);

    if (!privateProduct || privateProduct.farmerSlug !== slug) {
      notFound();
    }

    product = privateProduct;
    isOwner = access.access.farmerProfileId === privateProduct.farmerId;
  }

  if (!product) {
    notFound();
  }

  if (product.status === "draft" && !isOwner) {
    notFound();
  }

  return <ProductDetailView product={product} isOwner={isOwner} />;
}
