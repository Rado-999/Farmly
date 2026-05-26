import { AtmosphereChapterSection } from "@/components/landing/atmosphere-chapter-section";
import { BelongingSection } from "@/components/landing/belonging-section";
import { CinematicHeroSection } from "@/components/landing/cinematic-hero-section";
import { FarmerStoriesSection } from "@/components/landing/farmer-stories-section";
import { FeaturedFarmersSection } from "@/components/landing/featured-farmers-section";
import { JourneySection } from "@/components/landing/journey-section";
import { SeasonalFoodSection } from "@/components/landing/seasonal-food-section";
import type { Locale } from "@/lib/i18n/config";
import { getAtmosphereChapters } from "@/lib/landing/narrative";
import type {
  FarmerPreview,
  FarmerStory,
  SeasonalProduct,
} from "@/lib/landing/types";

type LandingPageProps = {
  locale: Locale;
  featuredFarmers: FarmerPreview[];
  seasonalProducts: SeasonalProduct[];
  farmerStories: FarmerStory[];
};

export function LandingPage({
  locale,
  featuredFarmers,
  seasonalProducts,
  farmerStories,
}: LandingPageProps) {
  const [morningFog, handsSoil, villageCalm] = getAtmosphereChapters(locale);

  return (
    <main className="flex-1">
      {/* FEEL — atmosphere, no commerce */}
      <CinematicHeroSection locale={locale} />
      {morningFog ? <AtmosphereChapterSection chapter={morningFog} /> : null}
      {handsSoil ? <AtmosphereChapterSection chapter={handsSoil} /> : null}

      {/* TRUST — humans and proof */}
      <FarmerStoriesSection stories={farmerStories} />
      <FeaturedFarmersSection farmers={featuredFarmers} locale={locale} />
      {villageCalm ? <AtmosphereChapterSection chapter={villageCalm} /> : null}
      <JourneySection locale={locale} />

      {/* COMMERCE — last, quiet */}
      <SeasonalFoodSection products={seasonalProducts} locale={locale} />
      <BelongingSection locale={locale} />
    </main>
  );
}
