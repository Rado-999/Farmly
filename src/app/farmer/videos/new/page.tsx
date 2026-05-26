import type { Metadata } from "next";

import { FarmerProductBlocked } from "@/components/products/farmer-product-blocked";
import { NewVideoForm } from "@/components/videos/new-video-page";
import { requireServerFarmerProductAccess } from "@/lib/auth/server";
import { getServerLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();

  return {
    title: translate(locale, "Качи видео | Farmly", "Upload video | Farmly"),
    description: translate(
      locale,
      "Качете полско видео към вашия фермерски профил.",
      "Upload a field video to your farmer profile.",
    ),
  };
}

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
