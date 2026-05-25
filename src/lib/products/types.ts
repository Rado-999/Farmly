import type { FarmerReview, FarmerVideo } from "@/lib/farmers/types";
import type {
  ProductPriceUnit,
  ProductStatus,
} from "@/lib/supabase/database.types";

export type ProductFormValues = {
  title: string;
  price: string;
  priceUnit: ProductPriceUnit;
  category: string;
  description: string;
  season: string;
  videoIds: string[];
};

export type ProductListItem = {
  id: string;
  title: string;
  status: ProductStatus;
  price: string;
  priceUnit: ProductPriceUnit;
  category: string | null;
  imageUrl: string | null;
  farmerSlug: string;
};

export type ProductDetail = {
  id: string;
  farmerId: string;
  farmerSlug: string;
  farmerName: string;
  farmerLocation: string;
  farmerAvatarUrl: string | null;
  title: string;
  description: string;
  price: string;
  priceUnit: ProductPriceUnit;
  category: string;
  categoryLabel: string;
  season: string | null;
  availability: string;
  status: ProductStatus;
  images: string[];
  gradientFrom: string;
  gradientTo: string;
  videos: FarmerVideo[];
  reviews: FarmerReview[];
};

export type FarmerProductAccess = {
  farmerProfileId: string;
  farmerSlug: string;
  userId: string;
};
