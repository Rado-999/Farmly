import Link from "next/link";

import type { DiscoverPersonalization } from "@/lib/discover/personalize";
import type { Locale } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/translate";

type DiscoverVillageCalloutProps = {
  locale: Locale;
  personalization: DiscoverPersonalization;
};

function formatInterestHint(
  locale: Locale,
  personalization: DiscoverPersonalization,
): string | null {
  const { interestLabels, userRegion } = personalization;

  if (interestLabels.length > 0 && userRegion) {
    return translate(
      locale,
      `Подредихме пътеката според ${interestLabels.join(", ")} и ${userRegion}.`,
      `We shaped the path around ${interestLabels.join(", ")} and ${userRegion}.`,
    );
  }

  if (interestLabels.length > 0) {
    return translate(
      locale,
      `Подредихме пътеката според интересите ти — ${interestLabels.join(", ")}.`,
      `We shaped the path around your interests — ${interestLabels.join(", ")}.`,
    );
  }

  if (userRegion) {
    return translate(
      locale,
      `Първо показваме ферми и истории от ${userRegion}.`,
      `We start with farms and stories from ${userRegion}.`,
    );
  }

  return null;
}

export function DiscoverVillageCallout({
  locale,
  personalization,
}: DiscoverVillageCalloutProps) {
  const interestHint = formatInterestHint(locale, personalization);

  return (
    <section className="border-b border-stone-400/25 bg-white/50">
      <div className="page-shell-wide flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:py-6">
        <div className="stack-tight max-w-2xl">
          <p className="text-[0.8125rem] font-medium uppercase tracking-[0.12em] text-soil">
            {translate(locale, "Разходка за теб", "A walk picked for you")}
          </p>
          <p className="text-sm leading-7 text-stone-700/90 sm:text-base">
            {translate(
              locale,
              "Тук откриваш нови ферми. За хората, които вече следиш, отвори Моето село.",
              "Discover new farms here. For the people you already follow, open My village.",
            )}
          </p>
          {interestHint ? (
            <p className="text-sm leading-7 text-stone-600">{interestHint}</p>
          ) : null}
        </div>

        {personalization.hasVillageHome ? (
          <Link href="/village" className="story-link shrink-0 text-base">
            {translate(locale, "Към Моето село", "Go to My village")}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
