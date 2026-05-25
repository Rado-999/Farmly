"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { AvatarCropView } from "@/components/onboarding/avatar-crop-view";
import { getProfileInitials } from "@/lib/auth/profile";
import type { CropAreaPixels } from "@/lib/images/crop-image";
import { getCroppedImageFile } from "@/lib/images/crop-image";
import { prepareImageForCrop } from "@/lib/images/prepare-image-for-crop";

type AvatarPhotoPickerProps = {
  name: string;
  initialImageUrl?: string | null;
  onCroppedFileChange: (file: File | null) => void;
  onCroppingChange?: (isCropping: boolean) => void;
};

type CropSource = {
  url: string;
  width: number;
  height: number;
  revoke: () => void;
};

export function AvatarPhotoPicker({
  name,
  initialImageUrl = null,
  onCroppedFileChange,
  onCroppingChange,
}: AvatarPhotoPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropSourceRef = useRef<CropSource | null>(null);
  const [cropSource, setCropSource] = useState<CropSource | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [savedPreviewUrl, setSavedPreviewUrl] = useState<string | null>(
    initialImageUrl,
  );
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropAreaPixels | null>(
    null,
  );
  const [pickError, setPickError] = useState<string | null>(null);

  const revokeCropSource = useCallback((source: CropSource | null) => {
    source?.revoke();
  }, []);

  useEffect(() => {
    cropSourceRef.current = cropSource;
  }, [cropSource]);

  useEffect(() => {
    return () => {
      revokeCropSource(cropSourceRef.current);
    };
  }, [revokeCropSource]);

  const showCropper = isCropping && cropSource;

  useEffect(() => {
    onCroppingChange?.(Boolean(showCropper));
  }, [showCropper, onCroppingChange]);

  async function handleApplyCrop() {
    if (!cropSource || !croppedAreaPixels) {
      return;
    }

    const file = await getCroppedImageFile(cropSource.url, croppedAreaPixels);
    const previewUrl = URL.createObjectURL(file);

    if (savedPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(savedPreviewUrl);
    }

    revokeCropSource(cropSource);
    setCropSource(null);
    setSavedPreviewUrl(previewUrl);
    setIsCropping(false);
    setCroppedAreaPixels(null);
    onCroppedFileChange(file);
  }

  async function handleFileSelect(file: File | null) {
    if (!file) {
      return;
    }

    setPickError(null);
    const prepared = await prepareImageForCrop(file);

    if ("error" in prepared) {
      setPickError(prepared.error);
      return;
    }

    revokeCropSource(cropSource);
    setCropSource(prepared);
    setIsCropping(true);
    setCroppedAreaPixels(null);
  }

  function handleRemovePhoto() {
    revokeCropSource(cropSource);
    setCropSource(null);
    setIsCropping(false);
    setCroppedAreaPixels(null);
    onCroppedFileChange(null);

    if (savedPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(savedPreviewUrl);
    }

    setSavedPreviewUrl(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const initials = getProfileInitials(name || "Вие");

  return (
    <div className="mx-auto w-full max-w-sm space-y-4">
      {showCropper && cropSource ? (
        <AvatarCropView
          imageSrc={cropSource.url}
          imageWidth={cropSource.width}
          imageHeight={cropSource.height}
          onCropAreaChange={setCroppedAreaPixels}
        />
      ) : (
        <div className="relative aspect-square w-full overflow-hidden rounded-[1.5rem] shadow-[0_24px_52px_-22px_rgba(47,42,36,0.35)] ring-1 ring-stone-200/80">
          {savedPreviewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- blob or user avatar URL
            <img
              src={savedPreviewUrl}
              alt="Преглед на профилна снимка"
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[linear-gradient(135deg,#d9e2cf_0%,#8a9a7b_100%)] p-6 text-center">
              <span className="text-4xl font-semibold text-forest">{initials}</span>
              <p className="text-sm text-stone-700">Добавете снимка на себе си</p>
            </div>
          )}
        </div>
      )}

      {pickError ? (
        <p
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {pickError}
        </p>
      ) : null}

      {showCropper ? (
        <div className="mt-4 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => void handleApplyCrop()}
            disabled={!croppedAreaPixels}
            className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-full bg-forest px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#324a2f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Използвай тази снимка
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-full border border-stone-300/90 bg-white px-5 py-3 text-sm font-medium text-stone-800 transition-colors hover:border-forest/35 hover:text-forest"
          >
            Смени снимката
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#324a2f]"
          >
            {savedPreviewUrl ? "Смени снимката" : "Качи снимка"}
          </button>
          {savedPreviewUrl ? (
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="text-sm font-medium text-stone-500 transition-colors hover:text-stone-800"
            >
              Премахни
            </button>
          ) : null}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(event) => handleFileSelect(event.target.files?.[0] ?? null)}
      />
    </div>
  );
}
