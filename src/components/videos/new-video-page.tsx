"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { VideoDropzone } from "@/components/videos/video-dropzone";
import { PROFILE_PATH } from "@/lib/auth/constants";
import type { FarmerProductAccess } from "@/lib/products/types";
import type { ProductListItem } from "@/lib/products/types";
import { formatDurationSeconds } from "@/lib/videos/format-duration";
import { loadSupabaseClient } from "@/lib/supabase/load-client";
import type { VideoFormValues } from "@/lib/videos/types";
import {
  validateVideoDuration,
  validateVideoFile,
} from "@/lib/videos/validation";

const VideoUploadForm = dynamic(
  () =>
    import("@/components/videos/video-upload-form").then(
      (module) => module.VideoUploadForm,
    ),
  {
    loading: () => <p className="text-sm text-stone-500">Зареждане на формата...</p>,
  },
);

const INITIAL_VALUES: VideoFormValues = {
  title: "",
  stage: "daily",
  description: "",
  productId: "",
};

export function NewVideoForm({ access }: { access: FarmerProductAccess }) {
  const router = useRouter();
  const previewRef = useRef<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [posterBlob, setPosterBlob] = useState<Blob | null>(null);
  const [durationSeconds, setDurationSeconds] = useState<number | null>(null);
  const [values, setValues] = useState<VideoFormValues>(INITIAL_VALUES);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      if (!file) {
        setProducts([]);
        setIsLoadingProducts(false);
        return;
      }

      const supabase = await loadSupabaseClient();

      if (!supabase) {
        setIsLoadingProducts(false);
        return;
      }

      setIsLoadingProducts(true);
      const { listFarmerProducts } = await import("@/lib/products/queries");
      const result = await listFarmerProducts(
        access.farmerProfileId,
        access.farmerSlug,
        { includeDrafts: true },
      );

      if (!result.ok) {
        setProducts([]);
        setIsLoadingProducts(false);
        return;
      }

      setProducts(result.data);
      setIsLoadingProducts(false);
    }

    void loadProducts();
  }, [access.farmerProfileId, access.farmerSlug, file]);

  useEffect(() => {
    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
      }
    };
  }, []);

  async function handleFileSelected(selectedFile: File) {
    setError(null);

    const validation = validateVideoFile(selectedFile);

    if (!validation.ok) {
      setError(validation.error.message);
      return;
    }

    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
    }

    const nextPreview = URL.createObjectURL(selectedFile);
    previewRef.current = nextPreview;
    setPreviewUrl(nextPreview);
    setFile(selectedFile);
    setIsProcessing(true);

    try {
      const { extractVideoMetadata } = await import("@/lib/videos/extract-video-metadata");
      const metadata = await extractVideoMetadata(selectedFile);
      const durationValidation = validateVideoDuration(metadata.durationSeconds);

      if (!durationValidation.ok) {
        handleReset();
        setError(durationValidation.error.message);
        return;
      }

      setPosterBlob(metadata.posterBlob);
      setDurationSeconds(metadata.durationSeconds);
    } catch {
      setFile(null);
      setPreviewUrl(null);
      setPosterBlob(null);
      setDurationSeconds(null);
      previewRef.current = null;
      setError("Не успяхме да обработим видеото. Опитайте с друг файл.");
    } finally {
      setIsProcessing(false);
    }
  }

  function handleReset() {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }

    setFile(null);
    setPreviewUrl(null);
    setPosterBlob(null);
    setDurationSeconds(null);
    setValues(INITIAL_VALUES);
    setError(null);
  }

  async function handlePublish() {
    if (!file || !posterBlob || durationSeconds === null) {
      setError("Първо изберете видео файл.");
      return;
    }

    const supabase = await loadSupabaseClient();

    if (!supabase) {
      setError("Няма връзка със сървъра. Опитайте отново.");
      return;
    }

    setError(null);
    setIsPublishing(true);

    const { publishVideo } = await import("@/lib/videos/publish-video");
    const result = await publishVideo({
      supabase,
      farmerProfileId: access.farmerProfileId,
      file,
      posterBlob,
      durationSeconds,
      values,
    });

    setIsPublishing(false);

    if (!result.ok) {
      setError(result.error.message);
      return;
    }

    router.push(PROFILE_PATH);
    router.refresh();
  }

  const durationLabel =
    durationSeconds !== null
      ? formatDurationSeconds(durationSeconds)
      : "—";

  return (
    <div className="page-shell max-w-2xl page-y">
      <div className="stack-relaxed">
        <div className="stack-tight">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-forest">
            Видео
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
            Качи видео
          </h1>
          <p className="text-sm leading-6 text-stone-600">
            Споделете как отглеждате — купувачите виждат историята зад всяка
            кошница.
          </p>
        </div>

        <div className="stack-relaxed rounded-[1.75rem] border border-stone-200/80 bg-white/92 p-6 shadow-[0_22px_52px_-28px_rgba(63,90,58,0.28)] sm:p-8">
          {!file ? (
            <VideoDropzone
              onFileSelected={handleFileSelected}
              disabled={isProcessing}
            />
          ) : (
            <div className="stack-relaxed">
              <div className="overflow-hidden rounded-2xl bg-stone-900">
                {previewUrl ? (
                  <video
                    src={previewUrl}
                    controls
                    playsInline
                    className="aspect-video w-full"
                  />
                ) : null}
              </div>

              {isProcessing ? (
                <p className="text-sm text-stone-500">Обработване на видеото...</p>
              ) : (
                <VideoUploadForm
                  values={values}
                  products={isLoadingProducts ? [] : products}
                  durationLabel={durationLabel}
                  onChange={(patch) =>
                    setValues((current) => ({ ...current, ...patch }))
                  }
                />
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isPublishing || isProcessing}
                  className="cursor-pointer rounded-full border border-stone-300/90 px-4 py-2 text-sm font-medium text-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Избери друго видео
                </button>
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isPublishing || isProcessing || !posterBlob}
                  className="cursor-pointer rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#324a2f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPublishing ? "Качване..." : "Публикувай видео"}
                </button>
              </div>
            </div>
          )}

          {error ? (
            <p className="text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}

          <Link
            href={PROFILE_PATH}
            className="inline-flex text-sm font-medium text-forest hover:underline"
          >
            Към профила
          </Link>
        </div>
      </div>
    </div>
  );
}
