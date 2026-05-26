"use client";

import Link from "next/link";

import { useLocale } from "@/components/i18n/language-provider";
import { VillageFeedList } from "@/components/village/village-feed-list";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSection } from "@/components/ui/page-section";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { StoryHeading } from "@/components/ui/story-heading";
import { translate } from "@/lib/i18n/translate";
import type { DiscoverFeedModeData } from "@/lib/discover/types";

type DiscoverFeedModeProps = {
  initialData: DiscoverFeedModeData;
};

export function DiscoverFeedMode({ initialData }: DiscoverFeedModeProps) {
  const { locale } = useLocale();
  const { items, hasFollows } = initialData;

  return (
    <main className="flex-1 bg-cream">
      <PageSection tone="mist" spacing="default">
        <div className="page-shell-wide">
          <RevealOnScroll>
            <StoryHeading
              kicker={translate(locale, "Твоето село", "Your village")}
              title={translate(
                locale,
                "Какво правят фермите, които следиш",
                "What the farms you follow are doing",
              )}
              description={translate(
                locale,
                "Кратък поглед — без безкраен скрол. За пълния ритуал, отвори Моето село.",
                "A quick look without the endless scroll. For the full ritual, open My village.",
              )}
            />
          </RevealOnScroll>
          <p className="content-after-head text-center">
            <Link href="/village" className="story-link text-base">
              {translate(locale, "Отвори Моето село", "Open My village")}
            </Link>
          </p>
        </div>
      </PageSection>

      <PageSection tone="cream" spacing="default">
        <div className="page-shell-wide">
          {!hasFollows ? (
            <RevealOnScroll className="block">
              <EmptyState
                title={translate(locale, "Селото ти е тихо засега", "Your village is quiet for now")}
                description={translate(
                  locale,
                  "Разхождай се из фермите, за да започнеш да виждаш сезоните им.",
                  "Wander through the farms to start seeing their seasons.",
                )}
              />
              <p className="mt-6 text-center">
                <Link href="/farmers" className="story-link text-base">
                  {translate(locale, "Към фермите", "Go to farms")}
                </Link>
              </p>
            </RevealOnScroll>
          ) : items.length === 0 ? (
            <RevealOnScroll className="block">
              <EmptyState
                title={translate(locale, "Засега е тихо", "Quiet for now")}
                description={translate(
                  locale,
                  "Още няма нищо ново. Ела пак следващата седмица.",
                  "There is nothing new yet. Come back next week.",
                )}
              />
            </RevealOnScroll>
          ) : (
            <RevealOnScroll className="block">
              <VillageFeedList items={items} />
            </RevealOnScroll>
          )}
        </div>
      </PageSection>
    </main>
  );
}
