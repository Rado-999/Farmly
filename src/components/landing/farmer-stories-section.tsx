import { PageSection } from "@/components/ui/page-section";
import { CinematicStoriesContent } from "@/components/landing/cinematic-stories-content";
import type { FarmerStory } from "@/lib/landing/types";

type FarmerStoriesSectionProps = {
  stories: FarmerStory[];
};

export function FarmerStoriesSection({ stories }: FarmerStoriesSectionProps) {
  return (
    <PageSection id="field-stories" tone="meadow" spacing="default">
      <div className="page-shell-wide section-stack">
        <CinematicStoriesContent stories={stories} />
      </div>
    </PageSection>
  );
}
