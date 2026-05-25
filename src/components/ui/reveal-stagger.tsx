"use client";

import { Children, isValidElement, type ReactNode } from "react";
import { useInView } from "react-intersection-observer";

type RevealStaggerProps = {
  children: ReactNode;
  className?: string;
};

const directionClasses = ["reveal-from-up", "reveal-from-left", "reveal-from-right"];

export function RevealStagger({ children, className = "" }: RevealStaggerProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.04,
    rootMargin: "0px 0px -2% 0px",
  });

  const items = Children.toArray(children).filter(isValidElement);

  return (
    <div
      ref={ref}
      className={`reveal-stagger ${inView ? "is-visible" : ""} ${className}`}
    >
      {items.map((child, index) => (
        <div
          key={child.key ?? index}
          className={`reveal-item h-full min-h-0 ${directionClasses[index % directionClasses.length]}`}
          style={{ transitionDelay: `${index * 50}ms` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
