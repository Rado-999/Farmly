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
            title={translate(locale, "Ново от селото", "New from the village")}
            description={translate(
              locale,
              "Видеа, бележки и сезонни новини от фермерите.",
              "Videos, notes, and seasonal news from farmers. Laid out like a walk, not a store listing.",
            )}
          />
        </RevealOnScroll>

        {items.length === 0 ? (
          <RevealOnScroll className="content-after-head block">
            <EmptyState
              title={translate(locale, "Селото е тихо засега", "The village is quiet for now")}
              description={translate(
                locale,
                "Ще се появи съдържание, когато фермерите започнат да споделят.",
                "Content will show up here once farmers start sharing.",
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
