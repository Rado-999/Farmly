import { getProductCategoryLabel } from "@/lib/products/constants";
import type { ProductDetail, ProductListItem } from "@/lib/products/types";
import {
  createFarmerImage,
  formatLocation,
  formatPriceWithUnit,
  formatReviewDate,
  formatSeason,
  mapVideoStage,
} from "@/lib/data/formatters";
import {
  getFarmerRowAvatarUrl,
  getFarmerRowName,
} from "@/lib/farmers/farmer-profile-row";
import { getDisplayableProductImageUrl } from "@/lib/products/storage";
import { formatDurationSeconds } from "@/lib/videos/format-duration";
import type {
  FarmerProfileRow,
  ProductRow,
  ReviewRow,
  VideoRow,
} from "@/lib/supabase/database.types";

export function mapProductListItem(
  product: ProductRow,
  farmerSlug: string,
): ProductListItem {
  const image = createFarmerImage(
    product.title,
    getDisplayableProductImageUrl(product.images?.[0]),
    product.id,
  );

  return {
    id: product.id,
    title: product.title,
    status: product.status ?? "draft",
    price: formatPriceWithUnit(product.price, product.price_unit),
    priceUnit: product.price_unit ?? "kg",
    category: product.category,
    imageUrl: image.imageUrl ?? null,
    farmerSlug,
  };
}

export function mapProductDetail(
  product: ProductRow,
  farmer: FarmerProfileRow,
  videos: VideoRow[],
  reviews: ReviewRow[],
): ProductDetail {
  const farmerName = getFarmerRowName(farmer);
  const imageSeed = product.id;
  const heroImage = createFarmerImage(
    product.title,
    product.images?.[0],
    imageSeed,
  );

  return {
    id: product.id,
    farmerId: farmer.id,
    farmerSlug: farmer.slug,
    farmerName,
    farmerLocation: formatLocation(farmer.location, farmer.region),
    farmerAvatarUrl: getFarmerRowAvatarUrl(farmer),
    title: product.title,
    description: product.description ?? "",
    price: formatPriceWithUnit(product.price, product.price_unit),
    priceUnit: product.price_unit ?? "kg",
    category: product.category ?? "other",
    categoryLabel: getProductCategoryLabel(product.category),
    season: product.season,
    availability: formatSeason(product.season),
    status: product.status ?? "draft",
    images: product.images ?? [],
    gradientFrom: heroImage.gradientFrom,
    gradientTo: heroImage.gradientTo,
    videos: videos.map((video) => {
      const image = createFarmerImage(
        video.title ?? "Фермерско видео",
        video.poster_url ?? null,
        video.id,
      );

      return {
        id: video.id,
        title: video.title ?? "Новина от фермата",
        stage: mapVideoStage(video.type),
        duration: formatDurationSeconds(video.duration_seconds),
        description: video.description ?? "",
        videoUrl: video.video_url,
        imageUrl: image.imageUrl,
        gradientFrom: image.gradientFrom,
        gradientTo: image.gradientTo,
      };
    }),
    reviews: reviews.map((review) => ({
      id: review.id,
      author: review.author_display_name?.trim() || "Член на общността",
      rating: review.rating ?? 5,
      comment: review.comment ?? "",
      createdAt: formatReviewDate(review.created_at),
    })),
  };
}
