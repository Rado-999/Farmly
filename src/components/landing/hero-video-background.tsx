"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { landingHeroVideo, landingImages } from "@/lib/landing/visuals";

type HeroVideoBackgroundProps = {
  className?: string;
};

export function HeroVideoBackground({ className = "" }: HeroVideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [useVideo, setUseVideo] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) return;

    const handleCanPlay = () => {
      setUseVideo(true);
      void video.play().catch(() => setUseVideo(false));
    };
    const handleError = () => setUseVideo(false);

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);
    video.load();

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
    };
  }, []);

  const posterVisible = !useVideo;

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Single animated layer — avoids double-image shimmer on large screens */}
      <div
        aria-hidden
        className={`hero-media-drift absolute inset-0 ${posterVisible ? "opacity-100" : "opacity-0"} transition-opacity duration-[2500ms]`}
      >
        <Image
          src={landingImages.heroPoster.src}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      <video
        ref={videoRef}
        aria-hidden
        muted
        loop
        playsInline
        preload="metadata"
        poster={landingHeroVideo.poster}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[2500ms] ${useVideo ? "opacity-100" : "opacity-0"}`}
      >
        <source src={landingHeroVideo.src} type="video/mp4" />
      </video>

      {/* Static warm lift — no pulsing overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_20%,rgba(228,192,120,0.1)_0%,transparent_55%)]"
      />
    </div>
  );
}
