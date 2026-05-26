"use client";

import { useEffect, useRef, useState } from "react";

import { useFarmerRelationship } from "@/components/farmers/farmer-relationship-provider";
import {
  readFarmerVisitSnapshot,
  writeFarmerVisitSnapshot,
} from "@/lib/farmers/profile-helpers";

type ReturnBannerProps = {
  farmerSlug: string;
  farmerProfileId: string;
  videoCount: number;
};

function scrollToFeaturedFilm() {
  document.getElementById("featured-film")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export function ReturnBanner({
  farmerSlug,
  farmerProfileId,
  videoCount,
}: ReturnBannerProps) {
  const relationship = useFarmerRelationship(farmerProfileId);
  const initialIsFollowingRef = useRef(relationship?.isFollowing ?? false);
  const [message, setMessage] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const prior = readFarmerVisitSnapshot(farmerSlug);
    const isReturnVisit = prior != null;
    const newFilms =
      prior != null && videoCount > prior.videoCount
        ? videoCount - prior.videoCount
        : 0;

    if (newFilms > 0) {
      const filmWord = newFilms === 1 ? "ново полско видео" : "нови полски видеа";
      setMessage(`От последното ти посещение: ${newFilms} ${filmWord}`);
      setVisible(true);
    } else if (isReturnVisit || initialIsFollowingRef.current) {
      setMessage("Тази ферма се е променила, откакто беше тук");
      setVisible(true);
    } else {
      setVisible(false);
    }

    writeFarmerVisitSnapshot(farmerSlug, videoCount);
  }, [farmerSlug, videoCount]);

  if (!visible || !message) {
    return null;
  }

  return (
    <section
      className="border-t border-loam-300/50 bg-gradient-depth"
      aria-label="Добре дошли отново"
    >
      <div className="page-shell flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:py-10">
        <div>
          <p className="text-[0.8125rem] font-medium tracking-[0.14em] text-wheat/80 uppercase">
            Добре дошли отново
          </p>
          <p className="editorial-serif mt-2 text-xl text-loam-50 sm:text-2xl">
            {message}
          </p>
        </div>
        <button
          type="button"
          onClick={scrollToFeaturedFilm}
          className="story-link story-link-on-dark shrink-0 cursor-pointer text-left"
        >
          Продължи да гледаш
        </button>
      </div>
    </section>
  );
}
