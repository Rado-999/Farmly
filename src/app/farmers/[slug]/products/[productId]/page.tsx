import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetailView } from "@/components/products/product-detail-view";
import { getFarmerProductAccess } from "@/lib/products/access";
import {
  getProductById,
  getProductByIdWithSupabase,
} from "@/lib/products/server-queries";
import { createServerSupabaseClientOrThrow } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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
  const supabase = await createServerSupabaseClientOrThrow();
  const product = await getProductByIdWithSupabase(supabase, productId);

  if (!product || product.farmerSlug !== slug) {
    notFound();
  }

  const access = await getFarmerProductAccess(supabase);
  const isOwner =
    access.ok && access.access.farmerProfileId === product.farmerId;

  if (product.status === "draft" && !isOwner) {
    notFound();
  }

  return <ProductDetailView product={product} isOwner={isOwner} />;
}
