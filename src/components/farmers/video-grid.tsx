import { VideoGridInteractive } from "@/components/farmers/video-grid-interactive";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSection } from "@/components/ui/page-section";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { SectionHeading } from "@/components/ui/section-heading";
import type { FarmerVideo } from "@/lib/farmers/types";

type VideoGridProps = {
  videos: FarmerVideo[];
};

export function VideoGrid({ videos }: VideoGridProps) {
  return (
    <PageSection tone="linen" id="videos">
      <div className="page-shell">
        <RevealOnScroll>
          <SectionHeading
            align="left"
            eyebrow="Видео библиотека"
            title="Гледай как се развива сезонът"
            description="Засаждане, растеж, жътва и тихите рутини, които изграждат доверие във всяка кошница."
          />
        </RevealOnScroll>

        {videos.length === 0 ? (
          <RevealOnScroll className="content-after-head block">
            <EmptyState
              title="Все още няма полски видеа"
              description="Този фермер все още не е споделил сезонни обновления. Върнете се, докато жътвата се развива."
            />
          </RevealOnScroll>
        ) : (
          <VideoGridInteractive videos={videos} />
        )}
      </div>
    </PageSection>
  );
}
