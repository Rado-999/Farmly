"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { useLocale } from "@/components/i18n/language-provider";
import { EmptyState } from "@/components/ui/empty-state";
import { MediaPanel } from "@/components/ui/media-panel";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { RevealStagger } from "@/components/ui/reveal-stagger";
import { StoryHeading } from "@/components/ui/story-heading";
import { translate } from "@/lib/i18n/translate";
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

function PlayMark() {
  const { locale } = useLocale();

  return (
    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-mist/40 bg-forest-deep/35 text-xs text-mist backdrop-blur-sm">
      <span aria-hidden className="ml-0.5">
        ▶
      </span>
      <span className="sr-only">
        {translate(locale, "Пусни видеото", "Play video")}
      </span>
    </span>
  );
}

function StoryFilmCard({
  story,
  onPlay,
}: {
  story: FarmerStory;
  onPlay: (story: FarmerStory) => void;
}) {
  const { locale } = useLocale();

  return (
    <button
      type="button"
      onClick={() => {
        if (story.videoUrl) onPlay(story);
      }}
      disabled={!story.videoUrl}
      className="group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-sm border border-stone-300/45 bg-white/50 text-left shadow-[0_10px_28px_-18px_rgba(26,22,16,0.18)] transition-[border-color,background-color,box-shadow] duration-300 hover:border-forest/30 hover:bg-white/80 hover:shadow-[0_16px_36px_-20px_rgba(47,42,36,0.22)] disabled:cursor-not-allowed disabled:opacity-70"
    >
      <MediaPanel
        from={story.gradientFrom}
        to={story.gradientTo}
        label={story.title}
        imageUrl={story.imageUrl}
        className="aspect-video w-full shrink-0 rounded-b-none"
        overlay={
          <div className="absolute inset-0 flex items-center justify-center bg-forest-deep/20 transition-colors duration-300 group-hover:bg-forest-deep/28">
            <PlayMark />
          </div>
        }
      />
      <div className="flex flex-1 flex-col gap-2 p-4 sm:gap-2.5 sm:p-5">
        <p className="type-kicker line-clamp-1">
          {story.location} · {story.farmerName}
        </p>
        <span className="editorial-serif text-lg leading-snug text-forest-deep sm:text-xl">
          {story.title}
        </span>
        <p className="text-xs font-medium tracking-wide text-stone-500">
          {story.duration}
        </p>
        {story.description ? (
          <p className="line-clamp-2 text-sm leading-6 text-stone-700/90">
            {story.description}
          </p>
        ) : null}
        <span className="story-link story-link--plain mt-1 self-start">
          {translate(locale, "Гледай", "Watch")}
        </span>
      </div>
    </button>
  );
}

export function CinematicStoriesContent({ stories }: CinematicStoriesContentProps) {
  const { locale } = useLocale();
  const [activeStory, setActiveStory] = useState<FarmerStory | null>(null);

  return (
    <>
      <RevealOnScroll>
        <StoryHeading
          kicker={translate(locale, "Доверието живее в движение", "Trust lives in motion")}
          title={translate(
            locale,
            "Гледай как храната наистина се отглежда.",
            "Watch how food is really grown.",
          )}
          description={translate(
            locale,
            "Не декорация — доказателство. Времето по кожата, инструменти в ръка, същото поле през пролет и жътва. Когато го видиш, вярата идва тихо.",
            "Not decoration, but proof. Time on the skin, tools in hand, the same field in spring and harvest. Once you see it, belief arrives quietly.",
          )}
          size="chapter"
        />
      </RevealOnScroll>

      {stories.length === 0 ? (
        <RevealOnScroll className="content-after-head block">
          <EmptyState
            title={translate(locale, "Първите филми се правят", "The first films are being made")}
            description={translate(
              locale,
              "Докато фермерите споделят сутрините и жътвите си, тази алея ще се напълни с истинско движение — не стокови кадри, не реклами.",
              "As farmers share their mornings and harvests, this lane will fill with real movement, not stock footage or ads.",
            )}
          />
        </RevealOnScroll>
      ) : (
        <RevealStagger className="content-after-head grid-cards grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <StoryFilmCard
              key={story.id}
              story={story}
              onPlay={setActiveStory}
            />
          ))}
        </RevealStagger>
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
