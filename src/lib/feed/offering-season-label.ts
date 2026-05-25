/** Quiet seasonal kicker for feed offerings — not commerce urgency. */
export function getOfferingSeasonKicker(season: string | null | undefined): string {
  if (!season) {
    return "В сезон";
  }

  const normalized = season.toLowerCase();

  if (
    normalized.includes("harvest") ||
    normalized.includes("жътва") ||
    normalized.includes("reap")
  ) {
    return "Жътва";
  }

  return "В сезон";
}
