import type { FarmerVideo } from "@/lib/farmers/types";
import type { FarmerStory } from "@/lib/landing/types";

export type VideoPlaybackItem = FarmerVideo & {
  eyebrow?: string;
};

export function farmerStoryToVideo(story: FarmerStory): VideoPlaybackItem {
  const locationLine = [story.farmerName, story.location].filter(Boolean).join(" · ");

  return {
    id: story.id,
    title: story.title,
    stage: "daily",
    duration: story.duration,
    description: story.description,
    videoUrl: story.videoUrl,
    imageUrl: story.imageUrl,
    gradientFrom: story.gradientFrom,
    gradientTo: story.gradientTo,
    eyebrow: locationLine || undefined,
  };
}
