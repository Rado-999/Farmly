"use client";

import { useMemo, useState } from "react";

import { MediaPanel } from "@/components/ui/media-panel";
import { PageSection } from "@/components/ui/page-section";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { VideoPlayerModal } from "@/components/videos/video-player-modal";
import { formatVideoStage } from "@/lib/data/formatters";
import {
  formatFieldFilmDate,
  getEpisodeStripVideos,
  getFeaturedVideo,
} from "@/lib/farmers/profile-helpers";
import type { FarmerVideo } from "@/lib/farmers/types";
import type { VideoPlaybackSource } from "@/lib/videos/playback-types";

type FeaturedFarmFilmProps = {
  videos: FarmerVideo[];
};

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

function PlayControl() {
  return (
    <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-loam-50/95 text-moss-800 shadow-[0_20px_48px_-18px_rgba(31,48,34,0.45)] ring-1 ring-loam-200/80 sm:h-[4.5rem] sm:w-[4.5rem]">
      <span aria-hidden className="ml-1 text-sm">
        ▶
      </span>
      <span className="sr-only">Пусни полското видео</span>
    </span>
  );
}

function HeroFilm({
  video,
  onPlay,
}: {
  video: FarmerVideo;
  onPlay: () => void;
}) {
  const stageLabel = formatVideoStage(video.stage);
  const dateLabel = formatFieldFilmDate(video.publishedAt);

  return (
    <button
      type="button"
      onClick={onPlay}
      disabled={!video.videoUrl}
      className="group relative w-full cursor-pointer overflow-hidden rounded-sm text-left disabled:cursor-not-allowed disabled:opacity-70"
    >
      <div className="relative aspect-[2.35/1] w-full max-h-[min(52vh,28rem)] sm:aspect-[21/9]">
        <MediaPanel
          from={video.gradientFrom}
          to={video.gradientTo}
          label={video.title}
          imageUrl={video.imageUrl}
          className="absolute inset-0 h-full w-full rounded-sm"
          overlay={
            <div
              className="pointer-events-none absolute inset-0 flex flex-col justify-between bg-[linear-gradient(180deg,rgba(20,28,22,0.08)_0%,rgba(20,28,22,0.55)_100%)] p-5 sm:p-8"
              aria-hidden
            >
              <div className="flex flex-wrap items-center gap-3 text-[0.6875rem] font-medium tracking-[0.16em] text-loam-100/90 uppercase">
                <span>{stageLabel}</span>
                {dateLabel ? <span>{dateLabel}</span> : null}
                <span>{video.duration}</span>
              </div>
              <div className="flex items-end justify-between gap-4">
                <div className="max-w-xl">
                  <p className="editorial-serif text-2xl leading-tight text-loam-50 sm:text-3xl lg:text-4xl">
                    {video.title}
                  </p>
                  {video.description ? (
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-loam-100/85 sm:text-base sm:leading-7">
                      {video.description}
                    </p>
                  ) : null}
                </div>
                <PlayControl />
              </div>
            </div>
          }
        />
      </div>
    </button>
  );
}

function EpisodeStripItem({
  video,
  onPlay,
}: {
  video: FarmerVideo;
  onPlay: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPlay}
      disabled={!video.videoUrl}
      className="flex min-w-[11.5rem] shrink-0 cursor-pointer flex-col gap-2 text-left disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[13rem]"
    >
      <MediaPanel
        from={video.gradientFrom}
        to={video.gradientTo}
        label={video.title}
        imageUrl={video.imageUrl}
        className="aspect-video w-full rounded-sm"
        overlay={
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center bg-stone-900/10"
            aria-hidden
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-loam-50/90 text-moss-800 text-[0.65rem] shadow-md">
              ▶
            </span>
          </div>
        }
      />
      <div>
        <p className="text-[0.6875rem] font-medium tracking-[0.14em] text-moss-700 uppercase">
          {formatVideoStage(video.stage)}
        </p>
        <p className="mt-0.5 line-clamp-2 text-sm font-medium text-moss-900">
          {video.title}
        </p>
      </div>
    </button>
  );
}

export function FeaturedFarmFilm({ videos }: FeaturedFarmFilmProps) {
  const [activeVideo, setActiveVideo] = useState<FarmerVideo | null>(null);
  const featured = useMemo(() => getFeaturedVideo(videos), [videos]);
  const strip = useMemo(() => getEpisodeStripVideos(videos), [videos]);

  return (
    <PageSection id="featured-film" tone="parchment" spacing="default">
      <div className="page-shell-wide">
        <RevealOnScroll>
          <p className="text-[0.8125rem] font-medium tracking-[0.14em] text-clay uppercase">
            Полско кино
          </p>
          <h2 className="editorial-serif mt-3 max-w-2xl text-3xl leading-tight text-moss-900 sm:text-4xl">
            Виж как се развива сезонът
          </h2>
        </RevealOnScroll>

        <div className="content-after-head">
          {!featured ? (
            <RevealOnScroll>
              <p className="max-w-xl text-base leading-8 text-soil/80">
                Първото полско видео ще дойде с жътвата. Дотогава — тишина,
                почва и подготовка.
              </p>
            </RevealOnScroll>
          ) : (
            <>
              <RevealOnScroll>
                <HeroFilm
                  video={featured}
                  onPlay={() => setActiveVideo(featured)}
                />
              </RevealOnScroll>

              {strip.length > 0 ? (
                <RevealOnScroll className="mt-8 sm:mt-10">
                  <p className="mb-4 text-sm text-soil/75">
                    Още епизоди от полето
                  </p>
                  <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 [scrollbar-width:thin]">
                    {strip.map((video) => (
                      <EpisodeStripItem
                        key={video.id}
                        video={video}
                        onPlay={() => setActiveVideo(video)}
                      />
                    ))}
                  </div>
                </RevealOnScroll>
              ) : null}
            </>
          )}
        </div>
      </div>

      <VideoPlayerModal
        video={activeVideo ? toPlayback(activeVideo) : null}
        onClose={() => setActiveVideo(null)}
      />
    </PageSection>
  );
}
