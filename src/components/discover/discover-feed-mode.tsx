"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { VillageFeedList } from "@/components/village/village-feed-list";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoadingShell } from "@/components/ui/page-loading-shell";
import { PageSection } from "@/components/ui/page-section";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { StoryHeading } from "@/components/ui/story-heading";
import { getVillageFeed } from "@/lib/feed/getVillageFeed";
import type { VillageFeedItem } from "@/lib/feed/types";
import { createSupabaseClient } from "@/lib/supabase";

type DiscoverFeedModeProps = {
  userId: string;
};

function flattenFeedSections(
  feed: Awaited<ReturnType<typeof getVillageFeed>>,
): VillageFeedItem[] {
  return [
    ...feed.sinceYouWereHere,
    ...feed.fromYourFarms,
    ...feed.seasonNearYou,
    ...feed.localGatherings,
  ].slice(0, 15);
}

export function DiscoverFeedMode({ userId }: DiscoverFeedModeProps) {
  const [items, setItems] = useState<VillageFeedItem[]>([]);
  const [hasFollows, setHasFollows] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFeed = useCallback(async () => {
    const supabase = createSupabaseClient();

    if (!supabase) {
      setError("Свързването със селото не е налично.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const feed = await getVillageFeed(supabase, userId);
      setItems(flattenFeedSections(feed));
      setHasFollows(feed.hasFollows);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Неуспешно зареждане на лентата.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadFeed();
  }, [loadFeed]);

  if (isLoading) {
    return <PageLoadingShell />;
  }

  if (error) {
    return (
      <main className="flex-1 bg-cream">
        <div className="page-shell py-16">
          <p
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </p>
        </div>
      </main>
    );
  }

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
