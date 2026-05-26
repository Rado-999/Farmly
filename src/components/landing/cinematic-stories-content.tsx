"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { MediaPanel } from "@/components/ui/media-panel";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { StoryHeading } from "@/components/ui/story-heading";
import { farmerStoryToVideo } from "@/lib/landing/story-to-video";
import type { FarmerStory } from "@/lib/landing/types";
import type { VideoPlaybackSource } from "@/lib/videos/playback-types";

const VideoPlayerModal = dynamic(
  () =>
    import("@/components/videos/video-player-modal").then(
      (module) => module.VideoPlayerModal,
    ),
  { ssr: false },
);

type CinematicStoriesContentProps = {
  stories: FarmerStory[];
};

function toPlayback(story: FarmerStory): VideoPlaybackSource {
  const video = farmerStoryToVideo(story);
  return {
    id: video.id,
    title: video.title,
    duration: video.duration,
    description: video.description,
    videoUrl: video.videoUrl ?? "",
    imageUrl: video.imageUrl,
  };
}

function PlayMark({ size = "lg" }: { size?: "lg" | "sm" }) {
  const sizeClass =
    size === "lg" ? "h-14 w-14 text-sm" : "h-10 w-10 text-xs";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-mist/40 bg-forest-deep/35 text-mist backdrop-blur-sm ${sizeClass}`}
    >
      <span aria-hidden className="ml-0.5">
        ▶
      </span>
      <span className="sr-only">Пусни видеото</span>
    </span>
  );
}

export function CinematicStoriesContent({ stories }: CinematicStoriesContentProps) {
  const [activeStory, setActiveStory] = useState<FarmerStory | null>(null);
  const [featured, ...rest] = stories;

  return (
    <>
      <RevealOnScroll>
        <StoryHeading
          kicker="Доверието живее в движение"
          title="Гледай как храната наистина се отглежда."
          description="Не декорация — доказателство. Времето по кожата, инструменти в ръка, същото поле през пролет и жътва. Когато го видиш, вярата идва тихо."
          size="chapter"
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
        <div className="content-after-head stack-relaxed">
          {featured ? (
            <RevealOnScroll>
              <button
                type="button"
                onClick={() => {
                  if (featured.videoUrl) setActiveStory(featured);
                }}
                disabled={!featured.videoUrl}
                className="group relative block w-full overflow-hidden rounded-sm text-left disabled:cursor-not-allowed disabled:opacity-70"
              >
                <MediaPanel
                  from={featured.gradientFrom}
                  to={featured.gradientTo}
                  label={featured.title}
                  imageUrl={featured.imageUrl}
                  className="aspect-[21/9] min-h-[14rem] sm:min-h-[18rem] lg:min-h-[22rem]"
                  overlay={
                    <div className="absolute inset-0 flex flex-col justify-end bg-[linear-gradient(180deg,rgba(20,28,18,0.05)_0%,rgba(20,28,18,0.75)_100%)] p-6 sm:p-10 lg:p-12">
                      <div className="flex items-end justify-between gap-6">
                        <div className="max-w-2xl stack-tight">
                          <p className="type-kicker type-kicker-on-dark">
                            {featured.location} · {featured.farmerName}
                          </p>
                          <span className="editorial-serif text-2xl text-mist sm:text-3xl lg:text-4xl">
                            {featured.title}
                          </span>
                          <p className="max-w-xl text-sm leading-7 text-mist/80 sm:text-base">
                            {featured.description}
                          </p>
                        </div>
                        <PlayMark />
                      </div>
                    </div>
                  }
                />
              </button>
            </RevealOnScroll>
          ) : null}

          {rest.length > 0 ? (
            <ul className="m-0 list-none divide-y divide-stone-300/40 p-0">
              {rest.map((story) => (
                <li key={story.id}>
                  <RevealOnScroll>
                    <button
                      type="button"
                      onClick={() => {
                        if (story.videoUrl) setActiveStory(story);
                      }}
                      disabled={!story.videoUrl}
                      className="group flex w-full cursor-pointer items-center gap-5 py-8 text-left transition-colors duration-500 hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-70 sm:gap-8 sm:py-10"
                    >
                      <MediaPanel
                        from={story.gradientFrom}
                        to={story.gradientTo}
                        label={story.title}
                        imageUrl={story.imageUrl}
                        className="aspect-video h-20 w-32 shrink-0 rounded-sm sm:h-24 sm:w-40"
                        overlay={
                          <div className="absolute inset-0 flex items-center justify-center bg-forest-deep/20">
                            <PlayMark size="sm" />
                          </div>
                        }
                      />
                      <div className="min-w-0 flex-1 stack-tight">
                        <p className="type-kicker">
                          {story.farmerName} · {story.duration}
                        </p>
                        <span className="editorial-serif text-xl text-forest-deep sm:text-2xl">
                          {story.title}
                        </span>
                        <p className="line-clamp-2 text-sm leading-7 text-stone-700/90 sm:text-base">
                          {story.description}
                        </p>
                      </div>
                      <span className="story-link hidden shrink-0 sm:inline-flex">
                        Гледай
                      </span>
                    </button>
                  </RevealOnScroll>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}

      {activeStory ? (
        <VideoPlayerModal
          video={toPlayback(activeStory)}
          onClose={() => setActiveStory(null)}
        />
      ) : null}
    </>
  );
}
