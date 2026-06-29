export type VillageFarmer = {
  /** Public slug for profile URLs */
  slug: string;
  /** Internal UUID for follows */
  farmerId: string;
  name: string;
  location: string;
  region: string | null;
  story: string;
  philosophy: string | null;
  specialty: string;
  imageUrl?: string | null;
  gradientFrom: string;
  gradientTo: string;
};

export type VillageMoment = {
  id: string;
  title: string;
  season: string;
  note: string;
  farmerName: string;
  farmerSlug: string;
  imageUrl?: string | null;
  gradientFrom: string;
  gradientTo: string;
};

export type VillageFilm = {
  id: string;
  title: string;
  description: string;
  stage: string;
  duration: string;
  farmerName: string;
  farmerSlug: string;
  farmerId: string;
  location: string;
  videoUrl?: string | null;
  imageUrl?: string | null;
  gradientFrom: string;
  gradientTo: string;
};

export type VillageWhisper = {
  id: string;
  text: string;
  farmerName: string;
  farmerSlug: string;
  farmerId: string;
  location: string;
};

/** Content on the path — not a farmer directory */
export type VillageFeedItem =
  | { kind: "film"; id: string; film: VillageFilm }
  | { kind: "moment"; id: string; moment: VillageMoment }
  | { kind: "whisper"; id: string; whisper: VillageWhisper };

export type VillageNeighbourhood = {
  id: string;
  label: string;
  description: string;
  farmers: VillageFarmer[];
};

export type VillageSnapshot = {
  farmerCount: number;
  filmCount: number;
  productCount: number;
  regionCount: number;
};

export type { DiscoverPersonalization } from "@/lib/discover/personalize";

export type DiscoverVillageData = {
  farmers: VillageFarmer[];
  moments: VillageMoment[];
  films: VillageFilm[];
  whispers: VillageWhisper[];
  neighbourhoods: VillageNeighbourhood[];
  snapshot: VillageSnapshot;
};
