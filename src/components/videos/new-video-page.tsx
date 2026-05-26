"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useLocale } from "@/components/i18n/language-provider";
import { VideoDropzone } from "@/components/videos/video-dropzone";
import { PROFILE_PATH } from "@/lib/auth/constants";
import { translate } from "@/lib/i18n/translate";
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
    loading: () => null,
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
  const { locale } = useLocale();
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
      setError(
        translate(
          locale,
          "Не успяхме да обработим видеото. Опитайте с друг файл.",
          "We could not process the video. Try another file.",
        ),
      );
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
      setError(
        translate(
          locale,
          "Първо изберете видео файл.",
          "Choose a video file first.",
        ),
      );
      return;
    }

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
      : translate(locale, "—", "—");

  return (
    <div className="page-shell max-w-2xl page-y">
      <div className="stack-relaxed">
        <div className="stack-tight">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-forest">
            {translate(locale, "Видео", "Video")}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
            {translate(locale, "Качи видео", "Upload video")}
          </h1>
          <p className="text-sm leading-6 text-stone-600">
            {translate(
              locale,
              "Споделете как отглеждате — купувачите виждат историята зад всяка кошница.",
              "Share how you grow. Buyers can see the story behind every basket.",
            )}
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
                <p className="text-sm text-stone-500">
                  {translate(locale, "Обработване на видеото...", "Processing video...")}
                </p>
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
                  {translate(locale, "Избери друго видео", "Choose another video")}
                </button>
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isPublishing || isProcessing || !posterBlob}
                  className="cursor-pointer rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#324a2f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPublishing
                    ? translate(locale, "Качване...", "Uploading...")
                    : translate(locale, "Публикувай видео", "Publish video")}
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
            {translate(locale, "Към профила", "Back to profile")}
          </Link>
        </div>
      </div>
    </div>
  );
}
