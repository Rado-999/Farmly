import type { Metadata } from "next";

import { FarmerProductBlocked } from "@/components/products/farmer-product-blocked";
import { ProductForm } from "@/components/products/product-form";
import { requireServerFarmerProductAccess } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Добави продукт | Farmly",
  description: "Добавете сезонен продукт към вашия фермерски профил.",
};

export default async function NewProductRoute() {
  const result = await requireServerFarmerProductAccess("/farmer/products/new");

  if (result.kind === "blocked") {
    return (
      <FarmerProductBlocked
        reason={result.reason}
        href={result.href}
        label={result.label}
      />
    );
  }

  return <ProductForm access={result.access} />;
}
