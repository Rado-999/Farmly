"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { AuthInput } from "@/components/auth/auth-input";
import { FormSelect } from "@/components/ui/form-select";
import { OnboardingTextarea } from "@/components/onboarding/onboarding-textarea";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_PRICE_UNITS,
} from "@/lib/products/constants";
import { buildImageDraftsFromProduct } from "@/lib/products/image-drafts";
import type { ProductImageDraft } from "@/lib/products/image-drafts";
import type { FarmerProductAccess } from "@/lib/products/types";
import type { ProductFormValues } from "@/lib/products/types";
import type { ProductRow, VideoRow } from "@/lib/supabase/database.types";
import { loadSupabaseClient } from "@/lib/supabase/load-client";

const ProductImagePicker = dynamic(
  () =>
    import("@/components/products/product-image-picker").then(
      (module) => module.ProductImagePicker,
    ),
  {
    loading: () => (
      <div className="rounded-2xl border border-stone-200/80 bg-stone-50/80 px-6 py-8 text-center text-sm text-stone-500">
        Зареждане на снимките...
      </div>
    ),
  },
);

type ProductFormProps = {
  access: FarmerProductAccess;
  product?: ProductRow | null;
  initialImageDrafts?: ProductImageDraft[];
  initialVideoIds?: string[];
};

function buildInitialValues(product?: ProductRow | null): ProductFormValues {
  return {
    title: product?.title ?? "",
    price: product?.price != null ? String(product.price) : "",
    priceUnit: product?.price_unit ?? "kg",
    category: product?.category ?? "",
    description: product?.description ?? "",
    season: product?.season ?? "",
    videoIds: [],
  };
}

export function ProductForm({
  access,
  product,
  initialImageDrafts,
  initialVideoIds = [],
}: ProductFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>(() => ({
    ...buildInitialValues(product),
    videoIds: initialVideoIds,
  }));
  const [imageDrafts, setImageDrafts] = useState<ProductImageDraft[]>(() =>
    initialImageDrafts ?? buildImageDraftsFromProduct(product?.images),
  );
  const imageDraftsRef = useRef(imageDrafts);
  imageDraftsRef.current = imageDrafts;
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(product?.id);

  useEffect(() => {
    return () => {
      imageDraftsRef.current.forEach((draft) => {
        if (draft.kind === "new") {
          URL.revokeObjectURL(draft.preview);
        }
      });
    };
  }, []);

  useEffect(() => {
    async function loadVideos() {
      const supabase = await loadSupabaseClient();

      if (!supabase) {
        setIsLoadingVideos(false);
        return;
      }

      const { listFarmerVideosForPicker } = await import("@/lib/products/queries");
      const result = await listFarmerVideosForPicker(
        supabase,
        access.farmerProfileId,
      );

      if (!result.ok) {
        setVideos([]);
        setIsLoadingVideos(false);
        return;
      }

      setVideos(result.data);
      setIsLoadingVideos(false);
    }

    void loadVideos();
  }, [access.farmerProfileId]);

  const pageTitle = useMemo(
    () => (isEditing ? "Редактирай продукт" : "Добави продукт"),
    [isEditing],
  );

  function updateValues(patch: Partial<ProductFormValues>) {
    setValues((current) => ({ ...current, ...patch }));
  }

  function toggleVideo(videoId: string) {
    setValues((current) => {
      const hasVideo = current.videoIds.includes(videoId);

      return {
        ...current,
        videoIds: hasVideo
          ? current.videoIds.filter((id) => id !== videoId)
          : [...current.videoIds, videoId],
      };
    });
  }

  async function handleSave(intent: "draft" | "publish") {
    setError(null);
    const supabase = await loadSupabaseClient();

    if (!supabase) {
      setError("Няма връзка със сървъра. Опитайте отново.");
      return;
    }

    setIsSaving(true);

    const { saveProduct } = await import("@/lib/products/save-product");
    const result = await saveProduct({
      supabase,
      farmerProfileId: access.farmerProfileId,
      productId: product?.id,
      values,
      imageDrafts,
      intent,
    });

    setIsSaving(false);

    if (!result.ok) {
      setError(result.error.message);
      return;
    }

    router.push(
      `/farmers/${access.farmerSlug}/products/${result.data.productId}`,
    );
    router.refresh();
  }

  return (
    <div className="page-shell max-w-2xl page-y">
      <div className="stack-relaxed">
        <div className="stack-tight">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-forest">
            Продукт
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
            {pageTitle}
          </h1>
        </div>

        <form
          className="stack-relaxed rounded-[1.75rem] border border-stone-200/80 bg-white/92 p-6 shadow-[0_22px_52px_-28px_rgba(63,90,58,0.28)] sm:p-8"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="stack">
            <AuthInput
              id="product-title"
              label="Заглавие"
              value={values.title}
              onChange={(event) => updateValues({ title: event.target.value })}
              required
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <AuthInput
                id="product-price"
                label="Цена (€)"
                type="number"
                min="0"
                step="0.01"
                value={values.price}
                onChange={(event) => updateValues({ price: event.target.value })}
              />

              <FormSelect
                id="product-price-unit"
                label="Мерна единица"
                value={values.priceUnit}
                onChange={(event) =>
                  updateValues({
                    priceUnit: event.target
                      .value as ProductFormValues["priceUnit"],
                  })
                }
              >
                {PRODUCT_PRICE_UNITS.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </FormSelect>
            </div>

            <FormSelect
              id="product-category"
              label="Категория"
              value={values.category}
              onChange={(event) =>
                updateValues({ category: event.target.value })
              }
            >
              <option value="">Изберете категория</option>
              {PRODUCT_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </FormSelect>

            <div>
              <p className="mb-2 text-sm font-medium text-stone-700">Снимки</p>
              <ProductImagePicker
                images={imageDrafts}
                onChange={setImageDrafts}
              />
            </div>

            <OnboardingTextarea
              id="product-description"
              label="Описание (по избор)"
              value={values.description}
              onChange={(value) => updateValues({ description: value })}
            />

            <AuthInput
              id="product-season"
              label="Сезон (по избор)"
              value={values.season}
              onChange={(event) => updateValues({ season: event.target.value })}
              placeholder="напр. пролет, лято"
            />

            <div>
              <p className="text-sm font-medium text-stone-700">
                Свързани видеа (по избор)
              </p>
              {isLoadingVideos ? (
                <p className="mt-2 text-sm text-stone-500">Зареждане...</p>
              ) : videos.length === 0 ? (
                <p className="mt-2 text-sm text-stone-500">
                  Все още няма качени видеа.{" "}
                  <Link
                    href="/farmer/videos/new"
                    className="font-medium text-forest hover:underline"
                  >
                    Качете видео в профила си
                  </Link>
                  .
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {videos.map((video) => (
                    <li key={video.id}>
                      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-stone-200/70 bg-cream/60 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={values.videoIds.includes(video.id)}
                          onChange={() => toggleVideo(video.id)}
                          className="mt-1 cursor-pointer"
                        />
                        <span>
                          <span className="block font-medium text-stone-900">
                            {video.title ?? "Видео история"}
                          </span>
                          {video.product_id &&
                          video.product_id !== product?.id ? (
                            <span className="text-xs text-amber-800">
                              Свързано с друг продукт
                            </span>
                          ) : null}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {error ? (
            <p className="text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => void handleSave("draft")}
              className="inline-flex cursor-pointer justify-center rounded-full border border-stone-300/90 bg-white px-5 py-2.5 text-sm font-medium text-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Запазване..." : "Запази като чернова"}
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => void handleSave("publish")}
              className="inline-flex cursor-pointer justify-center rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Публикуване..." : "Публикувай"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
