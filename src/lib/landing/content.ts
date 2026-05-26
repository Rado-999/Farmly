import type { HowItWorksStep } from "@/lib/landing/types";
import type { Locale } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/translate";

/** Narrative beats — not a conversion funnel. */
export function getVillageJourneyBeats(locale: Locale): HowItWorksStep[] {
  return [
    {
      step: 1,
      title: translate(locale, "Пристигни без бързане", "Arrive without rushing"),
      description: translate(
        locale,
        "Нека земята те посрещне първа. Мъгла, почва, дървени врати, кучета, които тичат напред — селото се отваря бавно.",
        "Let the land greet you first. Fog, soil, wooden gates, dogs running ahead. The village opens slowly.",
      ),
    },
    {
      step: 2,
      title: translate(
        locale,
        "Гледай как някой отглежда храната ти",
        "Watch someone grow your food",
      ),
      description: translate(
        locale,
        "Видеото е началото на доверието тук. Времето по лицето, ръце в земята, сезони, които се променят на живо.",
        "Video is where trust begins here. Time on the face, hands in the soil, seasons changing in real time.",
      ),
    },
    {
      step: 3,
      title: translate(locale, "Познай човека зад жътвата", "Know the person behind the harvest"),
      description: translate(
        locale,
        "Име, място, глас. Когато историята звучи истински, следването на една ферма идва естествено — покупката може да изчака.",
        "A name, a place, a voice. When the story sounds real, following a farm feels natural and the purchase can wait.",
      ),
    },
  ];
}
