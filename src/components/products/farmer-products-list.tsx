"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { listFarmerProducts } from "@/lib/products/queries";
import type { ProductListItem } from "@/lib/products/types";

type FarmerProductsListProps = {
  farmerProfileId: string;
  farmerSlug: string;
};

export function FarmerProductsList({
  farmerProfileId,
  farmerSlug,
}: FarmerProductsListProps) {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await listFarmerProducts(farmerProfileId, farmerSlug, {
        includeDrafts: true,
      });

      if (!result.ok) {
        setProducts([]);
        setIsLoading(false);
        return;
      }

      setProducts(result.data);
      setIsLoading(false);
    }

    void load();
  }, [farmerProfileId, farmerSlug]);

  if (isLoading) {
    return <p className="text-sm text-stone-500">Зареждане на продукти...</p>;
  }

  if (products.length === 0) {
    return (
      <p className="text-sm text-stone-600">
        Все още нямате продукти. Добавете първия си сезонен продукт.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {products.map((product) => (
        <li key={product.id}>
          <Link
            href={`/farmers/${farmerSlug}/products/${product.id}`}
            className="flex cursor-pointer items-center gap-4 rounded-2xl border border-stone-200/80 bg-white/90 p-4 transition-colors hover:border-forest/25"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-stone-100">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-stone-400">
                  Няма
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-stone-900">{product.title}</p>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    product.status === "published"
                      ? "bg-forest/10 text-forest"
                      : "bg-amber-50 text-amber-900"
                  }`}
                >
                  {product.status === "published" ? "Публикуван" : "Чернова"}
                </span>
              </div>
              <p className="text-sm text-stone-600">{product.price}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
