"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { StoryHeading } from "@/components/ui/story-heading";
import { VideoPlaybackList } from "@/components/videos/video-playback-list";
import { farmerStoryToVideo } from "@/lib/landing/story-to-video";
import type { FarmerStory } from "@/lib/landing/types";

type FarmerStoriesContentProps = {
  stories: FarmerStory[];
};

export function FarmerStoriesContent({ stories }: FarmerStoriesContentProps) {
  const videos = stories.map(farmerStoryToVideo);

  return (
    <>
      <RevealOnScroll>
        <StoryHeading
          kicker="Видеа от полето"
          title="Гледай как храната наистина се отглежда."
          description="Кратки клипове от работата на фермерите. Не реклами, а реални кадри от полето."
        />
      </RevealOnScroll>

      {stories.length === 0 ? (
        <RevealOnScroll className="content-after-head block">
          <EmptyState
            title="Първите филми се правят"
            description="Ще се появят, когато фермерите качат първите си клипове."
          />
        </RevealOnScroll>
      ) : (
        <VideoPlaybackList
          videos={videos}
          layout="grid"
          showStage={false}
          emptyMessage="Все още няма видео."
        />
      )}
    </>
  );
}
