export type VillageFeedItemType =
  | "post"
  | "video"
  | "harvest"
  | "event"
  | "season";

/** Normalized village timeline item (finite feed). */
export type VillageFeedItem = {
  type: VillageFeedItemType;
  id: string;
  farmer_id: string;
  farmer_slug: string;
  farmer_name: string;
  created_at: string;
  title?: string;
  description?: string;
  image?: string | null;
  season?: string;
  href: string;
  /** 1 = followed, 2 = saved only */
  source_tier: 1 | 2;
};

export type VillageSavedFarmCard = {
  farmer_id: string;
  slug: string;
  name: string;
  location: string;
  bio: string;
  image?: string | null;
  gradientFrom: string;
  gradientTo: string;
};

export type VillageFeedSections = {
  showSinceYouWereHere: boolean;
  sinceYouWereHere: VillageFeedItem[];
  fromYourFarms: VillageFeedItem[];
  savedFarms: VillageSavedFarmCard[];
  seasonNearYou: VillageFeedItem[];
  localGatherings: VillageFeedItem[];
  hasFollows: boolean;
  hasSavedOnly: boolean;
  hasAnyContent: boolean;
};
