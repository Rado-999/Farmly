import Link from "next/link";

import { FarmerCard } from "@/components/farmers/farmer-card";
import { VillageFeedList } from "@/components/village/village-feed-list";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSection } from "@/components/ui/page-section";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { RevealStagger } from "@/components/ui/reveal-stagger";
import { StoryHeading } from "@/components/ui/story-heading";
import type { Locale } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/translate";
import type { VillagePageData } from "@/lib/village/load-village";

type VillageViewProps = {
  initialData: VillagePageData;
  locale: Locale;
};

export function VillageView({ initialData, locale }: VillageViewProps) {
  const data = initialData;
  const hasRelationships = data.hasFollows || data.hasSavedOnly;

  return (
    <main className="flex-1 bg-cream">
      <PageSection tone="mist" spacing="default">
        <div className="page-shell-wide">
          <RevealOnScroll>
            <StoryHeading
              kicker={translate(locale, "Моето село", "My village")}
              title={translate(
                locale,
                "Твоето спокойно място в мрежата.",
                "Your calm place on the web.",
              )}
              description={translate(
                locale,
                "Кратък обиколка — ферми, които познаваш, сезонни бележки и срещи наблизо. Без безкраен скрол.",
                "A short loop of farms you know, seasonal notes, and nearby gatherings. No endless scroll.",
              )}
            />
          </RevealOnScroll>
        </div>
      </PageSection>

      {!hasRelationships ? (
        <PageSection tone="cream">
          <div className="page-shell">
            <RevealOnScroll>
              <EmptyState
                title={translate(locale, "Селото ти е все още тихо", "Your village is still quiet")}
                description={translate(
                  locale,
                  "Запази или следи ферма, когато срещнеш някой, на когото искаш да се връщаш — без натиск и без количка.",
                  "Save or follow a farm when you meet someone you want to return to, without pressure and without a cart.",
                )}
              />
              <p className="mt-6 text-center">
                <Link href="/farmers" className="story-link text-base">
                  {translate(locale, "Запознай се с фермерите", "Meet the farmers")}
                </Link>
              </p>
            </RevealOnScroll>
          </div>
        </PageSection>
      ) : (
        <>
          {data.showSinceYouWereHere ? (
            <PageSection tone="cream" id="since-you-were-here">
              <div className="page-shell-wide">
                <RevealOnScroll>
                  <StoryHeading
                    kicker={translate(locale, "Откакто не беше тук", "Since you were away")}
                    title={translate(locale, "Докато не беше тук", "While you were away")}
                    description={translate(
                      locale,
                      "Нови бележки от фермите, които следиш.",
                      "New notes from the farms you follow.",
                    )}
                    size="chapter"
                  />
                </RevealOnScroll>
                <RevealOnScroll className="content-after-head block">
                  <VillageFeedList items={data.sinceYouWereHere} />
                </RevealOnScroll>
              </div>
            </PageSection>
          ) : null}

          {data.fromYourFarms.length ? (
            <PageSection tone="dawn" id="from-your-farms">
              <div className="page-shell-wide">
                <RevealOnScroll>
                  <StoryHeading
                    kicker={translate(locale, "От твоите ферми", "From your farms")}
                    title={translate(
                      locale,
                      "Хората, чийто сезон следиш",
                      "The people whose seasons you follow",
                    )}
                    size="chapter"
                  />
                </RevealOnScroll>
                <RevealOnScroll className="content-after-head block">
                  <VillageFeedList items={data.fromYourFarms} />
                </RevealOnScroll>
              </div>
            </PageSection>
          ) : null}

          {data.savedFarms.length ? (
            <PageSection tone="cream" id="saved-farms">
              <div className="page-shell">
                <RevealOnScroll>
                  <StoryHeading
                    kicker={translate(locale, "Запазени ферми", "Saved farms")}
                    title={translate(
                      locale,
                      "На които искаш да се върнеш",
                      "The ones you want to return to",
                    )}
                    description={translate(
                      locale,
                      "Без известия — само врата, оставена отворена.",
                      "No notifications, just a door left open.",
                    )}
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
                      linkLabel={translate(locale, "Отвори фермата", "Open farm")}
                      surface="white"
                    />
                  ))}
                </RevealStagger>
              </div>
            </PageSection>
          ) : null}

          {data.seasonNearYou.length ? (
            <PageSection tone="hearth" id="season-near-you">
              <div className="page-shell-wide">
                <RevealOnScroll>
                  <StoryHeading
                    kicker={translate(locale, "Сезон при теб", "Season near you")}
                    title={translate(
                      locale,
                      "Какво земята предлага сега",
                      "What the land offers now",
                    )}
                    description={translate(
                      locale,
                      "От фермите, които държиш близо.",
                      "From the farms you keep close.",
                    )}
                    size="chapter"
                  />
                </RevealOnScroll>
                <RevealOnScroll className="content-after-head block">
                  <VillageFeedList items={data.seasonNearYou} />
                </RevealOnScroll>
              </div>
            </PageSection>
          ) : null}

          {data.localGatherings.length ? (
            <PageSection tone="meadow" id="local-gatherings">
              <div className="page-shell-wide">
                <RevealOnScroll>
                  <StoryHeading
                    kicker={translate(locale, "Срещи наблизо", "Nearby gatherings")}
                    title={translate(locale, "Общност в твоя край", "Community close to you")}
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
                  {data.hasAnyContent ? (
                    <p className="mx-auto max-w-xl text-base leading-8 text-stone-700/90">
                      {translate(
                        locale,
                        "Още няма нищо ново. Ела пак следващата седмица.",
                        "There is nothing new yet. Come back next week.",
                      )}
                    </p>
                  ) : (
                    <>
                      <p className="text-[0.8125rem] font-medium uppercase tracking-[0.12em] text-soil">
                        {translate(locale, "Тихо е в селото", "It is quiet in the village")}
                      </p>
                      <p className="mx-auto mt-3 max-w-xl text-base leading-8 text-stone-700/90">
                        {translate(
                          locale,
                          "Когато фермерите, които следиш, споделят нещо ново, ще го видиш тук. Още няма нищо ново. Ела пак следващата седмица.",
                          "When the farmers you follow share something new, you will see it here. There is nothing new yet. Come back next week.",
                        )}
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
