import {
  executeSaveProductMutation,
  type SaveProductArgs,
  type SaveProductResult,
} from "@/lib/mutations/products/save-product-mutation";

export async function saveProduct(
  args: SaveProductArgs,
): Promise<SaveProductResult> {
  return executeSaveProductMutation(args);
}
