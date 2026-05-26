"use client";

import Link from "next/link";

import { VillageFeedList } from "@/components/village/village-feed-list";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSection } from "@/components/ui/page-section";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { StoryHeading } from "@/components/ui/story-heading";
import type { DiscoverFeedModeData } from "@/lib/discover/types";

type DiscoverFeedModeProps = {
  initialData: DiscoverFeedModeData;
};

export function DiscoverFeedMode({ initialData }: DiscoverFeedModeProps) {
  const { items, hasFollows } = initialData;

  return (
    <main className="flex-1 bg-cream">
      <PageSection tone="mist" spacing="default">
        <div className="page-shell-wide">
          <RevealOnScroll>
            <StoryHeading
              kicker="Твоето село"
              title="Какво правят фермите, които следиш"
              description="Кратък поглед — без безкраен скрол. За пълния ритуал, отвори Моето село."
            />
          </RevealOnScroll>
          <p className="content-after-head text-center">
            <Link href="/village" className="story-link text-base">
              Отвори Моето село
            </Link>
          </p>
        </div>
      </PageSection>

      <PageSection tone="cream" spacing="default">
        <div className="page-shell-wide">
          {!hasFollows ? (
            <RevealOnScroll className="block">
              <EmptyState
                title="Селото ти е тихо засега"
                description="Разхождай се из фермите, за да започнеш да виждаш сезоните им."
              />
              <p className="mt-6 text-center">
                <Link href="/farmers" className="story-link text-base">
                  Към фермите
                </Link>
              </p>
            </RevealOnScroll>
          ) : items.length === 0 ? (
            <RevealOnScroll className="block">
              <EmptyState
                title="Засега е тихо"
                description="Още няма нищо ново. Ела пак следващата седмица."
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
