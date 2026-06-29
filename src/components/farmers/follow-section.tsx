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
              Виж как работи фермата на {farmerName}
            </h2>
            <p className="text-base leading-8 text-soil/80">
              Ще виждаш нови видеа и бележки от фермата, когато фермерът ги
              сподели.
            </p>
            <div className="flex justify-center pt-2">
              <FollowButton
                farmerProfileId={farmerProfileId}
                farmerName={farmerName}
                followLabel="Добави в селото"
                followingLabel="В селото ти"
                size="prominent"
                noticeAlign="center"
              />
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </PageSection>
  );
}
