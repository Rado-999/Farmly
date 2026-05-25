/** Subtle village timestamps — calm, not social-media precise. */
export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) {
    return "наскоро";
  }

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "наскоро";
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return "днес";
  }

  if (diffDays === 1) {
    return "вчера";
  }

  if (diffDays < 7) {
    return `преди ${diffDays} дни`;
  }

  if (diffDays < 14) {
    return "тази седмица";
  }

  if (diffDays < 45) {
    return "този месец";
  }

  return new Intl.DateTimeFormat("bg-BG", {
    month: "long",
    day: "numeric",
  }).format(date);
}
