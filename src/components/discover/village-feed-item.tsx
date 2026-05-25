import Link from "next/link";

import { MediaPanel } from "@/components/ui/media-panel";
import type { VillageFeedItem } from "@/lib/discover/types";

type VillageFeedItemViewProps = {
  item: VillageFeedItem;
};

function FarmerAttribution({
  name,
  slug,
  location,
}: {
  name: string;
  slug: string;
  location?: string;
}) {
  return (
    <p className="text-xs text-stone-500">
      от{" "}
      <Link
        href={`/farmers/${slug}`}
        className="font-medium text-soil hover:text-forest-deep"
      >
        {name}
      </Link>
      {location ? <span> · {location}</span> : null}
    </p>
  );
}

function FilmPulseCard({ item }: { item: Extract<VillageFeedItem, { kind: "film" }> }) {
  const { film } = item;

  return (
    <article className="flex gap-4 rounded-xl border border-stone-400/20 bg-[linear-gradient(135deg,#2f4530_0%,#263828_100%)] p-4 text-mist sm:items-center sm:gap-5">
      <Link
        href={`/farmers/${film.farmerSlug}#videos`}
        className="shrink-0"
        aria-label={`Гледай ${film.title}`}
      >
        <MediaPanel
          from={film.gradientFrom}
          to={film.gradientTo}
          label={film.title}
          imageUrl={film.imageUrl}
          className="h-16 w-16 rounded-lg sm:h-[4.5rem] sm:w-[4.5rem]"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <p className="text-[0.625rem] font-medium uppercase tracking-[0.14em] text-wheat/85">
          Полски филм · {film.stage}
        </p>
        <h3 className="editorial-serif mt-1 text-lg leading-snug sm:text-xl">
          {film.title}
        </h3>
        <FarmerAttribution
          name={film.farmerName}
          slug={film.farmerSlug}
          location={film.location}
        />
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-wheat/80">
          <span>{film.duration}</span>
          <Link
            href={`/farmers/${film.farmerSlug}#videos`}
            className="story-link text-xs text-wheat hover:text-mist"
          >
            Гледай
          </Link>
        </div>
      </div>
    </article>
  );
}

function MomentPulseCard({
  item,
}: {
  item: Extract<VillageFeedItem, { kind: "moment" }>;
}) {
  const { moment } = item;
  const href = `/farmers/${moment.farmerSlug}/products/${moment.id}`;

  return (
    <article className="flex gap-4 rounded-xl border border-stone-400/20 bg-white/60 p-4 sm:items-center">
      <Link href={href} className="shrink-0">
        <MediaPanel
          from={moment.gradientFrom}
          to={moment.gradientTo}
          label={moment.title}
          imageUrl={moment.imageUrl}
          className="h-16 w-16 rounded-lg sm:h-[4.5rem] sm:w-[4.5rem]"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <p className="text-[0.625rem] font-medium uppercase tracking-[0.14em] text-clay">
          {moment.season} · в сезон
        </p>
        <h3 className="editorial-serif mt-1 text-lg leading-snug text-forest-deep sm:text-xl">
          <Link href={href} className="hover:text-forest">
            {moment.title}
          </Link>
        </h3>
        <FarmerAttribution name={moment.farmerName} slug={moment.farmerSlug} />
        {moment.note ? (
          <p className="mt-1 line-clamp-1 text-sm text-stone-600">{moment.note}</p>
        ) : null}
      </div>
    </article>
  );
}

function WhisperPulseCard({
  item,
}: {
  item: Extract<VillageFeedItem, { kind: "whisper" }>;
}) {
  const { whisper } = item;

  return (
    <blockquote className="border-l-2 border-forest/25 py-1 pl-4 sm:pl-5">
      <p className="editorial-serif line-clamp-2 text-base leading-relaxed text-forest-deep sm:text-lg">
        „{whisper.text}&rdquo;
      </p>
      <footer className="mt-2">
        <FarmerAttribution
          name={whisper.farmerName}
          slug={whisper.farmerSlug}
          location={whisper.location}
        />
      </footer>
    </blockquote>
  );
}

export function VillageFeedItemView({ item }: VillageFeedItemViewProps) {
  switch (item.kind) {
    case "film":
      return <FilmPulseCard item={item} />;
    case "moment":
      return <MomentPulseCard item={item} />;
    case "whisper":
      return <WhisperPulseCard item={item} />;
    default:
      return null;
  }
}
