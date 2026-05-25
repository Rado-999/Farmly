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
          kicker="Доверието живее в движение"
          title="Гледай как храната наистина се отглежда."
          description="Не декорация — доказателство. Времето по кожата, инструменти в ръка, същото поле през пролет и жътва. Когато го видиш, вярата идва тихо."
        />
      </RevealOnScroll>

      {stories.length === 0 ? (
        <RevealOnScroll className="content-after-head block">
          <EmptyState
            title="Първите филми се правят"
            description="Докато фермерите споделят сутрините и жътвите си, тази алея ще се напълни с истинско движение — не стокови кадри, не реклами."
          />
        </RevealOnScroll>
      ) : (
        <VideoPlaybackList
          videos={videos}
          layout="grid"
          showStage={false}
          emptyMessage="Все още няма полски истории."
        />
      )}
    </>
  );
}
