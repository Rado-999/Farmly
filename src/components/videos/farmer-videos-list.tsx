"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { DeleteVideoModal } from "@/components/videos/delete-video-modal";
import { formatVideoStage } from "@/lib/data/formatters";
import { createSupabaseClient } from "@/lib/supabase";
import { deleteFarmerVideo } from "@/lib/videos/delete-video";
import { listFarmerVideosForManagement } from "@/lib/videos/queries";
import type { FarmerVideoListItem } from "@/lib/videos/types";

type FarmerVideosListProps = {
  farmerProfileId: string;
  farmerSlug: string;
};

export function FarmerVideosList({
  farmerProfileId,
  farmerSlug,
}: FarmerVideosListProps) {
  const [videos, setVideos] = useState<FarmerVideoListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<FarmerVideoListItem | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadVideos = useCallback(async () => {
    const supabase = createSupabaseClient();

    if (!supabase) {
      setVideos([]);
      setIsLoading(false);
      return;
    }

    try {
      const items = await listFarmerVideosForManagement(
        supabase,
        farmerProfileId,
      );
      setVideos(items);
      setError(null);
    } catch {
      setVideos([]);
      setError("Не успяхме да заредим видеата.");
    } finally {
      setIsLoading(false);
    }
  }, [farmerProfileId]);

  useEffect(() => {
    void loadVideos();
  }, [loadVideos]);

  async function handleConfirmDelete() {
    if (!deleteTarget) {
      return;
    }

    const supabase = createSupabaseClient();

    if (!supabase) {
      setError("Няма връзка със сървъра.");
      return;
    }

    setIsDeleting(true);

    const result = await deleteFarmerVideo(
      supabase,
      farmerProfileId,
      deleteTarget.id,
    );

    setIsDeleting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setDeleteTarget(null);
    await loadVideos();
  }

  if (isLoading) {
    return <p className="text-sm text-stone-500">Зареждане на видеа...</p>;
  }

  if (videos.length === 0) {
    return (
      <p className="text-sm text-stone-600">
        Все още нямате качени видеа. Качете първото си полско видео.
      </p>
    );
  }

  return (
    <>
      <ul className="space-y-3">
        {videos.map((video) => (
          <li
            key={video.id}
            className="flex flex-col gap-4 rounded-2xl border border-stone-200/80 bg-white/90 p-4 sm:flex-row sm:items-center"
          >
            <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-xl bg-stone-100">
              {video.posterUrl ? (
                <Image
                  src={video.posterUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-stone-400">
                  Видео
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-stone-900">{video.title}</p>
              <p className="mt-1 text-sm text-stone-500">
                {formatVideoStage(video.stage)} · {video.durationLabel}
              </p>
              {video.productTitle ? (
                <p className="mt-1 text-xs text-stone-500">
                  Продукт: {video.productTitle}
                </p>
              ) : (
                <p className="mt-1 text-xs text-stone-500">За цялата ферма</p>
              )}
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Link
                href={`/farmers/${farmerSlug}#videos`}
                className="inline-flex rounded-full border border-forest/25 px-3 py-1.5 text-sm font-medium text-forest transition-colors hover:bg-forest/5"
              >
                Виж публично
              </Link>
              <button
                type="button"
                onClick={() => setDeleteTarget(video)}
                className="inline-flex cursor-pointer rounded-full border border-red-200 px-3 py-1.5 text-sm font-medium text-red-800 transition-colors hover:bg-red-50"
              >
                Изтрий
              </button>
            </div>
          </li>
        ))}
      </ul>

      {error ? (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <DeleteVideoModal
        isOpen={Boolean(deleteTarget)}
        videoTitle={deleteTarget?.title ?? ""}
        isDeleting={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
