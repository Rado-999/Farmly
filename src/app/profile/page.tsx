import type { Metadata } from "next";

import { ProfileView } from "@/components/profile/profile-view";
import { PROFILE_PATH } from "@/lib/auth/constants";
import { requireServerProfile } from "@/lib/auth/server";
import { getServerLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";
import { loadProfileRelationshipCounts } from "@/lib/marketplace/relationship-counts";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();

  return {
    title: translate(locale, "Вашият профил | Farmly", "Your profile | Farmly"),
    description: translate(
      locale,
      "Прегледайте акаунта си в Farmly, надградете до фермерски профил и управлявайте членството си.",
      "Review your Farmly account, upgrade to a farmer profile, and manage your membership.",
    ),
  };
}

export default async function ProfilePage() {
  const { profile, user, supabase } = await requireServerProfile(PROFILE_PATH);
  const relationshipCounts = await loadProfileRelationshipCounts(
    supabase,
    user.id,
    profile.farmerProfile?.id,
  );
  const metadataName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : null;

  return (
    <main className="flex-1 bg-cream">
      <ProfileView
        initialProfile={profile}
        sessionEmail={user.email ?? null}
        sessionMetadataName={metadataName}
        relationshipCounts={relationshipCounts}
      />
    </main>
  );
}
