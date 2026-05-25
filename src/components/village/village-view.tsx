"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { FarmerCard } from "@/components/farmers/farmer-card";
import { VillageFeedList } from "@/components/village/village-feed-list";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoadingShell } from "@/components/ui/page-loading-shell";
import { PageSection } from "@/components/ui/page-section";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { RevealStagger } from "@/components/ui/reveal-stagger";
import { StoryHeading } from "@/components/ui/story-heading";
import { VILLAGE_PATH } from "@/lib/auth/constants";
import { useAuthSession } from "@/lib/auth/use-auth-session";
import type { VillagePageData } from "@/lib/village/load-village";
import { loadVillagePageData } from "@/lib/village/load-village";
import { createSupabaseClient } from "@/lib/supabase";

export function VillageView() {
  const router = useRouter();
  const auth = useAuthSession();
  const [data, setData] = useState<VillagePageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVillage = useCallback(async (userId: string) => {
    const supabase = createSupabaseClient();

    if (!supabase) {
      setError("Свързването с общността не е налично.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const village = await loadVillagePageData(supabase, userId);
      setData(village);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Неуспешно зареждане на селото.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (auth.status === "loading") {
      return;
    }

    if (auth.status !== "authenticated") {
      router.replace(`/login?next=${encodeURIComponent(VILLAGE_PATH)}`);
      return;
    }

    void loadVillage(auth.user.id);
  }, [auth, loadVillage, router]);

  if (auth.status === "loading" || isLoading) {
    return <PageLoadingShell />;
  }

  if (auth.status !== "authenticated") {
    return null;
  }

  const hasRelationships = data?.hasFollows || data?.hasSavedOnly;

  return (
    <main className="flex-1 bg-cream">
      <PageSection tone="mist" spacing="default">
        <div className="page-shell-wide">
          <RevealOnScroll>
            <StoryHeading
              kicker="Моето село"
              title="Твоето спокойно място в мрежата."
              description="Кратък обиколка — ферми, които познаваш, сезонни бележки и срещи наблизо. Без безкраен скрол."
            />
          </RevealOnScroll>
        </div>
      </PageSection>

      {error ? (
        <PageSection tone="cream">
          <div className="page-shell">
            <p
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              {error}
            </p>
          </div>
        </PageSection>
      ) : null}

      {!hasRelationships ? (
        <PageSection tone="cream">
          <div className="page-shell">
            <RevealOnScroll>
              <EmptyState
                title="Селото ти е все още тихо"
                description="Запази или следи ферма, когато срещнеш някой, на когото искаш да се връщаш — без натиск и без количка."
              />
              <p className="mt-6 text-center">
                <Link href="/farmers" className="story-link text-base">
                  Запознай се с фермерите
                </Link>
              </p>
            </RevealOnScroll>
          </div>
        </PageSection>
      ) : (
        <>
          {data?.showSinceYouWereHere ? (
            <PageSection tone="cream" id="since-you-were-here">
              <div className="page-shell-wide">
                <RevealOnScroll>
                  <StoryHeading
                    kicker="Откакто не беше тук"
                    title="Докато не беше тук"
                    description="Нови бележки от фермите, които следиш."
                    size="chapter"
                  />
                </RevealOnScroll>
                <RevealOnScroll className="content-after-head block">
                  <VillageFeedList items={data.sinceYouWereHere} />
                </RevealOnScroll>
              </div>
            </PageSection>
          ) : null}

          {data?.fromYourFarms.length ? (
            <PageSection tone="dawn" id="from-your-farms">
              <div className="page-shell-wide">
                <RevealOnScroll>
                  <StoryHeading
                    kicker="От твоите ферми"
                    title="Хората, чийто сезон следиш"
                    size="chapter"
                  />
                </RevealOnScroll>
                <RevealOnScroll className="content-after-head block">
                  <VillageFeedList items={data.fromYourFarms} />
                </RevealOnScroll>
              </div>
            </PageSection>
          ) : null}

          {data?.savedFarms.length ? (
            <PageSection tone="cream" id="saved-farms">
              <div className="page-shell">
                <RevealOnScroll>
                  <StoryHeading
                    kicker="Запазени ферми"
                    title="На които искаш да се върнеш"
                    description="Без известия — само врата, оставена отворена."
                    size="chapter"
                  />
                </RevealOnScroll>
                <RevealStagger className="content-after-head grid-cards md:grid-cols-2 xl:grid-cols-3">
                  {data.savedFarms.map((farmer) => (
                    <FarmerCard
                      key={farmer.farmer_id}
                      href={`/farmers/${farmer.slug}`}
                      name={farmer.name}
                      location={farmer.location}
                      description={farmer.bio}
                      imageUrl={farmer.image}
                      gradientFrom={farmer.gradientFrom}
                      gradientTo={farmer.gradientTo}
                      linkLabel="Отвори фермата"
                      surface="white"
                    />
                  ))}
                </RevealStagger>
              </div>
            </PageSection>
          ) : null}

          {data?.seasonNearYou.length ? (
            <PageSection tone="hearth" id="season-near-you">
              <div className="page-shell-wide">
                <RevealOnScroll>
                  <StoryHeading
                    kicker="Сезон при теб"
                    title="Какво земята предлага сега"
                    description="От фермите, които държиш близо."
                    size="chapter"
                  />
                </RevealOnScroll>
                <RevealOnScroll className="content-after-head block">
                  <VillageFeedList items={data.seasonNearYou} />
                </RevealOnScroll>
              </div>
            </PageSection>
          ) : null}

          {data?.localGatherings.length ? (
            <PageSection tone="meadow" id="local-gatherings">
              <div className="page-shell-wide">
                <RevealOnScroll>
                  <StoryHeading
                    kicker="Срещи наблизо"
                    title="Общност в твоя край"
                    size="chapter"
                  />
                </RevealOnScroll>
                <RevealOnScroll className="content-after-head block">
                  <VillageFeedList items={data.localGatherings} />
                </RevealOnScroll>
              </div>
            </PageSection>
          ) : null}

          <PageSection tone="earth">
            <div className="page-shell-wide">
              <RevealOnScroll>
                <div className="rounded-sm border border-stone-300/40 bg-cream/60 px-6 py-8 text-center sm:px-8">
                  {data?.hasAnyContent ? (
                    <p className="mx-auto max-w-xl text-base leading-8 text-stone-700/90">
                      Още няма нищо ново. Ела пак следващата седмица.
                    </p>
                  ) : (
                    <>
                      <p className="text-[0.8125rem] font-medium uppercase tracking-[0.12em] text-soil">
                        Тихо е в селото
                      </p>
                      <p className="mx-auto mt-3 max-w-xl text-base leading-8 text-stone-700/90">
                        Когато фермерите, които следиш, споделят нещо ново, ще
                        го видиш тук. Още няма нищо ново. Ела пак следващата
                        седмица.
                      </p>
                    </>
                  )}
                </div>
              </RevealOnScroll>
            </div>
          </PageSection>
        </>
      )}
    </main>
  );
}
