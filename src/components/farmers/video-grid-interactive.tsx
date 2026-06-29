"use client";

import { VideoPlaybackList } from "@/components/videos/video-playback-list";
import type { FarmerVideo } from "@/lib/farmers/types";

type VideoGridInteractiveProps = {
  videos: FarmerVideo[];
};

export function VideoGridInteractive({ videos }: VideoGridInteractiveProps) {
  return (
    <VideoPlaybackList
      videos={videos}
      layout="grid"
      showStage
      emptyMessage="Все още няма видео."
    />
  );
}
