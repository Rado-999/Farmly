import type { VideoStageValue } from "@/lib/videos/constants";
import type { FarmerVideo } from "@/lib/farmers/types";

export type VideoFormValues = {
  title: string;
  stage: VideoStageValue;
  description: string;
  productId: string;
};

export type FarmerVideoListItem = {
  id: string;
  title: string;
  stage: FarmerVideo["stage"];
  durationLabel: string;
  description: string | null;
  posterUrl: string | null;
  videoUrl: string;
  productId: string | null;
  productTitle: string | null;
};
