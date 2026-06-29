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
            description="Видеа от посаждане до жътва и ежедневната работа по фермата."
          />
        </RevealOnScroll>

        {videos.length === 0 ? (
          <RevealOnScroll className="content-after-head block">
            <EmptyState
              title="Все още няма видеа"
              description="Този фермер още не е качил клипове от полето."
            />
          </RevealOnScroll>
        ) : (
          <VideoGridInteractive videos={videos} />
        )}
      </div>
    </PageSection>
  );
}
