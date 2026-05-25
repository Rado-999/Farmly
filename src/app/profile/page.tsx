import type { Metadata } from "next";

import { ProfileView } from "@/components/profile/profile-view";
import { PROFILE_PATH } from "@/lib/auth/constants";
import { requireServerProfile } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Вашият профил | Farmly",
  description:
    "Прегледайте акаунта си в Farmly, надградете до фермерски профил и управлявайте членството си.",
};

export default async function ProfilePage() {
  const { profile, user } = await requireServerProfile(PROFILE_PATH);
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
      />
    </main>
  );
}
