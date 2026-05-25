import type { Metadata } from "next";

import { LandingPage } from "@/components/landing/landing-page";
import {
  getFarmerStories,
  getFeaturedFarmers,
  getSeasonalProducts,
} from "@/lib/landing/queries";

export const metadata: Metadata = {
  title: "Farmly | Тук храната помни ръцете, които я отглеждат",
  description:
    "Спокойна дигитална селска местност — усетете мъгла, почва и истински хора, преди да купувате.",
};

export default async function Home() {
  const [featuredFarmers, seasonalProducts, farmerStories] = await Promise.all(
    [getFeaturedFarmers(), getSeasonalProducts(), getFarmerStories()],
  );

  return (
    <LandingPage
      featuredFarmers={featuredFarmers}
      seasonalProducts={seasonalProducts}
      farmerStories={farmerStories}
    />
  );
}
