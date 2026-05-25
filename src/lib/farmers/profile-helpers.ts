import { formatVideoStage } from "@/lib/data/formatters";
import type {
  FarmerProduct,
  FarmerProfile,
  FarmerVideo,
} from "@/lib/farmers/types";

const VISIT_STORAGE_PREFIX = "farmly:farmer-visit:";

export type FarmerVisitSnapshot = {
  visitedAt: string;
  videoCount: number;
};

export function getFarmerVisitStorageKey(slug: string) {
  return `${VISIT_STORAGE_PREFIX}${slug}`;
}

export function readFarmerVisitSnapshot(
  slug: string,
): FarmerVisitSnapshot | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(getFarmerVisitStorageKey(slug));
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as FarmerVisitSnapshot;
    if (
      typeof parsed.visitedAt !== "string" ||
      typeof parsed.videoCount !== "number"
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function writeFarmerVisitSnapshot(
  slug: string,
  videoCount: number,
): void {
  if (typeof window === "undefined") {
    return;
  }

  const snapshot: FarmerVisitSnapshot = {
    visitedAt: new Date().toISOString(),
    videoCount,
  };

  window.localStorage.setItem(
    getFarmerVisitStorageKey(slug),
    JSON.stringify(snapshot),
  );
}

/** Videos are already ordered newest-first from the API. */
export function getFeaturedVideo(videos: FarmerVideo[]): FarmerVideo | null {
  return videos[0] ?? null;
}

export function getEpisodeStripVideos(
  videos: FarmerVideo[],
  max = 6,
): FarmerVideo[] {
  if (videos.length <= 1) {
    return [];
  }

  return videos.slice(1, max + 1);
}

export function getCurrentSeasonLabel(farmer: {
  products: FarmerProfile["products"];
  videos: FarmerProfile["videos"];
  region: string | null;
}): string | null {
  const fromProduct = farmer.products[0]?.availability;
  if (fromProduct && fromProduct !== "Сезонна наличност") {
    return fromProduct;
  }

  const featured = getFeaturedVideo(farmer.videos);
  if (featured) {
    return formatVideoStage(featured.stage);
  }

  return farmer.region;
}

export function formatFieldFilmDate(iso: string | null | undefined): string | null {
  if (!iso) {
    return null;
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("bg-BG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatLastUpdatedLabel(
  videos: FarmerVideo[],
  products: FarmerProduct[],
): string | null {
  const timestamps = [
    ...videos.map((video) => video.publishedAt).filter(Boolean),
    ...products.map((product) => product.availability),
  ] as string[];

  const latestVideo = videos.find((video) => video.publishedAt)?.publishedAt;
  if (latestVideo) {
    const formatted = formatFieldFilmDate(latestVideo);
    return formatted ? `Последна бележка · ${formatted}` : null;
  }

  if (timestamps.length > 0) {
    return "Активен сезон";
  }

  return null;
}

export function buildTrustRibbonLine(options: {
  isVerified: boolean;
  videoCount: number;
  region: string | null;
}): string {
  const parts: string[] = [];

  if (options.isVerified) {
    parts.push("Потвърдена самоличност");
  }

  if (options.videoCount > 0) {
    const filmWord =
      options.videoCount === 1 ? "полско видео" : "полски видеа";
    parts.push(`${options.videoCount} ${filmWord} този сезон`);
  }

  if (options.region) {
    parts.push(options.region);
  }

  if (parts.length === 0) {
    return "Ферма с отворена врата към общността";
  }

  return parts.join(" · ");
}

export function pickFeaturedTestimonies<T extends { id: string }>(
  items: T[],
  count = 3,
): T[] {
  return items.slice(0, count);
}

export function pickSeasonProducts(
  products: FarmerProduct[],
  count = 3,
): FarmerProduct[] {
  return products.slice(0, count);
}
