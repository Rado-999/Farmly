import type { Metadata } from "next";

import { LandingPage } from "@/components/landing/landing-page";
import {
  getFarmerStories,
  getFeaturedFarmers,
  getSeasonalProducts,
} from "@/lib/landing/queries";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Farmly | Тук храната помни ръцете, които я отглеждат",
  description:
    "Спокойна дигитална селска местност — усетете мъгла, почва и истински хора, преди да купувате.",
};

export default async function Home() {
  if (!getSupabasePublicEnv()) {
    return (
      <LandingPage
        featuredFarmers={[]}
        seasonalProducts={[]}
        farmerStories={[]}
      />
    );
  }

  const [featuredFarmersResult, seasonalProductsResult, farmerStoriesResult] =
    await Promise.all(
    [getFeaturedFarmers(), getSeasonalProducts(), getFarmerStories()],
  );

  if (!featuredFarmersResult.ok) {
    throw new Error(featuredFarmersResult.error.message);
  }

  if (!seasonalProductsResult.ok) {
    throw new Error(seasonalProductsResult.error.message);
  }

  if (!farmerStoriesResult.ok) {
    throw new Error(farmerStoriesResult.error.message);
  }

  const featuredFarmers = featuredFarmersResult.data;
  const seasonalProducts = seasonalProductsResult.data;
  const farmerStories = farmerStoriesResult.data;

  return (
    <LandingPage
      featuredFarmers={featuredFarmers}
      seasonalProducts={seasonalProducts}
      farmerStories={farmerStories}
    />
  );
}
