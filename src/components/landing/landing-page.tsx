import { AtmosphereChapterSection } from "@/components/landing/atmosphere-chapter-section";
import { BelongingSection } from "@/components/landing/belonging-section";
import { CinematicHeroSection } from "@/components/landing/cinematic-hero-section";
import { FarmerStoriesSection } from "@/components/landing/farmer-stories-section";
import { FeaturedFarmersSection } from "@/components/landing/featured-farmers-section";
import { JourneySection } from "@/components/landing/journey-section";
import { SeasonalFoodSection } from "@/components/landing/seasonal-food-section";
import { atmosphereChapters } from "@/lib/landing/narrative";
import type {
  FarmerPreview,
  FarmerStory,
  SeasonalProduct,
} from "@/lib/landing/types";

type LandingPageProps = {
  featuredFarmers: FarmerPreview[];
  seasonalProducts: SeasonalProduct[];
  farmerStories: FarmerStory[];
};

export function LandingPage({
  featuredFarmers,
  seasonalProducts,
  farmerStories,
}: LandingPageProps) {
  const [morningFog, handsSoil, villageCalm] = atmosphereChapters;

  return (
    <main className="flex-1">
      {/* FEEL — atmosphere, no commerce */}
      <CinematicHeroSection />
      {morningFog ? <AtmosphereChapterSection chapter={morningFog} /> : null}
      {handsSoil ? <AtmosphereChapterSection chapter={handsSoil} /> : null}

      {/* TRUST — humans and proof */}
      <FarmerStoriesSection stories={farmerStories} />
      <FeaturedFarmersSection farmers={featuredFarmers} />
      {villageCalm ? <AtmosphereChapterSection chapter={villageCalm} /> : null}
      <JourneySection />

      {/* COMMERCE — last, quiet */}
      <SeasonalFoodSection products={seasonalProducts} />
      <BelongingSection />
    </main>
  );
}
