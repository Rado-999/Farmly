import type {
  VillageFeedItem,
  VillageFilm,
  VillageMoment,
  VillageWhisper,
} from "@/lib/discover/types";

const MAX_PATH_ITEMS = 10;
const MAX_WHISPERS = 4;

/**
 * A mixed trail of village life — films, seasons, whispers.
 * Not a farmer roster (that's VillageRing above).
 */
export function buildVillageFeed({
  films,
  moments,
  whispers,
}: {
  films: VillageFilm[];
  moments: VillageMoment[];
  whispers: VillageWhisper[];
}): VillageFeedItem[] {
  const trimmedWhispers = whispers.slice(0, MAX_WHISPERS);
  const feed: VillageFeedItem[] = [];
  const maxLength = Math.max(films.length, moments.length, trimmedWhispers.length, 1);

  for (let index = 0; index < maxLength && feed.length < MAX_PATH_ITEMS; index += 1) {
    const film = films[index];
    const moment = moments[index];
    const whisper = trimmedWhispers[index];

    if (film && feed.length < MAX_PATH_ITEMS) {
      feed.push({ kind: "film", id: `film-${film.id}`, film });
    }

    if (whisper && index % 2 === 1 && feed.length < MAX_PATH_ITEMS) {
      feed.push({ kind: "whisper", id: whisper.id, whisper });
    }

    if (moment && feed.length < MAX_PATH_ITEMS) {
      feed.push({ kind: "moment", id: `moment-${moment.id}`, moment });
    }
  }

  return feed;
}
