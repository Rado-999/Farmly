"use client";

import { VideoPlaybackList } from "@/components/videos/video-playback-list";
import type { FarmerVideo } from "@/lib/farmers/types";

type ProductVideoListProps = {
  videos: FarmerVideo[];
};

export function ProductVideoList({ videos }: ProductVideoListProps) {
  return (
    <VideoPlaybackList
      videos={videos}
      layout="stack"
      emptyMessage="Все още няма свързани видеа с този продукт."
    />
  );
}
