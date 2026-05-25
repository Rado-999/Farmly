"use client";

import { FollowButton } from "@/components/farmers/follow-button";
import { SaveFarmButton } from "@/components/farmers/save-farm-button";

type FarmerHeroActionsProps = {
  farmerProfileId: string;
  farmerName: string;
};

export function FarmerHeroActions({
  farmerProfileId,
  farmerName,
}: FarmerHeroActionsProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start">
      <FollowButton
        farmerProfileId={farmerProfileId}
        farmerName={farmerName}
        followLabel="Следи този сезон"
        followingLabel="Следиш този сезон"
      />
      <SaveFarmButton
        farmerProfileId={farmerProfileId}
        farmerName={farmerName}
      />
    </div>
  );
}
