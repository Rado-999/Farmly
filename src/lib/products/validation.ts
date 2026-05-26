import { PRODUCT_CATEGORIES } from "@/lib/products/constants";
import { err, ok, type Result } from "@/lib/errors/result";
import type { ProductFormValues } from "@/lib/products/types";

const CATEGORY_VALUES = new Set<string>(
  PRODUCT_CATEGORIES.map((category) => category.value),
);

export type ProductValidationErrorCode =
  | "product.title_required"
  | "product.price_invalid"
  | "product.category_invalid"
  | "product.images_required";

export type ProductValidationResult = Result<void, ProductValidationErrorCode>;

function validateTitle(title: string): ProductValidationResult {
  if (!title.trim()) {
    return err("product.title_required", "Въведете заглавие на продукта.");
  }

  return ok();
}

function validatePrice(price: string): ProductValidationResult {
  const amount = Number.parseFloat(price);

  if (!price.trim() || Number.isNaN(amount) || amount <= 0) {
    return err(
      "product.price_invalid",
      "Въведете валидна цена по-голяма от нула.",
    );
  }

  return ok();
}

function validateCategory(category: string): ProductValidationResult {
  if (!category.trim() || !CATEGORY_VALUES.has(category)) {
    return err("product.category_invalid", "Изберете категория.");
  }

  return ok();
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
    return err(
      "product.images_required",
      "Добавете поне една снимка, за да публикувате.",
    );
  }

  return ok();
}
