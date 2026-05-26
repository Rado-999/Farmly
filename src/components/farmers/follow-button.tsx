"use client";

import { useCallback, useEffect, useState } from "react";

import { useFarmerRelationship } from "@/components/farmers/farmer-relationship-provider";
import { useAuthSession } from "@/lib/auth/use-auth-session";
import {
  deleteFollow,
  insertFollow,
  isSelfFarmerFollow,
  type FollowedVia,
} from "@/lib/marketplace/follows";
import { loadSupabaseClient } from "@/lib/supabase/load-client";

type FollowButtonProps = {
  farmerProfileId: string;
  farmerName: string;
  /** Compact chip for cards; default pill for profile hero */
  size?: "default" | "compact" | "prominent";
  className?: string;
  followLabel?: string;
  followingLabel?: string;
  followedVia?: FollowedVia;
};

export function FollowButton({
  farmerProfileId,
  farmerName,
  size = "default",
  className = "",
  followLabel = "Следи този сезон",
  followingLabel = "Следиш този сезон",
  followedVia = "profile",
}: FollowButtonProps) {
  const auth = useAuthSession();
  const sharedRelationship = useFarmerRelationship(farmerProfileId);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isSelf, setIsSelf] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const loadFollowState = useCallback(async () => {
    if (auth.status !== "authenticated") {
      setIsFollowing(false);
      setIsSelf(false);
      return;
    }

    const supabase = await loadSupabaseClient();
    if (!supabase) {
      return;
    }

    const self = await isSelfFarmerFollow(
      supabase,
      auth.user.id,
      farmerProfileId,
    );
    if (!self.ok) {
      setIsSelf(false);
      return;
    }

    setIsSelf(self.data);

    if (self.data) {
      setIsFollowing(false);
      return;
    }

    const { data } = await supabase
      .from("follows")
      .select("farmer_id")
      .eq("user_id", auth.user.id)
      .eq("farmer_id", farmerProfileId)
      .maybeSingle();

    setIsFollowing(Boolean(data));
  }, [auth, farmerProfileId]);

  useEffect(() => {
    if (sharedRelationship) {
      return;
    }

    void loadFollowState();
  }, [loadFollowState, sharedRelationship]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timer = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  async function handleToggle() {
    if (auth.status !== "authenticated") {
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    const currentIsFollowing = sharedRelationship?.isFollowing ?? isFollowing;
    const currentIsSelf = sharedRelationship?.isSelf ?? isSelf;

    if (currentIsSelf || isPending) {
      return;
    }

    const supabase = await loadSupabaseClient();
    if (!supabase) {
      return;
    }

    const nextFollowing = !currentIsFollowing;
    if (sharedRelationship) {
      sharedRelationship.setIsFollowing(nextFollowing);
    } else {
      setIsFollowing(nextFollowing);
    }
    setIsPending(true);

    try {
      if (nextFollowing) {
        const { error } = await insertFollow(
          supabase,
          auth.user.id,
          farmerProfileId,
          { followedVia },
        );
        if (error) {
          if (sharedRelationship) {
            sharedRelationship.setIsFollowing(false);
          } else {
            setIsFollowing(false);
          }
        } else {
          setNotice("Ще те посрещнем в Моето село, когато има нещо от полето.");
        }
      } else {
        const { error } = await deleteFollow(
          supabase,
          auth.user.id,
          farmerProfileId,
        );
        if (error) {
          if (sharedRelationship) {
            sharedRelationship.setIsFollowing(true);
          } else {
            setIsFollowing(true);
          }
        }
      }
    } finally {
      setIsPending(false);
    }
  }

  const resolvedIsFollowing = sharedRelationship?.isFollowing ?? isFollowing;
  const resolvedIsSelf = sharedRelationship?.isSelf ?? isSelf;

  if (resolvedIsSelf) {
    return null;
  }

  const label = resolvedIsFollowing ? followingLabel : followLabel;

  const sizeClassName =
    size === "compact"
      ? "px-3 py-1.5 text-xs"
      : size === "prominent"
        ? "px-7 py-3.5 text-base"
        : "px-4 py-2 text-sm";

  return (
    <div className={`flex flex-col items-start gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => void handleToggle()}
        disabled={isPending || auth.status === "loading"}
        aria-pressed={resolvedIsFollowing}
        aria-busy={isPending}
        aria-label={
          resolvedIsFollowing
            ? `Спри да следваш фермата на ${farmerName}`
            : `Следи сезона на ${farmerName}`
        }
        className={`inline-flex items-center justify-center rounded-full border font-medium transition-[background-color,border-color,color,box-shadow] duration-500 ease-[var(--ease-organic)] disabled:opacity-60 ${sizeClassName} ${
          resolvedIsFollowing
            ? size === "prominent"
              ? "border-moss-700/40 bg-moss-700/12 text-moss-900 shadow-[0_12px_32px_-18px_rgba(31,48,34,0.35)]"
              : "border-forest/25 bg-forest/10 text-forest-deep"
            : size === "prominent"
              ? "border-moss-700/25 bg-moss-700 text-loam-50 shadow-[0_18px_40px_-16px_rgba(31,48,34,0.45)] hover:bg-moss-900"
              : "border-forest/20 bg-forest px-4 py-2 text-sm font-medium text-mist shadow-[0_14px_30px_-18px_rgba(63,90,58,0.35)] hover:bg-[#324a2f]"
        }`}
      >
        {label}
      </button>
      {notice ? (
        <p
          role="status"
          className="max-w-sm text-sm leading-relaxed text-stone-600"
        >
          {notice}
        </p>
      ) : null}
    </div>
  );
}
