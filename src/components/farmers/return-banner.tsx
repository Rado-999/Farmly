"use client";

import { useCallback, useEffect, useState } from "react";

import { useAuthSession } from "@/lib/auth/use-auth-session";
import {
  readFarmerVisitSnapshot,
  writeFarmerVisitSnapshot,
} from "@/lib/farmers/profile-helpers";
import { createSupabaseClient } from "@/lib/supabase";

type ReturnBannerProps = {
  farmerSlug: string;
  farmerProfileId: string;
  farmerName: string;
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
  const auth = useAuthSession();
  const [message, setMessage] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const evaluateReturn = useCallback(async () => {
    const prior = readFarmerVisitSnapshot(farmerSlug);
    const isReturnVisit = prior != null;
    const newFilms =
      prior != null && videoCount > prior.videoCount
        ? videoCount - prior.videoCount
        : 0;

    let isFollowing = false;
    if (auth.status === "authenticated") {
      const supabase = createSupabaseClient();
      if (supabase) {
        const { data } = await supabase
          .from("follows")
          .select("farmer_id")
          .eq("user_id", auth.user.id)
          .eq("farmer_id", farmerProfileId)
          .maybeSingle();
        isFollowing = Boolean(data);
      }
    }

    if (newFilms > 0) {
      const filmWord = newFilms === 1 ? "ново полско видео" : "нови полски видеа";
      setMessage(`От последното ти посещение: ${newFilms} ${filmWord}`);
      setVisible(true);
    } else if (isReturnVisit || isFollowing) {
      setMessage("Тази ферма се е променила, откакто беше тук");
      setVisible(true);
    } else {
      setVisible(false);
    }

    writeFarmerVisitSnapshot(farmerSlug, videoCount);
  }, [auth, farmerProfileId, farmerSlug, videoCount]);

  useEffect(() => {
    void evaluateReturn();
  }, [evaluateReturn]);

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
