import Link from "next/link";

import { MediaPanel } from "@/components/ui/media-panel";
import type { VillageFeedItem } from "@/lib/feed/types";
import { formatRelativeTime } from "@/lib/feed/format-relative-time";

const rowClassName =
  "grid gap-5 px-4 py-8 sm:grid-cols-[minmax(0,1fr)_9.5rem] sm:items-center sm:gap-x-10 sm:gap-y-5 sm:px-6 lg:px-8";

function typeKicker(type: VillageFeedItem["type"]): string {
  switch (type) {
    case "video":
      return "Полска история";
    case "harvest":
      return "Жътва";
    case "season":
      return "Сезон";
    case "event":
      return "Среща в селото";
    case "post":
    default:
      return "От полето";
  }
}

function ctaLabel(type: VillageFeedItem["type"]): string {
  switch (type) {
    case "video":
      return "Гледай историята";
    case "harvest":
      return "Виж от реколтата";
    case "event":
      return "Научи повече";
    case "season":
      return "Разгледай сезона";
    case "post":
    default:
      return "Прочети бележката";
  }
}

type VillageFeedListProps = {
  items: VillageFeedItem[];
};

export function VillageFeedList({ items }: VillageFeedListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ul className="m-0 list-none space-y-0 p-0">
      {items.map((item) => {
        const kicker = [typeKicker(item.type), item.farmer_name]
          .filter(Boolean)
          .join(" · ");
        const timeLabel = formatRelativeTime(item.created_at);

        return (
          <li
            key={item.id}
            className="border-t border-stone-300/45 first:border-t-0"
          >
            <Link
              href={item.href}
              className={`${rowClassName} group block transition-colors duration-300 hover:bg-forest/[0.04]`}
            >
              <div className="stack-tight min-w-0">
                <p className="text-sm font-medium tracking-wide text-clay">
                  {kicker}
                  {timeLabel ? ` · ${timeLabel}` : ""}
                </p>
                <h4 className="editorial-serif text-2xl text-forest-deep sm:text-3xl">
                  {item.title ?? item.farmer_name}
                </h4>
                {item.season ? (
                  <p className="text-sm text-soil">{item.season}</p>
                ) : null}
                {item.description ? (
                  <p className="line-clamp-2 text-sm leading-7 text-stone-700/90 sm:text-base">
                    {item.description}
                  </p>
                ) : null}
                <span className="story-link mt-1 text-sm">{ctaLabel(item.type)}</span>
              </div>
              <MediaPanel
                from="#3d5238"
                to="#1f3022"
                label={item.title ?? item.farmer_name}
                imageUrl={item.image}
                interactive
                className="aspect-square w-full max-w-[9.5rem] shrink-0 justify-self-end rounded-sm sm:max-h-36"
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
