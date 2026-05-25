"use client";

import { useEffect } from "react";

/** Keeps header/hero viewport math aligned with the real layout (avoids gaps and micro-scroll). */
export function HeaderHeightSync() {
  useEffect(() => {
    const header = document.querySelector("header");
    if (!header) return;

    const sync = () => {
      const headerHeight = Math.round(header.getBoundingClientRect().height);
      document.documentElement.style.setProperty(
        "--site-header-height",
        `${headerHeight}px`,
      );
    };

    sync();

    const observer = new ResizeObserver(sync);
    observer.observe(header);
    window.addEventListener("resize", sync);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, []);

  return null;
}
