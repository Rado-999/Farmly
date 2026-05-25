import { PRODUCT_CATEGORIES } from "@/lib/products/constants";
import type { ProductFormValues } from "@/lib/products/types";

const CATEGORY_VALUES = new Set<string>(
  PRODUCT_CATEGORIES.map((category) => category.value),
);

export type ProductValidationResult =
  | { ok: true }
  | { ok: false; message: string };

function validateTitle(title: string): ProductValidationResult {
  if (!title.trim()) {
    return { ok: false, message: "Въведете заглавие на продукта." };
  }

  return { ok: true };
}

function validatePrice(price: string): ProductValidationResult {
  const amount = Number.parseFloat(price);

  if (!price.trim() || Number.isNaN(amount) || amount <= 0) {
    return { ok: false, message: "Въведете валидна цена по-голяма от нула." };
  }

  return { ok: true };
}

function validateCategory(category: string): ProductValidationResult {
  if (!category.trim() || !CATEGORY_VALUES.has(category)) {
    return { ok: false, message: "Изберете категория." };
  }

  return { ok: true };
}

export function validateProductDraft(
  values: ProductFormValues,
): ProductValidationResult {
  return validateTitle(values.title);
}

export function validateProductPublish(
  values: ProductFormValues,
  imageCount: number,
): ProductValidationResult {
  const titleResult = validateTitle(values.title);

  if (!titleResult.ok) {
    return titleResult;
  }

  const priceResult = validatePrice(values.price);

  if (!priceResult.ok) {
    return priceResult;
  }

  const categoryResult = validateCategory(values.category);

  if (!categoryResult.ok) {
    return categoryResult;
  }

  if (imageCount < 1) {
    return { ok: false, message: "Добавете поне една снимка, за да публикувате." };
  }

  return { ok: true };
}
