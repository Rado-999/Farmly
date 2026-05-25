import {
  getFarmerRowAvatarUrl,
  getFarmerRowName,
} from "@/lib/farmers/farmer-profile-row";
import type { FarmerProfile } from "@/lib/farmers/types";
import {
  createFarmerImage,
  formatLocation,
  formatPriceWithUnit,
  formatReviewDate,
  formatSeason,
  mapVideoStage,
} from "@/lib/data/formatters";
import { formatDurationSeconds } from "@/lib/videos/format-duration";
import type {
  FarmerProfileRow,
  ProductRow,
  ReviewRow,
  VideoRow,
} from "@/lib/supabase/database.types";

export function mapFarmerProfile(
  farmer: FarmerProfileRow,
  products: ProductRow[],
  videos: VideoRow[],
  reviews: ReviewRow[],
): FarmerProfile {
  const name = getFarmerRowName(farmer);
  const avatarUrl = getFarmerRowAvatarUrl(farmer);
  const methods = [farmer.region, products[0]?.category]
    .filter((value): value is string => Boolean(value))
    .map((value) => value.trim());

  return {
    id: farmer.slug,
    farmerProfileId: farmer.id,
    name,
    location: formatLocation(farmer.location, farmer.region),
    region: farmer.region?.trim() || null,
    bio: farmer.bio ?? farmer.story ?? "",
    isVerified: Boolean(farmer.is_verified),
    experienceYears: farmer.experience_years,
    profileImage: createFarmerImage(`${name} profile`, avatarUrl, farmer.id),
    coverImage: createFarmerImage(
      `${name} cover`,
      farmer.cover_image_url,
      `${farmer.id}-cover`,
    ),
    howIFarm: farmer.story ?? "",
    farmingPhilosophy: farmer.philosophy ?? "",
    methods,
    videos: videos.map((video) => {
      const gradientSeed = video.id;

      const image = createFarmerImage(
        video.title ?? "Фермерско видео",
        video.poster_url ?? null,
        gradientSeed,
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
        publishedAt: video.created_at ?? null,
      };
    }),
    products: products.map((product) => {
      const gradientSeed = product.id;
      const relatedVideoIds = videos
        .filter((video) => video.product_id === product.id)
        .map((video) => video.id);

      const image = createFarmerImage(
        product.title,
        product.images?.[0],
        gradientSeed,
      );

      return {
        id: product.id,
        title: product.title,
        price: formatPriceWithUnit(product.price, product.price_unit),
        priceUnit: product.price_unit ?? "kg",
        availability: formatSeason(product.season),
        description: product.description ?? "",
        relatedVideoIds,
        imageUrl: image.imageUrl,
        imageUrls: product.images ?? [],
        gradientFrom: image.gradientFrom,
        gradientTo: image.gradientTo,
        status: product.status,
        category: product.category,
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
