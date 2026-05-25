import Link from "next/link";

import { ProductImageGallery } from "@/components/products/product-image-gallery";
import { ProductOwnerActions } from "@/components/products/product-owner-actions";
import { ProductVideoList } from "@/components/products/product-video-list";
import { UserAvatar } from "@/components/profile/user-avatar";
import type { ProductDetail } from "@/lib/products/types";

type ProductDetailViewProps = {
  product: ProductDetail;
  isOwner?: boolean;
};

function ProductReviews({ reviews }: { reviews: ProductDetail["reviews"] }) {
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-stone-500">
        Все още няма отзиви за този продукт.
      </p>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {reviews.map((review) => (
        <li
          key={review.id}
          className="rounded-[1.35rem] border border-stone-200/70 bg-white p-5"
        >
          <p className="font-medium text-stone-900">{review.author}</p>
          <p className="text-sm text-stone-500">{review.createdAt}</p>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            {review.comment}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function ProductDetailView({
  product,
  isOwner = false,
}: ProductDetailViewProps) {
  return (
    <main className="flex-1 bg-cream">
      <div className="page-shell page-y stack-relaxed">
        {product.status === "draft" ? (
          <p className="inline-flex w-fit rounded-full border border-amber-300/80 bg-amber-50 px-3 py-1 text-sm font-medium text-amber-900">
            Чернова — видима само за вас
          </p>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start lg:gap-10">
          <ProductImageGallery
            images={product.images}
            title={product.title}
            gradientFrom={product.gradientFrom}
            gradientTo={product.gradientTo}
          />

          <div className="stack-relaxed">
            <div className="stack-tight">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-forest">
                {product.availability}
              </p>
              <h1 className="text-3xl font-semibold text-stone-900 sm:text-4xl">
                {product.title}
              </h1>
              <p className="text-lg text-stone-800">{product.price}</p>
              <p className="text-sm text-stone-600">{product.categoryLabel}</p>
              {product.description ? (
                <p className="text-base leading-7 text-stone-600">
                  {product.description}
                </p>
              ) : null}
            </div>

            <Link
              href={`/farmers/${product.farmerSlug}`}
              className="flex cursor-pointer items-center gap-4 rounded-[1.35rem] border border-stone-200/70 bg-white p-4 transition-colors hover:border-forest/25"
            >
              <UserAvatar
                name={product.farmerName}
                avatarUrl={product.farmerAvatarUrl}
                size="md"
              />
              <div>
                <p className="text-sm text-stone-500">Отглежда се от</p>
                <p className="font-medium text-stone-900">{product.farmerName}</p>
                <p className="text-sm text-stone-600">{product.farmerLocation}</p>
              </div>
            </Link>

            {isOwner ? (
              <ProductOwnerActions
                productId={product.id}
                farmerProfileId={product.farmerId}
                productTitle={product.title}
              />
            ) : null}
          </div>
        </div>

        <section className="rounded-[1.35rem] border border-stone-200/70 bg-white/90 p-6">
          <h2 className="text-lg font-semibold text-stone-900">
            Историята на продукта
          </h2>
          <p className="mt-1 text-sm text-stone-600">
            Видеата, свързани с този сезонен продукт.
          </p>
          <div className="mt-4">
            <ProductVideoList videos={product.videos} />
          </div>
        </section>

        <section className="rounded-[1.35rem] border border-stone-200/70 bg-cream/90 p-6">
          <h2 className="text-lg font-semibold text-stone-900">
            Отзиви от общността
          </h2>
          <p className="mt-1 text-sm text-stone-600">
            Честни бележки от хора, които следват сезона.
          </p>
          <div className="mt-4">
            <ProductReviews reviews={product.reviews} />
          </div>
        </section>
      </div>
    </main>
  );
}
