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
  source_tier: 1;
};

export type VillageFeedSections = {
  showSinceYouWereHere: boolean;
  sinceYouWereHere: VillageFeedItem[];
  fromYourFarms: VillageFeedItem[];
  seasonNearYou: VillageFeedItem[];
  localGatherings: VillageFeedItem[];
  hasFollows: boolean;
  hasAnyContent: boolean;
};
