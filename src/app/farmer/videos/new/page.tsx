import type { Metadata } from "next";

import { FarmerProductBlocked } from "@/components/products/farmer-product-blocked";
import { NewVideoForm } from "@/components/videos/new-video-page";
import { requireServerFarmerProductAccess } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Качи видео | Farmly",
  description: "Качете полско видео към вашия фермерски профил.",
};

export default async function NewVideoRoute() {
  const result = await requireServerFarmerProductAccess("/farmer/videos/new");

  if (result.kind === "blocked") {
    return (
      <FarmerProductBlocked
        reason={result.reason}
        href={result.href}
        label={result.label}
      />
    );
  }

  return <NewVideoForm access={result.access} />;
}
