"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { VideoPlaybackSource } from "@/lib/videos/playback-types";

type VideoPlayerModalProps = {
  video: VideoPlaybackSource | null;
  onClose: () => void;
};

export function VideoPlayerModal({ video, onClose }: VideoPlayerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }

    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!video) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const frame = requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [video, handleClose]);

  if (!mounted || !video?.videoUrl) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Затвори"
        className="absolute inset-0 cursor-pointer bg-stone-900/70"
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={video.title}
        className="relative w-full max-w-3xl overflow-hidden rounded-[1.25rem] border border-stone-200/80 bg-stone-950 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={handleClose}
          className="absolute right-3 top-3 z-20 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-stone-900/90 text-lg text-mist shadow-md transition-colors hover:bg-stone-800"
          aria-label="Затвори видеото"
        >
          <span aria-hidden>×</span>
        </button>

        <div className="relative aspect-video w-full bg-black">
          <video
            ref={videoRef}
            key={video.id}
            src={video.videoUrl}
            controls
            playsInline
            preload="metadata"
            controlsList="nodownload noplaybackrate"
            disablePictureInPicture
            poster={video.imageUrl ?? undefined}
            className="h-full w-full object-contain"
          />
        </div>

        <div className="border-t border-stone-700/50 bg-stone-900 px-5 py-4 sm:px-6 sm:py-5">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-sage">
            {video.duration}
          </p>
          <h2 className="mt-1 pr-10 text-lg font-semibold text-mist sm:text-xl">
            {video.title}
          </h2>
          {video.description ? (
            <p className="mt-2 text-sm leading-6 text-mist/80">{video.description}</p>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
