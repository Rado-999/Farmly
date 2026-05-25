import type { Metadata } from "next";

import { NewVideoPage } from "@/components/videos/new-video-page";

export const metadata: Metadata = {
  title: "Качи видео | Farmly",
  description: "Качете полско видео към вашия фермерски профил.",
};

export default function NewVideoRoute() {
  return <NewVideoPage />;
}
