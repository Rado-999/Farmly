export type MyVillageFarmer = {
  farmerProfileId: string;
  slug: string;
  name: string;
  location: string;
  bio: string;
  imageUrl?: string | null;
  gradientFrom: string;
  gradientTo: string;
  followedAt: string;
};

export type MyVillageVideo = {
  id: string;
  title: string;
  description: string;
  stage: string;
  duration: string;
  farmerName: string;
  farmerSlug: string;
  farmerProfileId: string;
  videoUrl?: string | null;
  imageUrl?: string | null;
  gradientFrom: string;
  gradientTo: string;
  createdAt: string;
};

export type MyVillageProduct = {
  id: string;
  title: string;
  season: string;
  note: string;
  farmerName: string;
  farmerSlug: string;
  imageUrl?: string | null;
  gradientFrom: string;
  gradientTo: string;
  createdAt: string;
};

export type MyVillageData = {
  farmers: MyVillageFarmer[];
  videos: MyVillageVideo[];
  products: MyVillageProduct[];
};
