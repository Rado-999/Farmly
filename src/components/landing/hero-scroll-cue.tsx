"use client";

import { useCallback, useEffect, useState } from "react";

const SCROLL_TARGET_ID = "morning-fog";

export function HeroScrollCue() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const hero = document.querySelector("[data-landing-hero]");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting && entry.intersectionRatio > 0.35);
      },
      { threshold: [0, 0.35, 0.6] },
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  const scrollToContent = useCallback(() => {
    const target = document.getElementById(SCROLL_TARGET_ID);
    if (!target) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const headerHeight = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--site-header-height",
      ),
    );
    const offset = Number.isFinite(headerHeight) ? headerHeight : 80;
    const top =
      target.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({
      top,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToContent}
      aria-label="Превъртете до следващата секция"
      className="absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 cursor-pointer flex-col items-center gap-1.5 text-mist/45 transition-colors duration-300 hover:text-mist/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mist/60 sm:flex"
    >
      <span className="text-[0.625rem] tracking-[0.22em] uppercase">Надолу</span>
      <span
        aria-hidden
        className="h-8 w-px bg-gradient-to-b from-mist/55 to-forest-deep/80"
      />
    </button>
  );
}
