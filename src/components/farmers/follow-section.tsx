"use client";

import { FollowButton } from "@/components/farmers/follow-button";
import { PageSection } from "@/components/ui/page-section";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";

type FollowSectionProps = {
  farmerProfileId: string;
  farmerName: string;
};

export function FollowSection({
  farmerProfileId,
  farmerName,
}: FollowSectionProps) {
  return (
    <PageSection id="follow" tone="earth" spacing="compact">
      <div className="page-shell">
        <RevealOnScroll>
          <div className="mx-auto max-w-2xl text-center stack-relaxed">
            <p className="text-[0.8125rem] font-medium tracking-[0.14em] text-clay uppercase">
              Остани близо до сезона
            </p>
            <h2 className="editorial-serif text-3xl leading-tight text-moss-900 sm:text-4xl">
              Следи как живее земята на {farmerName}
            </h2>
            <p className="text-base leading-8 text-soil/80">
              Тихи обновления, когато излязат нови полски филми — не известия,
              а пощенски картички от фермата.
            </p>
            <div className="flex justify-center pt-2">
              <FollowButton
                farmerProfileId={farmerProfileId}
                farmerName={farmerName}
                followLabel="Следи този сезон"
                followingLabel="Следиш този сезон"
                size="prominent"
              />
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </PageSection>
  );
}
