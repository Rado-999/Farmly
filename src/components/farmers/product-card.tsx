import Link from "next/link";

import { MediaPanel } from "@/components/ui/media-panel";
import type { FarmerProduct, FarmerVideo } from "@/lib/farmers/types";

type ProductCardProps = {
  product: FarmerProduct;
  farmerSlug: string;
  relatedVideos: FarmerVideo[];
};

const rowClassName =
  "grid gap-5 px-4 py-8 sm:grid-cols-[minmax(0,1fr)_9.5rem] sm:items-center sm:gap-x-10 sm:gap-y-5 sm:px-6 lg:px-8";

export function ProductCard({
  product,
  farmerSlug,
  relatedVideos,
}: ProductCardProps) {
  const href = `/farmers/${farmerSlug}/products/${product.id}`;
  const videoCount = relatedVideos.length;

  return (
    <Link
      href={href}
      className={`${rowClassName} group cursor-pointer rounded-2xl transition-colors duration-300 hover:bg-forest/[0.04]`}
    >
      <div className="stack-tight min-w-0">
        <p className="text-sm font-medium tracking-wide text-clay">
          {product.availability}
        </p>
        <h3 className="editorial-serif text-2xl text-forest-deep sm:text-3xl">
          {product.title}
        </h3>
        <p className="text-base font-medium text-stone-800">{product.price}</p>
        {product.description ? (
          <p className="max-w-md line-clamp-2 text-sm leading-7 text-stone-700/90 sm:text-base sm:leading-8">
            {product.description}
          </p>
        ) : null}
        {videoCount > 0 ? (
          <span className="story-link mt-1">
            {videoCount}{" "}
            {videoCount === 1 ? "свързано видео" : "свързани видеа"} — виж
            историята
          </span>
        ) : (
          <span className="story-link mt-1">Виж подробности за продукта</span>
        )}
      </div>

      <MediaPanel
        from={product.gradientFrom}
        to={product.gradientTo}
        label={product.title}
        imageUrl={product.imageUrl}
        interactive
        className="aspect-square w-full max-w-[9.5rem] shrink-0 justify-self-end rounded-sm sm:max-h-36"
      />
    </Link>
  );
}
