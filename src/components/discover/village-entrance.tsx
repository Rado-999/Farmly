import { ButtonLink } from "@/components/ui/button-link";
import type { VillageSnapshot } from "@/lib/discover/types";

type VillageEntranceProps = {
  snapshot: VillageSnapshot;
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

export function VillageEntrance({ snapshot }: VillageEntranceProps) {
  const hasStats =
    snapshot.farmerCount > 0 ||
    snapshot.filmCount > 0 ||
    snapshot.momentCount > 0;

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
            Дигитално село
          </p>
          <h1 className="editorial-serif mt-4 text-4xl leading-[1.08] font-medium text-forest-deep sm:text-5xl lg:text-[3.5rem]">
            Разхождай се. Слушай. Остани колкото искаш.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-stone-700/90 sm:text-lg sm:leading-9">
            Тук няма решетка за пазаруване. Има ферми, които споделят сутринта
            си, филми от полето и сезони, които узряват на бавен огън — като
            истинско село, само по-спокойно.
          </p>

          {hasStats ? (
            <ul
              className="mx-auto mt-8 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-soil"
              aria-label="Какво те очаква в селото"
            >
              <SnapshotLine
                value={snapshot.farmerCount}
                label={
                  snapshot.farmerCount === 1
                    ? "ферма споделя днес"
                    : "ферми споделят днес"
                }
              />
              <SnapshotLine
                value={snapshot.filmCount}
                label={
                  snapshot.filmCount === 1
                    ? "полски филм"
                    : "полски филма"
                }
              />
              <SnapshotLine
                value={snapshot.momentCount}
                label={
                  snapshot.momentCount === 1
                    ? "сезонен момент"
                    : "сезонни момента"
                }
              />
            </ul>
          ) : null}

          <div className="action-row mt-10 justify-center">
            <ButtonLink href="#village-path" variant="primary">
              Започни разходката
            </ButtonLink>
            <ButtonLink href="#field-theatre" variant="quiet">
              Гледай от полето
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
