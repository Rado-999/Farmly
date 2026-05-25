"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function scrollToHashTarget(): boolean {
  const hash = window.location.hash.slice(1);

  if (!hash) {
    return false;
  }

  const target = document.getElementById(hash);

  if (!target) {
    return false;
  }

  target.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}

/** Scrolls to `window.location.hash` after client navigation (Next.js App Router). */
export function ScrollToHash() {
  const pathname = usePathname();

  useEffect(() => {
    if (!window.location.hash) {
      return;
    }

    let attempts = 0;
    let timeoutId: number | undefined;

    function tryScroll() {
      if (scrollToHashTarget() || attempts >= 12) {
        return;
      }

      attempts += 1;
      timeoutId = window.setTimeout(tryScroll, 80);
    }

    tryScroll();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [pathname]);

  useEffect(() => {
    function handleHashChange() {
      scrollToHashTarget();
    }

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return null;
}
