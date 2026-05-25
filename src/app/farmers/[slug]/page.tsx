import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FarmerProfileView } from "@/components/farmers/farmer-profile-view";
import { getFarmerProfile, getFarmerSlugs } from "@/lib/farmers/queries";

export const dynamic = "force-dynamic";

type FarmerPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const slugs = await getFarmerSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: FarmerPageProps): Promise<Metadata> {
  const { slug } = await params;
  const farmer = await getFarmerProfile(slug);

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
  const farmer = await getFarmerProfile(slug);

  if (!farmer) {
    notFound();
  }

  return <FarmerProfileView farmer={farmer} />;
}
