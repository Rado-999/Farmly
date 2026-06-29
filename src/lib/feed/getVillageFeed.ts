import {
  createFarmerImage,
  formatLocation,
  formatSeason,
} from "@/lib/data/formatters";
import type {
  VillageFeedItem,
  VillageFeedSections,
} from "@/lib/feed/types";
import {
  FARMER_PROFILE_SELECT,
  getFarmerRowAvatarUrl,
  getFarmerRowName,
} from "@/lib/farmers/farmer-profile-row";
import { queryDatabaseError, type QueryResult } from "@/lib/errors/query-result";
import { ok } from "@/lib/errors/result";
import { shouldShowSinceYouWereHere } from "@/lib/village/visit";
import type { FarmerProfileRow } from "@/lib/supabase/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

const MAX_TOTAL_ITEMS = 15;
const MAX_PER_FARMER = 2;
const FETCH_POOL = 40;
const EVENT_WINDOW_DAYS = 14;

type FarmerMeta = {
  id: string;
  slug: string;
  name: string;
  location: string;
  bio: string;
  region: string | null;
  tier: 1;
  imageUrl: string | null;
  gradientFrom: string;
  gradientTo: string;
};

function unwrapFarmer<T>(row: T | T[] | null): T | null {
  if (!row) {
    return null;
  }

  return Array.isArray(row) ? (row[0] ?? null) : row;
}

function mapFarmerMeta(farmer: FarmerProfileRow): FarmerMeta {
  const name = getFarmerRowName(farmer);
  const image = createFarmerImage(
    `${name} profile`,
    getFarmerRowAvatarUrl(farmer) ?? farmer.cover_image_url,
    farmer.id,
  );

  return {
    id: farmer.id,
    slug: farmer.slug,
    name,
    location: formatLocation(farmer.location, farmer.region),
    bio: farmer.bio ?? farmer.story ?? "",
    region: farmer.region,
    tier: 1,
    imageUrl: image.imageUrl ?? null,
    gradientFrom: image.gradientFrom,
    gradientTo: image.gradientTo,
  };
}

function parseTime(value: string | null | undefined): number {
  if (!value) {
    return 0;
  }

  const t = new Date(value).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function sortItems(items: VillageFeedItem[]): VillageFeedItem[] {
  return [...items].sort((a, b) => {
    if (a.source_tier !== b.source_tier) {
      return a.source_tier - b.source_tier;
    }

    return parseTime(b.created_at) - parseTime(a.created_at);
  });
}

function applyCaps(items: VillageFeedItem[]): VillageFeedItem[] {
  const sorted = sortItems(items);
  const perFarmer = new Map<string, number>();
  const result: VillageFeedItem[] = [];

  for (const item of sorted) {
    const count = perFarmer.get(item.farmer_id) ?? 0;
    if (count >= MAX_PER_FARMER) {
      continue;
    }

    if (result.length >= MAX_TOTAL_ITEMS) {
      break;
    }

    perFarmer.set(item.farmer_id, count + 1);
    result.push(item);
  }

  return result;
}

function isAfterVisit(createdAt: string, lastVisitedAt: string | null): boolean {
  if (!lastVisitedAt) {
    return false;
  }

  return parseTime(createdAt) > parseTime(lastVisitedAt);
}

type VillageFeedItemCore = Pick<
  VillageFeedItem,
  "type" | "id" | "created_at" | "title" | "description" | "image" | "season" | "href"
>;

function buildItem(
  partial: VillageFeedItemCore & { source_tier?: 1 },
  farmer: FarmerMeta,
): VillageFeedItem {
  return {
    ...partial,
    farmer_id: farmer.id,
    farmer_slug: farmer.slug,
    farmer_name: farmer.name,
    source_tier: partial.source_tier ?? farmer.tier,
  };
}

/**
 * Finite personalized village feed for /village.
 * Followed farmers first, saved-only second, region-aware, hard-capped.
 */
export async function getVillageFeed(
  supabase: SupabaseClient,
  userId: string,
  options?: { lastVisitedAt?: string | null; region?: string | null },
): Promise<QueryResult<VillageFeedSections>> {
  const [
    { data: profile, error: profileError },
    { data: followRows, error: followsError },
  ] =
    await Promise.all([
      options?.lastVisitedAt !== undefined && options?.region !== undefined
        ? Promise.resolve({
            data: {
              village_last_visited_at: options.lastVisitedAt,
              region: options.region,
            },
            error: null,
          })
        : supabase
            .from("profiles")
            .select("village_last_visited_at, region")
            .eq("id", userId)
            .maybeSingle(),
      supabase
        .from("follows")
        .select(`farmer_id, farmer_profiles (${FARMER_PROFILE_SELECT})`)
        .eq("user_id", userId),
    ]);

  if (profileError) {
    return queryDatabaseError(profileError.message);
  }

  if (followsError) {
    return queryDatabaseError(followsError.message);
  }

  const lastVisitedAt = profile?.village_last_visited_at ?? null;
  const userRegion = profile?.region ?? null;
  const showSinceYouWereHere = shouldShowSinceYouWereHere(lastVisitedAt);

  const farmerById = new Map<string, FarmerMeta>();

  for (const row of followRows ?? []) {
    const farmer = unwrapFarmer(
      (row as { farmer_profiles: FarmerProfileRow | FarmerProfileRow[] | null })
        .farmer_profiles,
    );
    if (farmer) {
      farmerById.set(farmer.id, mapFarmerMeta(farmer));
    }
  }

  const followedIds = new Set(farmerById.keys());
  const allFarmerIds = [...farmerById.keys()];

  if (allFarmerIds.length === 0) {
    return ok({
      showSinceYouWereHere: false,
      sinceYouWereHere: [],
      fromYourFarms: [],
      seasonNearYou: [],
      localGatherings: [],
      hasFollows: false,
      hasAnyContent: false,
    });
  }

  const now = new Date();
  const eventCutoff = new Date(now);
  eventCutoff.setDate(eventCutoff.getDate() + EVENT_WINDOW_DAYS);

  const [
    { data: postRows, error: postsError },
    { data: videoRows, error: videosError },
    { data: productRows, error: productsError },
    { data: eventRows, error: eventsError },
  ] = await Promise.all([
    allFarmerIds.length > 0
      ? supabase
          .from("posts")
          .select(
            "id, farmer_id, title, content, image_url, kind, season, created_at, published_at",
          )
          .in("farmer_id", allFarmerIds)
          .in("kind", ["field_note", "harvest", "season"])
          .order("created_at", { ascending: false })
          .limit(FETCH_POOL)
      : Promise.resolve({ data: [], error: null }),
    allFarmerIds.length > 0
      ? supabase
          .from("videos")
          .select(
            "id, farmer_id, title, description, poster_url, created_at",
          )
          .in("farmer_id", allFarmerIds)
          .order("created_at", { ascending: false })
          .limit(FETCH_POOL)
      : Promise.resolve({ data: [], error: null }),
    allFarmerIds.length > 0
      ? supabase
          .from("products")
          .select("id, farmer_id, title, description, season, images, created_at, published_at")
          .in("farmer_id", allFarmerIds)
          .eq("status", "published")
          .not("season", "is", null)
          .order("created_at", { ascending: false })
          .limit(FETCH_POOL)
      : Promise.resolve({ data: [], error: null }),
    userRegion
      ? supabase
          .from("local_events")
          .select(
            "id, farmer_id, title, description, kind, starts_at, image_url, location_label, region",
          )
          .eq("region", userRegion)
          .gte("starts_at", now.toISOString())
          .lte("starts_at", eventCutoff.toISOString())
          .order("starts_at", { ascending: true })
          .limit(8)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (postsError) {
    return queryDatabaseError(postsError.message);
  }

  if (videosError) {
    return queryDatabaseError(videosError.message);
  }

  if (productsError) {
    return queryDatabaseError(productsError.message);
  }

  if (eventsError) {
    return queryDatabaseError(eventsError.message);
  }

  const rawItems: VillageFeedItem[] = [];

  for (const post of postRows ?? []) {
    const farmer = farmerById.get(post.farmer_id);
    if (!farmer || farmer.tier !== 1) {
      continue;
    }

    const text = post.content?.trim() || post.title?.trim();
    if (!text) {
      continue;
    }

    const createdAt =
      post.published_at ?? post.created_at ?? new Date(0).toISOString();
    const feedType =
      post.kind === "harvest"
        ? "harvest"
        : post.kind === "season"
          ? "season"
          : "post";

    rawItems.push(
      buildItem(
        {
          type: feedType,
          id: `post-${post.id}`,
          created_at: createdAt,
          title: post.title ?? text.slice(0, 80),
          description: text,
          image: post.image_url,
          season: post.season ? formatSeason(post.season) : undefined,
          href: `/farmers/${farmer.slug}`,
        },
        farmer,
      ),
    );
  }

  for (const video of videoRows ?? []) {
    const farmer = farmerById.get(video.farmer_id ?? "");
    if (!farmer || farmer.tier !== 1) {
      continue;
    }

    rawItems.push(
      buildItem(
        {
          type: "video",
          id: `video-${video.id}`,
          created_at: video.created_at ?? new Date(0).toISOString(),
          title: video.title ?? "Полска история",
          description: video.description ?? undefined,
          image: video.poster_url,
          href: `/farmers/${farmer.slug}#videos`,
        },
        farmer,
      ),
    );
  }

  for (const product of productRows ?? []) {
    const farmer = farmerById.get(product.farmer_id ?? "");
    if (!farmer || farmer.tier !== 1) {
      continue;
    }

    const createdAt =
      product.published_at ?? product.created_at ?? new Date(0).toISOString();

    rawItems.push(
      buildItem(
        {
          type: "harvest",
          id: `harvest-${product.id}`,
          created_at: createdAt,
          title: product.title,
          description: product.description ?? undefined,
          image: product.images?.[0] ?? null,
          season: formatSeason(product.season),
          href: `/farmers/${farmer.slug}/products/${product.id}`,
        },
        farmer,
      ),
    );
  }

  const capped = applyCaps(rawItems);

  const sinceYouWereHere =
    showSinceYouWereHere && lastVisitedAt
      ? capped.filter((item) => isAfterVisit(item.created_at, lastVisitedAt))
      : [];

  const sinceIds = new Set(sinceYouWereHere.map((item) => item.id));
  const fromYourFarms = capped.filter(
    (item) => item.source_tier === 1 && !sinceIds.has(item.id),
  );

  const seasonNearYou = fromYourFarms
    .filter((item) => item.type === "season" || item.type === "harvest")
    .slice(0, 4);

  const seasonIds = new Set(seasonNearYou.map((item) => item.id));
  const fromYourFarmsExSeason = fromYourFarms.filter(
    (item) => !seasonIds.has(item.id),
  );

  const localGatherings: VillageFeedItem[] = [];

  for (const event of eventRows ?? []) {
    const farmerId = event.farmer_id;
    if (farmerId && !followedIds.has(farmerId)) {
      continue;
    }

    const farmer = farmerId ? farmerById.get(farmerId) : null;
    const slug = farmer?.slug ?? "";
    const name = farmer?.name ?? "Общност";

    localGatherings.push({
      type: "event",
      id: `event-${event.id}`,
      farmer_id: farmerId ?? "community",
      farmer_slug: slug,
      farmer_name: name,
      created_at: event.starts_at,
      title: event.title,
      description: event.description ?? event.location_label ?? undefined,
      image: event.image_url,
      href: slug ? `/farmers/${slug}` : "/discover",
      source_tier: 1,
    });
  }

  const hasAnyContent =
    sinceYouWereHere.length > 0 ||
    fromYourFarmsExSeason.length > 0 ||
    seasonNearYou.length > 0 ||
    localGatherings.length > 0;

  return ok({
    showSinceYouWereHere: showSinceYouWereHere && sinceYouWereHere.length > 0,
    sinceYouWereHere,
    fromYourFarms: fromYourFarmsExSeason,
    seasonNearYou,
    localGatherings: localGatherings.slice(0, 4),
    hasFollows: followedIds.size > 0,
    hasAnyContent,
  });
}
