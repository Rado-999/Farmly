import type { Metadata } from "next";
import { Suspense } from "react";

import { ProfileSkeleton } from "@/components/profile/profile-skeleton";
import { ProfileView } from "@/components/profile/profile-view";

export const metadata: Metadata = {
  title: "Вашият профил | Farmly",
  description:
    "Прегледайте акаунта си в Farmly, надградете до фермерски профил и управлявайте членството си.",
};

export default function ProfilePage() {
  return (
    <main className="flex-1 bg-cream">
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileView />
      </Suspense>
    </main>
  );
}
