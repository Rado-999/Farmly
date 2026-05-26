import { VillageFeedItemView } from "@/components/discover/village-feed-item";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSection } from "@/components/ui/page-section";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { StoryHeading } from "@/components/ui/story-heading";
import type { VillageFeedItem } from "@/lib/discover/types";
import type { Locale } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/translate";

type VillageFeedProps = {
  locale: Locale;
  items: VillageFeedItem[];
};

export function VillageFeed({ items, locale }: VillageFeedProps) {
  return (
    <PageSection id="village-path" tone="cream" spacing="default">
      <div className="page-shell-wide">
        <RevealOnScroll>
          <StoryHeading
            kicker={translate(locale, "От полето", "From the field")}
            title={translate(locale, "Какво се случва, докато вървиш.", "What happens while you walk.")}
            description={translate(
              locale,
              "Филми, сезонни мигове и тихи думи — живот по пътя, не още един списък с хора.",
              "Films, seasonal moments, and quiet words. Life along the path, not another list of people.",
            )}
          />
        </RevealOnScroll>

        {items.length === 0 ? (
          <RevealOnScroll className="content-after-head block">
            <EmptyState
              title={translate(locale, "Селото е тихо засега", "The village is quiet for now")}
              description={translate(
                locale,
                "Когато производителите започнат да споделят, пътеката ще се напълни с живот — бавно и със смисъл.",
                "When growers begin to share, the path will fill with life slowly and meaningfully.",
              )}
            />
          </RevealOnScroll>
        ) : (
          <ol className="content-after-head m-0 flex list-none flex-col gap-4 p-0 sm:gap-5">
            {items.map((item) => (
              <li key={item.id}>
                <RevealOnScroll>
                  <VillageFeedItemView item={item} locale={locale} />
                </RevealOnScroll>
              </li>
            ))}
          </ol>
        )}
      </div>
    </PageSection>
  );
}
