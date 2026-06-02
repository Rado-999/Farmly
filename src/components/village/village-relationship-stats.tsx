import type { Locale } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/translate";

type VillageRelationshipStatsProps = {
  locale: Locale;
  followingCount: number;
  savedCount?: number;
  followerCount?: number | null;
  className?: string;
};

function StatLine({ value, label }: { value: number; label: string }) {
  if (value <= 0) {
    return null;
  }

  return (
    <li>
      <span className="font-medium text-moss-800">{value}</span> {label}
    </li>
  );
}

function followingLabel(count: number, locale: Locale): string {
  if (locale === "bg") {
    return count === 1 ? "ферма, която следиш" : "ферми, които следиш";
  }

  return count === 1 ? "farm you follow" : "farms you follow";
}

function savedLabel(count: number, locale: Locale): string {
  if (locale === "bg") {
    return count === 1 ? "запазена ферма" : "запазени ферми";
  }

  return count === 1 ? "saved farm" : "saved farms";
}

function followerLabel(count: number, locale: Locale): string {
  if (locale === "bg") {
    return count === 1
      ? "човек следи твоя сезон"
      : "души следят твоя сезон";
  }

  return count === 1
    ? "person follows your season"
    : "people follow your season";
}

export function VillageRelationshipStats({
  locale,
  followingCount,
  savedCount = 0,
  followerCount = null,
  className = "",
}: VillageRelationshipStatsProps) {
  const hasBuyerStats = followingCount > 0 || savedCount > 0;
  const hasFollowerStats = followerCount != null && followerCount > 0;

  if (!hasBuyerStats && !hasFollowerStats) {
    return null;
  }

  return (
    <ul
      className={`flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm text-soil/90 sm:justify-start ${className}`}
      aria-label={translate(
        locale,
        "Твоите връзки в селото",
        "Your village relationships",
      )}
    >
      <StatLine value={followingCount} label={followingLabel(followingCount, locale)} />
      <StatLine value={savedCount} label={savedLabel(savedCount, locale)} />
      {followerCount != null && followerCount > 0 ? (
        <StatLine
          value={followerCount}
          label={followerLabel(followerCount, locale)}
        />
      ) : null}
    </ul>
  );
}
