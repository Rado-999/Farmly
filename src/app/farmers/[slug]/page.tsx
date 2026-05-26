import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FarmerProfileView } from "@/components/farmers/farmer-profile-view";
import { getOptionalServerViewerContext } from "@/lib/auth/server";
import {
  getFarmerProfile,
  getFarmerSlugs,
  getFarmerViewerRelationship,
} from "@/lib/farmers/queries";

export const revalidate = 60;

type FarmerPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const result = await getFarmerSlugs();

  if (!result.ok) {
    return [];
  }

  return result.data.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: FarmerPageProps): Promise<Metadata> {
  const { slug } = await params;
  const farmerResult = await getFarmerProfile(slug);

  if (!farmerResult.ok) {
    if (farmerResult.error.code === "query.not_found") {
      return {
        title: "Farmer not found | Farmly",
      };
    }

    throw new Error(farmerResult.error.message);
  }

  const farmer = farmerResult.data;

  if (!farmer) {
    return {
      title: "Farmer not found | Farmly",
    };
  }

  return {
    title: `${farmer.name} | Farmly`,
    description: farmer.bio,
  };
}

export default async function FarmerPage({ params }: FarmerPageProps) {
  const { slug } = await params;
  const farmerResult = await getFarmerProfile(slug);

  if (!farmerResult.ok) {
    if (farmerResult.error.code === "query.not_found") {
      notFound();
    }

    throw new Error(farmerResult.error.message);
  }

  const farmer = farmerResult.data;

  if (!farmer) {
    notFound();
  }

  const viewerContext = await getOptionalServerViewerContext();

  const viewerRelationship = viewerContext
    ? await getFarmerViewerRelationship(
        viewerContext.supabase,
        viewerContext.user.id,
        farmer.farmerProfileId,
        viewerContext.profile
          ? {
              viewerFarmerProfileId:
                viewerContext.profile.farmerProfile?.id ?? null,
            }
          : undefined,
      )
    : {
        ok: true as const,
        data: {
          farmerProfileId: farmer.farmerProfileId,
          isFollowing: false,
          isSelf: false,
        },
      };

  if (!viewerRelationship.ok) {
    throw new Error(viewerRelationship.error.message);
  }

  return (
    <FarmerProfileView
      farmer={farmer}
      viewerRelationship={viewerRelationship.data}
    />
  );
}
