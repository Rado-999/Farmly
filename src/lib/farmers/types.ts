export type FarmerImage = {
  alt: string;
  imageUrl?: string | null;
  gradientFrom: string;
  gradientTo: string;
};

export type FarmerVideo = {
  id: string;
  title: string;
  stage: "planting" | "growing" | "harvesting" | "daily";
  duration: string;
  description: string;
  videoUrl?: string | null;
  imageUrl?: string | null;
  gradientFrom: string;
  gradientTo: string;
  /** ISO timestamp when available from the database */
  publishedAt?: string | null;
};

export type FarmerProduct = {
  id: string;
  title: string;
  price: string;
  priceUnit?: string;
  availability: string;
  description: string;
  relatedVideoIds: string[];
  imageUrl?: string | null;
  imageUrls?: string[];
  gradientFrom: string;
  gradientTo: string;
  status?: "draft" | "published";
  category?: string | null;
};

export type FarmerReview = {
  id: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type FarmerDirectoryEntry = {
  id: string;
  name: string;
  location: string;
  bio: string;
  profileImage: FarmerImage;
};

export type FarmerViewerRelationship = {
  farmerProfileId: string;
  isFollowing: boolean;
  isSelf: boolean;
};

export type FarmerProfile = {
  /** Public slug for URLs (`/farmers/[slug]`) */
  id: string;
  /** Internal `farmer_profiles.id` for follows and relations */
  farmerProfileId: string;
  name: string;
  location: string;
  region: string | null;
  bio: string;
  experienceYears: number | null;
  isVerified: boolean;
  profileImage: FarmerImage;
  coverImage: FarmerImage;
  howIFarm: string;
  farmingPhilosophy: string;
  methods: string[];
  videos: FarmerVideo[];
  products: FarmerProduct[];
  reviews: FarmerReview[];
  /** Populated server-side when RLS allows (often null for anonymous visitors) */
  followerCount?: number | null;
};
