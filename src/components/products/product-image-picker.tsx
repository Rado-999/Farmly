"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import {
  createNewImageDraft,
  type ProductImageDraft,
} from "@/lib/products/image-drafts";

type ProductImagePickerProps = {
  images: ProductImageDraft[];
  onChange: (images: ProductImageDraft[]) => void;
};

function reorderList<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function ProductImagePicker({ images, onChange }: ProductImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  function addFiles(files: File[]) {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      return;
    }

    const newDrafts = imageFiles.map((file) =>
      createNewImageDraft(file, URL.createObjectURL(file)),
    );

    onChange([...images, ...newDrafts]);
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  }

  function handleFileDrop(event: React.DragEvent) {
    event.preventDefault();
    setIsDraggingFiles(false);
    addFiles(Array.from(event.dataTransfer.files ?? []));
  }

  function removeImage(id: string) {
    const removed = images.find((image) => image.id === id);

    if (removed?.kind === "new") {
      URL.revokeObjectURL(removed.preview);
    }

    onChange(images.filter((image) => image.id !== id));
  }

  function handleReorderDrop(targetId: string) {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDropTargetId(null);
      return;
    }

    const fromIndex = images.findIndex((image) => image.id === draggedId);
    const toIndex = images.findIndex((image) => image.id === targetId);

    if (fromIndex === -1 || toIndex === -1) {
      setDraggedId(null);
      setDropTargetId(null);
      return;
    }

    onChange(reorderList(images, fromIndex, toIndex));
    setDraggedId(null);
    setDropTargetId(null);
  }

  return (
    <div className="stack-tight">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDraggingFiles(true);
        }}
        onDragLeave={() => setIsDraggingFiles(false)}
        onDrop={handleFileDrop}
        className={`rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
          isDraggingFiles
            ? "border-forest bg-forest/5"
            : "border-stone-300/90 bg-stone-50/80"
        }`}
      >
        <p className="text-sm font-medium text-stone-800">
          Пуснете снимки тук или изберете няколко наведнъж
        </p>
        <p className="mt-1 text-sm text-stone-500">
          Можете да добавите множество файлове и да ги пренаредите с влачене.
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-4 inline-flex cursor-pointer rounded-full border border-stone-300/90 bg-white px-4 py-2 text-sm font-medium text-stone-800 transition-colors hover:border-forest/35 hover:text-forest"
        >
          Избери снимки
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={handleInputChange}
      />

      {images.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image, index) => (
            <li
              key={image.id}
              draggable
              onDragStart={() => setDraggedId(image.id)}
              onDragEnd={() => {
                setDraggedId(null);
                setDropTargetId(null);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setDropTargetId(image.id);
              }}
              onDrop={(event) => {
                event.preventDefault();
                handleReorderDrop(image.id);
              }}
              className={`relative overflow-hidden rounded-2xl border bg-white ${
                dropTargetId === image.id && draggedId !== image.id
                  ? "border-forest ring-2 ring-forest/20"
                  : "border-stone-200/80"
              } ${draggedId === image.id ? "opacity-50" : ""}`}
            >
              <div className="relative aspect-square">
                <Image
                  src={
                    image.kind === "existing" ? image.previewUrl : image.preview
                  }
                  alt=""
                  fill
                  className="object-cover"
                  sizes="160px"
                />
                <span className="absolute left-2 top-2 rounded-full bg-stone-900/70 px-2 py-0.5 text-xs font-medium text-white">
                  {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeImage(image.id)}
                  className="absolute right-1 top-1 cursor-pointer rounded-full bg-stone-900/75 px-2 py-0.5 text-xs text-white"
                  aria-label="Премахни снимка"
                >
                  ×
                </button>
              </div>
              <p className="cursor-grab px-2 py-1.5 text-center text-xs text-stone-500 active:cursor-grabbing">
                Влачете за пренареждане
              </p>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="text-sm text-stone-500">
        {images.length === 0
          ? "Поне една снимка е нужна за публикуване."
          : `${images.length} снимки — първата е основна`}
      </p>
    </div>
  );
}
