import type { HowItWorksStep } from "@/lib/landing/types";
import type { Locale } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/translate";

/** Narrative beats — not a conversion funnel. */
export function getVillageJourneyBeats(locale: Locale): HowItWorksStep[] {
  return [
    {
      step: 1,
      title: translate(locale, "Разгледай спокойно", "Browse at your own pace"),
      description: translate(
        locale,
        "Започни с разходка из селото. Виж ферми, гледай видеа, виж какво правят тази седмица.",
        "Start with a walk through the village. See farms, watch videos, read what they are up to this week.",
      ),
    },
    {
      step: 2,
      title: translate(
        locale,
        "Гледай видеата от полето",
        "Watch videos from the field",
      ),
      description: translate(
        locale,
        "Фермерите качват кратки клипове — посаждане, жътва, ежедневна работа. Така разбираш как работят, преди да ги добавиш в селото си.",
        "Farmers upload short clips: planting, harvest, daily work. That is how you understand how they farm before you add them to your village.",
      ),
    },
    {
      step: 3,
      title: translate(locale, "Добави в селото, когато си готов", "Add to your village when you are ready"),
      description: translate(
        locale,
        "Когато намериш някой, при когото искаш да се върнеш, добави го в селото си. Без натиск — купуването може да изчака.",
        "When you find someone you want to return to, add them to your village. No pressure — buying can wait.",
      ),
    },
  ];
}
