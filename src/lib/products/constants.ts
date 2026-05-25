import type { ProductPriceUnit } from "@/lib/supabase/database.types";

export const PRODUCT_CATEGORIES = [
  { value: "vegetables", label: "Зеленчуци" },
  { value: "fruits", label: "Плодове" },
  { value: "dairy", label: "Млечни" },
  { value: "eggs", label: "Яйца" },
  { value: "honey", label: "Мед" },
  { value: "meat", label: "Месо" },
  { value: "herbs", label: "Билки" },
  { value: "other", label: "Друго" },
] as const;

export const PRODUCT_PRICE_UNITS: {
  value: ProductPriceUnit;
  label: string;
}[] = [
  { value: "kg", label: "кг" },
  { value: "box", label: "кутия" },
  { value: "l", label: "л" },
  { value: "piece", label: "брой" },
];

export const PRODUCT_CATEGORY_LABELS = Object.fromEntries(
  PRODUCT_CATEGORIES.map((item) => [item.value, item.label]),
) as Record<string, string>;

export function getProductCategoryLabel(value: string | null | undefined) {
  if (!value) {
    return "Друго";
  }

  return PRODUCT_CATEGORY_LABELS[value] ?? value;
}
