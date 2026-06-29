import type { Locale } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/translate";

type VillageRelationshipStatsProps = {
  locale: Locale;
  followingCount: number;
  followerCount?: number | null;
  showFollowerCount?: boolean;
  className?: string;
};

function getFollowingLabel(count: number, locale: Locale): string {
  return translate(
    locale,
    count === 1 ? "ферма в селото ти" : "ферми в селото ти",
    count === 1 ? "farm in your village" : "farms in your village",
  );
}

function getFollowerLabel(count: number, locale: Locale): string {
  return translate(
    locale,
    count === 1 ? "село с фермата ти" : "села с фермата ти",
    count === 1 ? "village with your farm" : "villages with your farm",
  );
}

function StatPill({ value, label }: { value: number; label: string }) {
  return (
    <div
      className="flex w-full max-w-md items-baseline gap-3 rounded-2xl bg-loam-100/90 px-5 py-4 ring-1 ring-loam-300/45"
      aria-label={label}
    >
      <span className="editorial-serif shrink-0 text-[2.75rem] leading-none font-medium tabular-nums tracking-tight text-moss-900 sm:text-5xl">
        {value}
      </span>
      <span className="min-w-0 text-base leading-snug text-stone-600">{label}</span>
    </div>
  );
}

export function VillageRelationshipStats({
  locale,
  followingCount,
  followerCount = null,
  showFollowerCount = false,
  className = "",
}: VillageRelationshipStatsProps) {
  const showFollowing = followingCount > 0;
  const showFollowers =
    showFollowerCount && followerCount != null && followerCount > 0;

  if (!showFollowing && !showFollowers) {
    return null;
  }

  return (
    <div
      className={`flex flex-col gap-3 ${className}`}
      aria-label={translate(
        locale,
        "Твоите връзки в селото",
        "Your village relationships",
      )}
    >
      {showFollowing ? (
        <StatPill
          value={followingCount}
          label={getFollowingLabel(followingCount, locale)}
        />
      ) : null}
      {showFollowers ? (
        <StatPill
          value={followerCount}
          label={getFollowerLabel(followerCount, locale)}
        />
      ) : null}
    </div>
  );
}
