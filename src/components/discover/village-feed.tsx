import { VillageFeedItemView } from "@/components/discover/village-feed-item";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSection } from "@/components/ui/page-section";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { StoryHeading } from "@/components/ui/story-heading";
import type { VillageFeedItem } from "@/lib/discover/types";

type VillageFeedProps = {
  items: VillageFeedItem[];
};

export function VillageFeed({ items }: VillageFeedProps) {
  return (
    <PageSection id="village-path" tone="cream" spacing="default">
      <div className="page-shell-wide">
        <RevealOnScroll>
          <StoryHeading
            kicker="От полето"
            title="Какво се случва, докато вървиш."
            description="Филми, сезонни мигове и тихи думи — живот по пътя, не още един списък с хора."
          />
        </RevealOnScroll>

        {items.length === 0 ? (
          <RevealOnScroll className="content-after-head block">
            <EmptyState
              title="Селото е тихо засега"
              description="Когато производителите започнат да споделят, пътеката ще се напълни с живот — бавно и със смисъл."
            />
          </RevealOnScroll>
        ) : (
          <ol className="content-after-head m-0 flex list-none flex-col gap-4 p-0 sm:gap-5">
            {items.map((item) => (
              <li key={item.id}>
                <RevealOnScroll>
                  <VillageFeedItemView item={item} />
                </RevealOnScroll>
              </li>
            ))}
          </ol>
        )}
      </div>
    </PageSection>
  );
}
