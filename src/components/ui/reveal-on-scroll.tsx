"use client";

import { useInView } from "react-intersection-observer";
import type { ReactNode } from "react";

type RevealDirection = "up" | "left" | "right";

type RevealOnScrollProps = {
  children: ReactNode;
  className?: string;
  direction?: RevealDirection;
};

const directionClassNames: Record<RevealDirection, string> = {
  up: "reveal-from-up",
  left: "reveal-from-left",
  right: "reveal-from-right",
};

export function RevealOnScroll({
  children,
  className = "",
  direction = "up",
}: RevealOnScrollProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.05,
    rootMargin: "0px 0px -2% 0px",
  });

  return (
    <div
      ref={ref}
      className={`reveal-on-scroll reveal-item ${directionClassNames[direction]} ${inView ? "is-visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
