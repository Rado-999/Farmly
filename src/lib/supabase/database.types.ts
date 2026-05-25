export type FarmerProfileRow = {
  id: string;
  slug: string;
  location: string | null;
  region: string | null;
  bio: string | null;
  story: string | null;
  philosophy: string | null;
  experience_years: number | null;
  cover_image_url: string | null;
  is_verified: boolean | null;
  display_name: string | null;
  public_display_name: string | null;
  public_avatar_url: string | null;
  listing_profile_complete: boolean;
};

export type ProductStatus = "draft" | "published";

export type ProductPriceUnit = "kg" | "box" | "l" | "piece";

export type ProductRow = {
  id: string;
  farmer_id: string | null;
  title: string;
  description: string | null;
  price: number | string | null;
  season: string | null;
  category: string | null;
  images: string[] | null;
  status?: ProductStatus;
  price_unit?: ProductPriceUnit;
  published_at?: string | null;
};

export type VideoRow = {
  id: string;
  farmer_id: string | null;
  product_id: string | null;
  title: string | null;
  description: string | null;
  type: string | null;
  video_url: string;
  poster_url?: string | null;
  duration_seconds?: number | null;
  created_at?: string | null;
};

export type ReviewRow = {
  id: string;
  farmer_id: string | null;
  product_id: string | null;
  rating: number | null;
  comment: string | null;
  created_at: string | null;
  author_display_name: string;
};

export type FollowNotifyLevel = "off" | "digest" | "harvest" | "all_gentle";

export type FollowRow = {
  id: string;
  user_id: string;
  farmer_id: string;
  created_at: string | null;
  notify_level: FollowNotifyLevel;
  followed_via: string | null;
};

export type SavedFarmRow = {
  id: string;
  user_id: string;
  farmer_id: string;
  created_at: string;
};

export type PostKind = "field_note" | "harvest" | "season" | "event";

export type PostRow = {
  id: string;
  farmer_id: string;
  title: string | null;
  content: string | null;
  image_url: string | null;
  video_url: string | null;
  created_at: string | null;
  kind: PostKind;
  published_at: string | null;
  season: string | null;
};

export type LocalEventRow = {
  id: string;
  farmer_id: string | null;
  region: string;
  city: string | null;
  title: string;
  description: string | null;
  kind: "market" | "open_farm" | "harvest_day" | "workshop";
  starts_at: string;
  ends_at: string | null;
  location_label: string | null;
  image_url: string | null;
  created_at: string;
};

export type NotificationDeliveryRow = {
  id: string;
  user_id: string;
  kind: string;
  payload: Record<string, unknown>;
  sent_at: string;
};
