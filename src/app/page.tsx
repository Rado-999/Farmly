import type { Metadata } from "next";

import { LandingPage } from "@/components/landing/landing-page";
import { getServerLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";
import {
  getFarmerStories,
  getFeaturedFarmers,
  getSeasonalProducts,
} from "@/lib/landing/queries";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();

  return {
    title: translate(
      locale,
      "Farmly | Тук храната помни ръцете, които я отглеждат",
      "Farmly | Food remembers the hands that grow it",
    ),
    description: translate(
      locale,
      "Спокойна дигитална селска местност — усетете мъгла, почва и истински хора, преди да купувате.",
      "A calm digital countryside where you can feel fog, soil, and real people before you buy.",
    ),
  };
}

export default async function Home() {
  const locale = await getServerLocale();

  if (!getSupabasePublicEnv()) {
    return (
      <LandingPage
        locale={locale}
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
      locale={locale}
      featuredFarmers={featuredFarmers}
      seasonalProducts={seasonalProducts}
      farmerStories={farmerStories}
    />
  );
}
