"use client";

import { useRef, useState } from "react";

import { isAllowedVideoFilename, MAX_FILE_MB } from "@/lib/videos/constants";

type VideoDropzoneProps = {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
};

export function VideoDropzone({ onFileSelected, disabled }: VideoDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFiles(files: FileList | File[]) {
    const list = Array.from(files);
    const file =
      list.find((item) => isAllowedVideoFilename(item.name)) ??
      list.find((item) => item.type.startsWith("video/"));

    if (file) {
      onFileSelected(file);
    }
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    setIsDragging(false);

    if (disabled) {
      return;
    }

    handleFiles(event.dataTransfer.files);
  }

  return (
    <div className="stack-tight">
      <div
        onDragOver={(event) => {
          event.preventDefault();

          if (!disabled) {
            setIsDragging(true);
          }
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
          isDragging
            ? "border-forest bg-forest/5"
            : "border-stone-300/90 bg-stone-50/80"
        } ${disabled ? "opacity-60" : ""}`}
      >
        <p className="text-sm font-medium text-stone-800">Пуснете видео тук</p>
        <p className="mt-1 text-sm text-stone-500">
          само MP4 (H.264) · до 3 мин · до {MAX_FILE_MB} MB
        </p>
        <p className="mt-1 text-xs text-stone-500">
          30 сек – 2 мин е идеално. По-големи файлове (напр. екранен запис)
          компресирайте преди качване.
        </p>
        <button
          type="button"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 inline-flex cursor-pointer rounded-full border border-stone-300/90 bg-white px-4 py-2 text-sm font-medium text-stone-800 transition-colors hover:border-forest/35 hover:text-forest disabled:cursor-not-allowed"
        >
          Избери видео
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,.mp4"
        className="sr-only"
        disabled={disabled}
        onChange={(event) => {
          if (event.target.files) {
            handleFiles(event.target.files);
          }

          event.target.value = "";
        }}
      />
    </div>
  );
}
