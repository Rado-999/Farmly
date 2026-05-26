import type { Metadata } from "next";

import { FarmerProductBlocked } from "@/components/products/farmer-product-blocked";
import { ProductForm } from "@/components/products/product-form";
import { requireServerFarmerProductAccess } from "@/lib/auth/server";
import { getServerLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();

  return {
    title: translate(locale, "Добави продукт | Farmly", "Add product | Farmly"),
    description: translate(
      locale,
      "Добавете сезонен продукт към вашия фермерски профил.",
      "Add a seasonal product to your farmer profile.",
    ),
  };
}

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
