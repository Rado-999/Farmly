"use client";

import { useCallback, useEffect, useState } from "react";

import { useAuthSession } from "@/lib/auth/use-auth-session";
import {
  addGuestSavedFarmerId,
  deleteSavedFarm,
  insertSavedFarm,
  readGuestSavedFarmerIds,
  removeGuestSavedFarmerId,
} from "@/lib/marketplace/saved-farms";
import { isSelfFarmerFollow } from "@/lib/marketplace/follows";
import { createSupabaseClient } from "@/lib/supabase";

type SaveFarmButtonProps = {
  farmerProfileId: string;
  farmerName: string;
  className?: string;
};

export function SaveFarmButton({
  farmerProfileId,
  farmerName,
  className = "",
}: SaveFarmButtonProps) {
  const auth = useAuthSession();
  const [isSaved, setIsSaved] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isSelf, setIsSelf] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const loadState = useCallback(async () => {
    if (auth.status !== "authenticated") {
      setIsSaved(readGuestSavedFarmerIds().includes(farmerProfileId));
      setIsSelf(false);
      return;
    }

    const supabase = createSupabaseClient();
    if (!supabase) {
      return;
    }

    const self = await isSelfFarmerFollow(
      supabase,
      auth.user.id,
      farmerProfileId,
    );
    setIsSelf(self);

    if (self) {
      setIsSaved(false);
      return;
    }

    const { data } = await supabase
      .from("saved_farms")
      .select("farmer_id")
      .eq("user_id", auth.user.id)
      .eq("farmer_id", farmerProfileId)
      .maybeSingle();

    setIsSaved(Boolean(data));
  }, [auth, farmerProfileId]);

  useEffect(() => {
    void loadState();
  }, [loadState]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timer = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  async function handleToggle() {
    if (isSelf || isPending) {
      return;
    }

    if (auth.status !== "authenticated") {
      const next = !isSaved;
      if (next) {
        addGuestSavedFarmerId(farmerProfileId);
        setNotice("Фермата е запазена. Влез, за да я държиш в селото си.");
      } else {
        removeGuestSavedFarmerId(farmerProfileId);
      }
      setIsSaved(next);
      return;
    }

    const supabase = createSupabaseClient();
    if (!supabase) {
      return;
    }

    const next = !isSaved;
    setIsSaved(next);
    setIsPending(true);

    try {
      if (next) {
        const { error } = await insertSavedFarm(
          supabase,
          auth.user.id,
          farmerProfileId,
        );
        if (error) {
          setIsSaved(false);
        } else {
          setNotice("Фермата е в личния ти списък.");
        }
      } else {
        const { error } = await deleteSavedFarm(
          supabase,
          auth.user.id,
          farmerProfileId,
        );
        if (error) {
          setIsSaved(true);
        }
      }
    } finally {
      setIsPending(false);
    }
  }

  if (isSelf) {
    return null;
  }

  const label = isSaved ? "Запазена" : "Запази фермата";

  return (
    <div className={`flex flex-col items-start gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => void handleToggle()}
        disabled={isPending || auth.status === "loading"}
        aria-pressed={isSaved}
        aria-busy={isPending}
        aria-label={
          isSaved
            ? `Премахни ${farmerName} от запазени`
            : `Запази фермата на ${farmerName}`
        }
        className="inline-flex items-center justify-center rounded-full border border-stone-400/35 bg-white/80 px-4 py-2 text-sm font-medium text-soil transition-[background-color,border-color,color] duration-500 ease-[var(--ease-organic)] hover:border-forest/30 hover:bg-white hover:text-forest-deep disabled:opacity-60"
      >
        {label}
      </button>
      {notice ? (
        <p
          role="status"
          className="max-w-xs text-sm leading-relaxed text-stone-600"
        >
          {notice}
        </p>
      ) : null}
    </div>
  );
}
