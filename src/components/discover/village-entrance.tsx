import { ButtonLink } from "@/components/ui/button-link";
import type { DiscoverPersonalization } from "@/lib/discover/personalize";
import type { VillageSnapshot } from "@/lib/discover/types";
import type { Locale } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/translate";

type VillageEntranceProps = {
  locale: Locale;
  snapshot: VillageSnapshot;
  personalization?: DiscoverPersonalization;
};

function SnapshotLine({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  if (value <= 0) {
    return null;
  }

  return (
    <li>
      <span className="font-medium text-forest-deep">{value}</span> {label}
    </li>
  );
}

export function VillageEntrance({
  snapshot,
  locale,
  personalization,
}: VillageEntranceProps) {
  const hasStats =
    snapshot.farmerCount > 0 ||
    snapshot.filmCount > 0 ||
    snapshot.momentCount > 0;

  const kicker = personalization
    ? translate(locale, "Нови пътеки", "New paths")
    : translate(locale, "Дигитално село", "Digital village");

  const title = personalization
    ? translate(
        locale,
        "Срещи, които още не познаваш.",
        "Encounters you have not met yet.",
      )
    : translate(
        locale,
        "Разхождай се. Слушай. Остани колкото искаш.",
        "Walk. Listen. Stay as long as you want.",
      );

  const description = personalization?.userRegion
    ? translate(
        locale,
        "Подредихме разходката според твоите интереси и близки места — нови ферми, филми и сезони, без да повтаряме хората от Моето село.",
        "We shaped the walk around your interests and nearby places — new farms, films, and seasons, without repeating the people in My village.",
      )
    : translate(
        locale,
        "Тук няма решетка за пазаруване. Има ферми, които споделят сутринта си, филми от полето и сезони, които узряват на бавен огън — като истинско село, само по-спокойно.",
        "There is no shopping grid here. There are farms sharing their mornings, films from the field, and seasons that ripen slowly, like a real village, only calmer.",
      );

  return (
    <section className="relative overflow-hidden border-b border-stone-400/30 bg-[linear-gradient(165deg,#f4f0e6_0%,#e8e2d4_42%,#dfe8d4_100%)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(circle_at_20%_80%,rgba(74,92,63,0.12)_0%,transparent_50%),radial-gradient(circle_at_85%_15%,rgba(212,188,138,0.2)_0%,transparent_45%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-[linear-gradient(180deg,transparent_0%,#e8e2d4_100%)]"
      />

      <div className="page-shell-wide relative z-10 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[0.8125rem] font-medium tracking-[0.16em] text-forest uppercase">
            {kicker}
          </p>
          <h1 className="editorial-serif mt-4 text-4xl leading-[1.08] font-medium text-forest-deep sm:text-5xl lg:text-[3.5rem]">
            {title}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-stone-700/90 sm:text-lg sm:leading-9">
            {description}
          </p>

          {hasStats ? (
            <ul
              className="mx-auto mt-8 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-soil"
              aria-label={translate(
                locale,
                "Какво те очаква в селото",
                "What awaits you in the village",
              )}
            >
              <SnapshotLine
                value={snapshot.farmerCount}
                label={translate(
                  locale,
                  snapshot.farmerCount === 1
                    ? "ферма споделя днес"
                    : "ферми споделят днес",
                  snapshot.farmerCount === 1
                    ? "farm is sharing today"
                    : "farms are sharing today",
                )}
              />
              <SnapshotLine
                value={snapshot.filmCount}
                label={translate(
                  locale,
                  snapshot.filmCount === 1 ? "полски филм" : "полски филма",
                  snapshot.filmCount === 1 ? "field film" : "field films",
                )}
              />
              <SnapshotLine
                value={snapshot.momentCount}
                label={translate(
                  locale,
                  snapshot.momentCount === 1
                    ? "сезонен момент"
                    : "сезонни момента",
                  snapshot.momentCount === 1
                    ? "seasonal moment"
                    : "seasonal moments",
                )}
              />
            </ul>
          ) : null}

          {personalization &&
          (personalization.followCount > 0 || personalization.savedCount > 0) ? (
            <ul
              className="mx-auto mt-6 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-soil/90"
              aria-label={translate(
                locale,
                "Твоето село",
                "Your village",
              )}
            >
              <SnapshotLine
                value={personalization.followCount}
                label={translate(
                  locale,
                  personalization.followCount === 1
                    ? "ферма в Моето село"
                    : "ферми в Моето село",
                  personalization.followCount === 1
                    ? "farm in My village"
                    : "farms in My village",
                )}
              />
              <SnapshotLine
                value={personalization.savedCount}
                label={translate(
                  locale,
                  personalization.savedCount === 1
                    ? "запазена ферма"
                    : "запазени ферми",
                  personalization.savedCount === 1
                    ? "saved farm"
                    : "saved farms",
                )}
              />
            </ul>
          ) : null}

          <div className="action-row mt-10 justify-center">
            <ButtonLink href="#village-path" variant="primary">
              {translate(locale, "Започни разходката", "Start the walk")}
            </ButtonLink>
            {personalization?.hasVillageHome ? (
              <ButtonLink href="/village" variant="quiet">
                {translate(locale, "Моето село", "My village")}
              </ButtonLink>
            ) : (
              <ButtonLink href="#field-theatre" variant="quiet">
                {translate(locale, "Гледай от полето", "Watch from the field")}
              </ButtonLink>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
