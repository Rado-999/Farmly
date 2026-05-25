"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { prepareImageForCrop } from "@/lib/images/prepare-image-for-crop";

type CoverPhotoPickerProps = {
  initialImageUrl?: string | null;
  onFileChange: (file: File | null) => void;
};

async function blobUrlToFile(url: string): Promise<File> {
  const response = await fetch(url);
  const blob = await response.blob();

  return new File([blob], "cover.jpg", {
    type: blob.type || "image/jpeg",
  });
}

export function CoverPhotoPicker({
  initialImageUrl = null,
  onFileChange,
}: CoverPhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const revokePreviewRef = useRef<(() => void) | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl);
  const [pickError, setPickError] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);

  const clearBlobPreview = useCallback(() => {
    revokePreviewRef.current?.();
    revokePreviewRef.current = null;
  }, []);

  useEffect(() => {
    clearBlobPreview();
    setPreviewUrl(initialImageUrl);
  }, [initialImageUrl, clearBlobPreview]);

  useEffect(() => clearBlobPreview, [clearBlobPreview]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setPickError(null);
    setIsPreparing(true);

    const prepared = await prepareImageForCrop(file);

    setIsPreparing(false);

    if ("error" in prepared) {
      setPickError(prepared.error);
      return;
    }

    clearBlobPreview();
    revokePreviewRef.current = prepared.revoke;
    setPreviewUrl(prepared.url);

    const coverFile = await blobUrlToFile(prepared.url);
    onFileChange(coverFile);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-stone-700">Корица на профила</p>
          <p className="mt-1 text-xs leading-5 text-stone-500">
            Широка снимка на фермата или полето — препоръчително 3:1.
          </p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isPreparing}
          className="shrink-0 rounded-full border border-stone-300/90 bg-white px-4 py-2 text-sm font-medium text-stone-800 transition-colors hover:border-forest/35 hover:text-forest disabled:opacity-60"
        >
          {isPreparing
            ? "Подготовка..."
            : previewUrl
              ? "Смени корицата"
              : "Добави корица"}
        </button>
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPreparing}
        className="group relative block w-full overflow-hidden rounded-2xl border border-stone-200/80 bg-stone-100/80 text-left shadow-sm transition-colors hover:border-forest/30 disabled:opacity-60"
      >
        <span className="relative block aspect-[3/1] w-full">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Преглед на корицата"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 640px"
              unoptimized={previewUrl.startsWith("blob:")}
            />
          ) : (
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[linear-gradient(135deg,#f4f0e8,#ebe4d6)] px-6 text-center">
              <span className="text-2xl text-forest/70" aria-hidden>
                ⌁
              </span>
              <span className="text-sm font-medium text-stone-600">
                Добавете снимка на фермата си
              </span>
            </span>
          )}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(47,42,36,0.12)_100%)] opacity-0 transition-opacity group-hover:opacity-100"
          />
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(event) => void handleFileChange(event)}
      />

      {pickError ? (
        <p role="alert" className="text-sm text-red-700">
          {pickError}
        </p>
      ) : null}
    </div>
  );
}
