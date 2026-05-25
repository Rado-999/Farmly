export type FarmerPreview = {
  id: string;
  name: string;
  location: string;
  story: string;
  specialty: string;
  imageUrl?: string | null;
  gradientFrom: string;
  gradientTo: string;
};

export type SeasonalProduct = {
  id: string;
  name: string;
  season: string;
  farmerName: string;
  farmerSlug: string;
  note: string;
  imageUrl?: string | null;
  gradientFrom: string;
  gradientTo: string;
};

export type FarmerStory = {
  id: string;
  title: string;
  farmerName: string;
  location: string;
  duration: string;
  description: string;
  videoUrl?: string | null;
  imageUrl?: string | null;
  gradientFrom: string;
  gradientTo: string;
};

export type HowItWorksStep = {
  step: number;
  title: string;
  description: string;
};
