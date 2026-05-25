import { ScrollToHash } from "@/components/ui/scroll-to-hash";
import { CommunityTestimony } from "@/components/farmers/community-testimony";
import { FarmerPracticeStory } from "@/components/farmers/farmer-practice-story";
import { FarmerProfileOpening } from "@/components/farmers/farmer-profile-opening";
import { FeaturedFarmFilm } from "@/components/farmers/featured-farm-film";
import { FollowSection } from "@/components/farmers/follow-section";
import { ReturnBanner } from "@/components/farmers/return-banner";
import { SeasonChapter } from "@/components/farmers/season-chapter";
import { SeasonalOfferings } from "@/components/farmers/seasonal-offerings";
import { TrustRibbon } from "@/components/farmers/trust-ribbon";
import type { FarmerProfile } from "@/lib/farmers/types";

type FarmerProfileViewProps = {
  farmer: FarmerProfile;
};

export function FarmerProfileView({ farmer }: FarmerProfileViewProps) {
  return (
    <main className="flex-1 bg-loam-100">
      <ScrollToHash />
      <FarmerProfileOpening farmer={farmer} />
      <FeaturedFarmFilm videos={farmer.videos} />
      <TrustRibbon farmer={farmer} />
      <FarmerPracticeStory farmer={farmer} />
      <SeasonChapter farmer={farmer} />
      <CommunityTestimony reviews={farmer.reviews} />
      <FollowSection
        farmerProfileId={farmer.farmerProfileId}
        farmerName={farmer.name}
      />
      <SeasonalOfferings farmerSlug={farmer.id} products={farmer.products} />
      <ReturnBanner
        farmerSlug={farmer.id}
        farmerProfileId={farmer.farmerProfileId}
        farmerName={farmer.name}
        videoCount={farmer.videos.length}
      />
    </main>
  );
}
