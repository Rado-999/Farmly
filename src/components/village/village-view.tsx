import Link from "next/link";

import { VillageFeedList } from "@/components/village/village-feed-list";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSection } from "@/components/ui/page-section";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
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
  const hasRelationships = data.hasFollows;

  return (
    <main className="flex-1 bg-cream">
      <PageSection tone="mist" spacing="default">
        <div className="page-shell-wide">
          <RevealOnScroll>
            <StoryHeading
              kicker={translate(locale, "Моето село", "My village")}
              title={translate(
                locale,
                "Тук са фермите в селото ти",
                "Your village farms live here",
              )}
              description={translate(
                locale,
                "Кратък преглед на ферми, които познаваш, сезонни бележки и срещи наблизо.",
                "A short overview of farms you know, seasonal notes, and nearby gatherings.",
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
                  "Добави ферми в селото си, за да виждаш тяхната активност тук.",
                  "Add farms to your village to see their activity here.",
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
                      "Нови бележки от фермите в селото ти.",
                      "New notes from the farms in your village.",
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
                      "Хората от селото ти",
                      "People in your village",
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

          {data.seasonNearYou.length ? (
            <PageSection tone="hearth" id="season-near-you">
              <div className="page-shell-wide">
                <RevealOnScroll>
                  <StoryHeading
                    kicker={translate(locale, "Сезон при теб", "Season near you")}
                    title={translate(
                      locale,
                      "В сезон сега",
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
                          "Когато фермерите в селото ти споделят нещо ново, ще го видиш тук. Още няма нищо ново. Ела пак следващата седмица.",
                          "When farmers in your village share something new, you will see it here. There is nothing new yet. Come back next week.",
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
