import type { Metadata } from "next";
import { ProductDetailOwnerLoader } from "@/components/products/product-detail-owner-loader";
import { ProductDetailPageClient } from "@/components/products/product-detail-page-client";
import { getProductById } from "@/lib/products/queries";

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
  const product = await getProductById(productId);

  if (!product || product.farmerSlug !== slug) {
    return <ProductDetailOwnerLoader slug={slug} productId={productId} />;
  }

  if (product.status === "draft") {
    return <ProductDetailOwnerLoader slug={slug} productId={productId} />;
  }

  return <ProductDetailPageClient product={product} />;
}
