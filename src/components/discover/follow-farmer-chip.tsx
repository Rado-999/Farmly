"use client";

import { FollowButton } from "@/components/farmers/follow-button";

type FollowFarmerChipProps = {
  farmerId: string;
  farmerName: string;
  className?: string;
};

/** Compact village control for discover cards — wraps {@link FollowButton}. */
export function FollowFarmerChip({
  farmerId,
  farmerName,
  className = "",
}: FollowFarmerChipProps) {
  return (
    <FollowButton
      farmerProfileId={farmerId}
      farmerName={farmerName}
      size="compact"
      className={className}
    />
  );
}
