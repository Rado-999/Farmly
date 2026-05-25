import Image from "next/image";

import { landingImages } from "@/lib/landing/visuals";

/** Static hero media — no transforms, no video, no blend modes (prevents wiggle/lag). */
export function HeroStaticBackground() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-moss-900">
      <Image
        src={landingImages.heroPoster.src}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_20%,rgba(228,192,120,0.08)_0%,transparent_55%)]"
      />
    </div>
  );
}
