"use client";

import { FarmerProductGuard } from "@/components/products/farmer-product-guard";
import { ProductForm } from "@/components/products/product-form";

export function NewProductPage() {
  return (
    <FarmerProductGuard>
      {(access) => <ProductForm access={access} />}
    </FarmerProductGuard>
  );
}
