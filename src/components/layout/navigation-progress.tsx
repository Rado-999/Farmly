"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function isModifiedClick(event: MouseEvent) {
  return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey;
}

function shouldStartNavigation(anchor: HTMLAnchorElement, pathname: string) {
  const href = anchor.getAttribute("href");

  if (!href || href.startsWith("#")) {
    return false;
  }

  if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
    return false;
  }

  try {
    const url = new URL(href, window.location.href);

    if (url.origin !== window.location.origin) {
      return false;
    }

    const nextRoute = `${url.pathname}${url.search}`;

    return nextRoute !== pathname;
  } catch {
    return false;
  }
}

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const [progress, setProgress] = useState(0);
  const pathnameRef = useRef(routeKey);
  const isFirstRouteRender = useRef(true);
  const trickleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTrickle = () => {
    if (trickleTimerRef.current) {
      clearInterval(trickleTimerRef.current);
      trickleTimerRef.current = null;
    }
  };

  const clearComplete = () => {
    if (completeTimerRef.current) {
      clearTimeout(completeTimerRef.current);
      completeTimerRef.current = null;
    }
  };

  const startNavigation = useCallback(() => {
    clearComplete();
    clearTrickle();
    setProgress(14);

    trickleTimerRef.current = setInterval(() => {
      setProgress((current) => {
        if (current >= 88) {
          return current;
        }

        return current + Math.max(1, (88 - current) * 0.12);
      });
    }, 160);
  }, []);

  const finishNavigation = useCallback(() => {
    clearTrickle();
    setProgress(100);

    completeTimerRef.current = setTimeout(() => {
      setProgress(0);
    }, 220);
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || isModifiedClick(event)) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest("a");

      if (!anchor || !shouldStartNavigation(anchor, pathnameRef.current)) {
        return;
      }

      startNavigation();
    };

    document.addEventListener("click", onClick, true);

    return () => {
      document.removeEventListener("click", onClick, true);
    };
  }, [startNavigation]);

  useEffect(() => {
    pathnameRef.current = routeKey;

    if (isFirstRouteRender.current) {
      isFirstRouteRender.current = false;
      return;
    }

    finishNavigation();

    return () => {
      clearTrickle();
      clearComplete();
    };
  }, [routeKey, finishNavigation]);

  if (progress <= 0) {
    return null;
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[2px] overflow-hidden"
    >
      <div
        className="h-full origin-left bg-forest shadow-[0_0_12px_rgba(63,90,58,0.45)] transition-[width] duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
