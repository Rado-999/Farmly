import { buildTrustRibbonLine } from "@/lib/farmers/profile-helpers";
import type { FarmerProfile } from "@/lib/farmers/types";

type TrustRibbonProps = {
  farmer: Pick<FarmerProfile, "isVerified" | "videos" | "region">;
};

export function TrustRibbon({ farmer }: TrustRibbonProps) {
  const line = buildTrustRibbonLine({
    isVerified: farmer.isVerified,
    videoCount: farmer.videos.length,
    region: farmer.region,
  });

  return (
    <div
      className="border-y border-loam-300/50 bg-loam-200/60"
      aria-label="Сигнали за доверие"
    >
      <div className="page-shell py-4 sm:py-5">
        <p className="text-center text-sm leading-relaxed tracking-wide text-soil/85 sm:text-[0.9375rem]">
          {line}
        </p>
      </div>
    </div>
  );
}
