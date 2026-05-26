"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { AuthInput } from "@/components/auth/auth-input";
import { useLocale } from "@/components/i18n/language-provider";
import { FormSelect } from "@/components/ui/form-select";
import { OnboardingTextarea } from "@/components/onboarding/onboarding-textarea";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_PRICE_UNITS,
} from "@/lib/products/constants";
import { translate } from "@/lib/i18n/translate";
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
    loading: () => null,
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
  const { locale } = useLocale();
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
    () =>
      isEditing
        ? translate(locale, "Редактирай продукт", "Edit product")
        : translate(locale, "Добави продукт", "Add product"),
    [isEditing, locale],
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
      setError(
        translate(
          locale,
          "Няма връзка със сървъра. Опитайте отново.",
          "No connection to the server. Please try again.",
        ),
      );
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
            {translate(locale, "Продукт", "Product")}
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
              label={translate(locale, "Заглавие", "Title")}
              value={values.title}
              onChange={(event) => updateValues({ title: event.target.value })}
              required
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <AuthInput
                id="product-price"
                label={translate(locale, "Цена (€)", "Price (€)")}
                type="number"
                min="0"
                step="0.01"
                value={values.price}
                onChange={(event) => updateValues({ price: event.target.value })}
              />

              <FormSelect
                id="product-price-unit"
                label={translate(locale, "Мерна единица", "Unit")}
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
              label={translate(locale, "Категория", "Category")}
              value={values.category}
              onChange={(event) =>
                updateValues({ category: event.target.value })
              }
            >
              <option value="">
                {translate(locale, "Изберете категория", "Choose a category")}
              </option>
              {PRODUCT_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </FormSelect>

            <div>
              <p className="mb-2 text-sm font-medium text-stone-700">
                {translate(locale, "Снимки", "Images")}
              </p>
              <ProductImagePicker
                images={imageDrafts}
                onChange={setImageDrafts}
              />
            </div>

            <OnboardingTextarea
              id="product-description"
              label={translate(locale, "Описание (по избор)", "Description (optional)")}
              value={values.description}
              onChange={(value) => updateValues({ description: value })}
            />

            <AuthInput
              id="product-season"
              label={translate(locale, "Сезон (по избор)", "Season (optional)")}
              value={values.season}
              onChange={(event) => updateValues({ season: event.target.value })}
              placeholder={translate(locale, "напр. пролет, лято", "e.g. spring, summer")}
            />

            <div>
              <p className="text-sm font-medium text-stone-700">
                {translate(locale, "Свързани видеа (по избор)", "Related videos (optional)")}
              </p>
              {isLoadingVideos ? (
                <p className="mt-2 text-sm text-stone-500">
                  {translate(locale, "Зареждане...", "Loading...")}
                </p>
              ) : videos.length === 0 ? (
                <p className="mt-2 text-sm text-stone-500">
                  {translate(locale, "Все още няма качени видеа. ", "No videos have been uploaded yet. ")}
                  <Link
                    href="/farmer/videos/new"
                    className="font-medium text-forest hover:underline"
                  >
                    {translate(locale, "Качете видео в профила си", "Upload a video in your profile")}
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
                            {video.title ??
                              translate(locale, "Видео история", "Video story")}
                          </span>
                          {video.product_id &&
                          video.product_id !== product?.id ? (
                            <span className="text-xs text-amber-800">
                              {translate(locale, "Свързано с друг продукт", "Linked to another product")}
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
              {isSaving
                ? translate(locale, "Запазване...", "Saving...")
                : translate(locale, "Запази като чернова", "Save as draft")}
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => void handleSave("publish")}
              className="inline-flex cursor-pointer justify-center rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving
                ? translate(locale, "Публикуване...", "Publishing...")
                : translate(locale, "Публикувай", "Publish")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
