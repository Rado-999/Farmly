"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { loadSupabaseClient } from "@/lib/supabase/load-client";

const DeleteProductModal = dynamic(
  () =>
    import("@/components/products/delete-product-modal").then(
      (module) => module.DeleteProductModal,
    ),
);

type ProductOwnerActionsProps = {
  productId: string;
  farmerProfileId: string;
  productTitle: string;
};

export function ProductOwnerActions({
  productId,
  farmerProfileId,
  productTitle,
}: ProductOwnerActionsProps) {
  const router = useRouter();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const supabase = await loadSupabaseClient();

    if (!supabase) {
      setError("Няма връзка със сървъра.");
      return;
    }

    setIsDeleting(true);
    const { deleteProduct } = await import("@/lib/products/queries");
    const result = await deleteProduct(supabase, productId, farmerProfileId);
    setIsDeleting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setIsDeleteOpen(false);
    router.push("/profile");
    router.refresh();
  }

  return (
    <div className="rounded-[1.25rem] border border-forest/15 bg-forest/5 p-4">
      <p className="text-sm font-medium text-stone-900">Управление на продукта</p>
      <div className="mt-3 flex flex-wrap gap-3">
        <Link
          href={`/farmer/products/${productId}/edit`}
          className="inline-flex cursor-pointer rounded-full border border-stone-300/90 bg-white px-4 py-2 text-sm font-medium text-stone-800"
        >
          Редактирай
        </Link>
        <button
          type="button"
          onClick={() => setIsDeleteOpen(true)}
          className="inline-flex cursor-pointer rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-800"
        >
          Изтрий
        </button>
      </div>
      {error ? (
        <p className="mt-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {isDeleteOpen ? (
        <DeleteProductModal
          isOpen
          productTitle={productTitle}
          isDeleting={isDeleting}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={() => void handleDelete()}
        />
      ) : null}
    </div>
  );
}
