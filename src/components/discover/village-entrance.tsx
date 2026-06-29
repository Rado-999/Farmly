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
    snapshot.productCount > 0;

  const kicker = personalization
    ? translate(locale, "Нови пътеки", "New paths")
    : translate(locale, "Дигитално село", "Digital village");

  const title = personalization
    ? translate(
        locale,
        "Ферми, които още не познаваш",
        "Farms you have not met yet",
      )
    : translate(
        locale,
        "Разгледай фермите на свой ритъм",
        "Browse farms at your own pace",
      );

  const description = personalization?.userRegion
    ? translate(
        locale,
        "Подредихме разходката според твоите интереси и близки места. Нови ферми, видеа и сезонни бележки, без да повтаряме хората от Моето село.",
        "We ordered the walk around your interests and nearby places. New farms, videos, and seasonal notes, without repeating the people in My village.",
      )
    : translate(
        locale,
        "Тук ще намериш профили на фермери, видеа от полето и какво е в сезон. ",
        "Here you find farmer profiles, field videos, and what is in season. No shopping grid, just getting to know people.",
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
                    ? "ферма"
                    : "ферми",
                  snapshot.farmerCount === 1
                    ? "ферма"
                    : "ферми",
                )}
              />
              <SnapshotLine
                value={snapshot.filmCount}
                label={translate(
                  locale,
                  snapshot.filmCount === 1 ? "филм" : "филма",
                  snapshot.filmCount === 1 ? "филм" : "филма",
                )}
              />
              <SnapshotLine
                value={snapshot.productCount}
                label={translate(
                  locale,
                  snapshot.productCount === 1 ? "продукт" : "продукта",
                  snapshot.productCount === 1 ? "product" : "products",
                )}
              />
            </ul>
          ) : null}

          {personalization && personalization.followCount > 0 ? (
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
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
