import type { Metadata } from "next";

import { NewProductPage } from "@/components/products/new-product-page";

export const metadata: Metadata = {
  title: "Добави продукт | Farmly",
  description: "Добавете сезонен продукт към вашия фермерски профил.",
};

export default function NewProductRoute() {
  return <NewProductPage />;
}
