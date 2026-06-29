import { FarmerRelationshipProvider } from "@/components/farmers/farmer-relationship-provider";
import { ScrollToHash } from "@/components/ui/scroll-to-hash";
import { CommunityTestimony } from "@/components/farmers/community-testimony";
import { FarmerPracticeStory } from "@/components/farmers/farmer-practice-story";
import { FarmerProfileOpening } from "@/components/farmers/farmer-profile-opening";
import { FeaturedFarmFilm } from "@/components/farmers/featured-farm-film";
import { FollowSection } from "@/components/farmers/follow-section";
import { SeasonChapter } from "@/components/farmers/season-chapter";
import { SeasonalOfferings } from "@/components/farmers/seasonal-offerings";
import type {
  FarmerProfile,
  FarmerViewerRelationship,
} from "@/lib/farmers/types";

type FarmerProfileViewProps = {
  farmer: FarmerProfile;
  viewerRelationship: FarmerViewerRelationship;
};

export function FarmerProfileView({
  farmer,
  viewerRelationship,
}: FarmerProfileViewProps) {
  return (
    <FarmerRelationshipProvider initialRelationship={viewerRelationship}>
      <main className="flex-1 bg-loam-100">
        <ScrollToHash />
        <FarmerProfileOpening farmer={farmer} />
        <FarmerPracticeStory farmer={farmer} />
        <SeasonChapter farmer={farmer} />
        <FeaturedFarmFilm videos={farmer.videos} />
        <CommunityTestimony reviews={farmer.reviews} />
        <FollowSection
          farmerProfileId={farmer.farmerProfileId}
          farmerName={farmer.name}
        />
        <SeasonalOfferings farmerSlug={farmer.id} products={farmer.products} />
      </main>
    </FarmerRelationshipProvider>
  );
}
