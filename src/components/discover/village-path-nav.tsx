"use client";

import { useEffect, useMemo, useState } from "react";

import { useLocale } from "@/components/i18n/language-provider";
import { translate } from "@/lib/i18n/translate";

export function VillagePathNav() {
  const { locale } = useLocale();
  const pathStops = useMemo(
    () =>
      [
        { id: "village-ring", label: translate(locale, "Срещи", "Encounters") },
        { id: "village-path", label: translate(locale, "Пътека", "Path") },
        {
          id: "neighbourhoods",
          label: translate(locale, "Ферми", "Farms"),
        },
      ] as const,
    [locale],
  );
  const [activeId, setActiveId] = useState<string>(pathStops[0].id);

  useEffect(() => {
    const sections = pathStops
      .map((stop) => document.getElementById(stop.id))
      .filter((element): element is HTMLElement => element != null);

    if (sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveId(visible.target.id);
        }
      },
      { rootMargin: "-40% 0px -45% 0px", threshold: [0, 0.25, 0.5] },
    );

    for (const section of sections) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, [pathStops]);

  return (
    <nav
      aria-label={translate(locale, "Път из селото", "Path through the village")}
      className="sticky top-[var(--site-header-height)] z-20 border-b border-stone-400/25 bg-cream/85 backdrop-blur-md"
    >
      <div className="page-shell-wide flex gap-1 overflow-x-auto py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {pathStops.map((stop) => {
          const isActive = activeId === stop.id;

          return (
            <a
              key={stop.id}
              href={`#${stop.id}`}
              className={`shrink-0 rounded-full px-4 py-2 text-sm transition-colors duration-500 ease-[var(--ease-organic)] ${
                isActive
                  ? "bg-forest text-mist"
                  : "text-soil hover:bg-white/60 hover:text-forest-deep"
              }`}
            >
              {stop.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
