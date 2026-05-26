"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { MediaPanel } from "@/components/ui/media-panel";
import { RevealStagger } from "@/components/ui/reveal-stagger";
import { formatVideoStage } from "@/lib/data/formatters";
import type { VideoPlaybackItem } from "@/lib/landing/story-to-video";
import type { FarmerVideo } from "@/lib/farmers/types";
import type { VideoPlaybackSource } from "@/lib/videos/playback-types";

const VideoPlayerModal = dynamic(
  () =>
    import("@/components/videos/video-player-modal").then(
      (module) => module.VideoPlayerModal,
    ),
  { ssr: false },
);

function toPlayback(video: FarmerVideo): VideoPlaybackSource {
  return {
    id: video.id,
    title: video.title,
    duration: video.duration,
    description: video.description,
    videoUrl: video.videoUrl ?? "",
    imageUrl: video.imageUrl,
  };
}

function PlayBadge() {
  return (
    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/92 text-forest shadow-[0_12px_30px_-16px_rgba(47,42,36,0.45)]">
      <span aria-hidden className="ml-0.5 text-xs">
        ▶
      </span>
      <span className="sr-only">Пусни видеото</span>
    </span>
  );
}

type VideoPlaybackListProps = {
  videos: (FarmerVideo | VideoPlaybackItem)[];
  layout?: "grid" | "stack";
  showStage?: boolean;
  emptyMessage?: string;
  className?: string;
  useStagger?: boolean;
};

function getEyebrow(video: FarmerVideo | VideoPlaybackItem): string | null {
  if ("eyebrow" in video && video.eyebrow) {
    return video.eyebrow;
  }

  return null;
}

function VideoCard({
  video,
  layout,
  showStage,
  onPlay,
}: {
  video: FarmerVideo | VideoPlaybackItem;
  layout: "grid" | "stack";
  showStage: boolean;
  onPlay: (video: FarmerVideo) => void;
}) {
  const eyebrow = getEyebrow(video);
  const stageLabel = showStage ? formatVideoStage(video.stage) : null;
  const topLabel = eyebrow ?? stageLabel;

  return (
    <button
      type="button"
      onClick={() => {
        if (video.videoUrl) {
          onPlay(video);
        }
      }}
      disabled={!video.videoUrl}
      className={
        layout === "grid"
          ? "surface-card flex h-full w-full cursor-pointer flex-col bg-white text-left transition-[border-color,box-shadow] duration-300 hover:border-forest/25 hover:shadow-[0_18px_40px_-22px_rgba(63,90,58,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
          : "flex w-full cursor-pointer gap-4 rounded-2xl border border-stone-200/80 bg-white p-3 text-left transition-colors hover:border-forest/25 disabled:cursor-not-allowed disabled:opacity-60 sm:items-center"
      }
    >
      <MediaPanel
        from={video.gradientFrom}
        to={video.gradientTo}
        label={video.title}
        imageUrl={video.imageUrl}
        className={
          layout === "grid"
            ? "min-h-48 shrink-0 rounded-b-none"
            : "aspect-video h-24 w-36 shrink-0 rounded-xl sm:h-28 sm:w-44"
        }
        overlay={
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[linear-gradient(180deg,rgba(47,42,36,0.04),rgba(47,42,36,0.18))]"
            aria-hidden
          >
            <PlayBadge />
          </div>
        }
      />
      <div
        className={
          layout === "grid"
            ? "flex flex-1 flex-col space-y-2 p-5 sm:p-6"
            : "min-w-0 flex-1 py-1"
        }
      >
        {topLabel ? (
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest">
            {topLabel}
          </p>
        ) : null}
        <span className="text-lg font-semibold text-stone-900 sm:text-xl">
          {video.title}
        </span>
        <p className="text-sm text-stone-500">{video.duration}</p>
        {layout === "grid" && video.description ? (
          <p className="line-clamp-3 text-sm leading-6 text-stone-600 sm:text-[0.95rem] sm:leading-7">
            {video.description}
          </p>
        ) : null}
      </div>
    </button>
  );
}

export function VideoPlaybackList({
  videos,
  layout = "stack",
  showStage = false,
  emptyMessage = "Все още няма видеа.",
  className = "",
  useStagger = true,
}: VideoPlaybackListProps) {
  const [activeVideo, setActiveVideo] = useState<FarmerVideo | null>(null);

  if (videos.length === 0) {
    return <p className="text-sm text-stone-500">{emptyMessage}</p>;
  }

  const gridClassName =
    layout === "grid"
      ? `content-after-head grid-cards md:grid-cols-2 xl:grid-cols-3 ${className}`.trim()
      : `flex flex-col gap-3 ${className}`.trim();

  const cards = videos.map((video) => (
    <VideoCard
      key={video.id}
      video={video}
      layout={layout}
      showStage={showStage}
      onPlay={setActiveVideo}
    />
  ));

  return (
    <>
      {layout === "grid" && useStagger ? (
        <RevealStagger className={gridClassName}>{cards}</RevealStagger>
      ) : (
        <div className={gridClassName}>{cards}</div>
      )}

      {activeVideo ? (
        <VideoPlayerModal
          video={toPlayback(activeVideo)}
          onClose={() => setActiveVideo(null)}
        />
      ) : null}
    </>
  );
}
