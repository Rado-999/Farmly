import type { Metadata } from "next";

import { ProductEditLoader } from "@/components/products/product-edit-loader";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Редактирай продукт | Farmly",
  description: "Редактирайте сезонен продукт във вашия фермерски профил.",
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  return <ProductEditLoader productId={id} />;
}
