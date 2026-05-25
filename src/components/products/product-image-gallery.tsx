"use client";

import Image from "next/image";
import { useState } from "react";

type ProductImageGalleryProps = {
  images: string[];
  title: string;
  gradientFrom: string;
  gradientTo: string;
};

export function ProductImageGallery({
  images,
  title,
  gradientFrom,
  gradientTo,
}: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const safeIndex = Math.min(selectedIndex, Math.max(images.length - 1, 0));
  const activeImage = images[safeIndex];

  if (!activeImage) {
    return (
      <div
        className="flex aspect-[4/3] max-h-72 w-full items-center justify-center rounded-[1.35rem] border border-stone-200/70 sm:max-h-80"
        style={{
          background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
        }}
      >
        <span className="text-lg font-medium text-white/90">{title}</span>
      </div>
    );
  }

  return (
    <div className="stack-tight max-w-xl">
      <div className="relative aspect-[4/3] max-h-72 w-full overflow-hidden rounded-[1.35rem] border border-stone-200/70 bg-stone-100 sm:max-h-80">
        <Image
          src={activeImage}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 28rem"
          priority
        />
      </div>

      {images.length > 1 ? (
        <ul className="flex flex-wrap gap-2">
          {images.map((imageUrl, index) => (
            <li key={imageUrl}>
              <button
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`relative h-16 w-16 cursor-pointer overflow-hidden rounded-xl border-2 transition-colors ${
                  index === safeIndex
                    ? "border-forest"
                    : "border-stone-200/80 hover:border-forest/40"
                }`}
              >
                <Image
                  src={imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
