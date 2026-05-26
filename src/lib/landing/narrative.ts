/** Emotional beats — FEEL → TRUST → COMMERCE. Not a conversion funnel. */

import type { Locale } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/translate";

export type AtmosphereChapter = {
  id: string;
  kicker: string;
  title: string;
  body: string;
  caption?: string;
  imageKey: keyof typeof import("@/lib/landing/visuals").landingImages;
  align?: "left" | "right";
  tone?: "mist" | "depth" | "dawn";
};

export type HeroVideoIdea = {
  title: string;
  description: string;
  mood: string[];
};

export type SoundscapeIdea = {
  name: string;
  description: string;
  when: string;
};

export function getHeroCopy(locale: Locale) {
  return {
    whisper: translate(locale, "Преди зората", "Before sunrise"),
    headline: translate(
      locale,
      "Тук храната помни ръцете, които я отглеждат.",
      "Food remembers the hands that grow it here.",
    ),
    subline: translate(
      locale,
      "Не магазин. Не приложение. Сутрешна мъгла, дървена врата, куче, което тича напред — и човек, който те посреща без бързане.",
      "Not a store. Not an app. Morning fog, a wooden gate, a dog running ahead, and a person who greets you without rushing.",
    ),
  } as const;
}

export function getAtmosphereChapters(locale: Locale): AtmosphereChapter[] {
  return [
    {
      id: "morning-fog",
      kicker: translate(locale, "Сутрешна мъгла", "Morning fog"),
      title: translate(locale, "Полето се събужда преди нас.", "The field wakes before we do."),
      body: translate(
        locale,
        "Вятърът носи миризма на влажна почва. Слънце, което още не е решило дали да излезе. Това е началото — не на покупка, а на присъствие.",
        "The wind carries the smell of wet soil. Sunlight that still has not decided whether to appear. This is the beginning of presence, not a purchase.",
      ),
      caption: translate(
        locale,
        "Несъвършена светлина. Истински ръце. Сезон, който почти можеш да помиришеш.",
        "Imperfect light. Real hands. A season you can almost smell.",
      ),
      imageKey: "morningFog",
      align: "right",
      tone: "mist",
    },
    {
      id: "hands-soil",
      kicker: translate(locale, "Ръце в земята", "Hands in the soil"),
      title: translate(
        locale,
        "Доверието започва там, където пръстите докосват почвата.",
        "Trust begins where fingers touch the soil.",
      ),
      body: translate(
        locale,
        "Не сертификат. Не етикет. Времето по кожата, кал по ботушите, същите редове през пролет и жътва — доказателство, което не може да се фалшифицира.",
        "Not a certificate. Not a label. Time on the skin, mud on the boots, the same rows through spring and harvest. Proof that cannot be faked.",
      ),
      imageKey: "handsSoil",
      align: "left",
      tone: "dawn",
    },
    {
      id: "village-calm",
      kicker: translate(locale, "Селска тишина", "Village quiet"),
      title: translate(
        locale,
        "Куче по пътя. Старо дърво. Оранжерия, която диша.",
        "A dog on the road. An old tree. A greenhouse that breathes.",
      ),
      body: translate(
        locale,
        "Селото не се представя. То просто е там — бавно, топло, истинско. Farmly е начин да влезеш внутри, без да развалиш спокойствието.",
        "The village does not introduce itself. It is simply there: slow, warm, real. Farmly is a way to step inside without disturbing the calm.",
      ),
      caption: translate(
        locale,
        "Вятър в листата. Далечен лай. Момент, който не иска нищо от теб.",
        "Wind in the leaves. A distant bark. A moment that asks nothing from you.",
      ),
      imageKey: "greenhouse",
      align: "right",
      tone: "mist",
    },
  ];
}

/** Future hero background videos — drop files at paths in visuals.ts */
export const heroVideoIdeas: HeroVideoIdea[] = [
  {
    title: "Мъгла над нива",
    description:
      "Static wide shot, 4K, 24fps. Slow lateral drift. No people visible — only fog lifting over green rows as first light breaks.",
    mood: ["morning fog", "fields", "calm", "nostalgia"],
  },
  {
    title: "Ръце в почва",
    description:
      "Extreme close-up, shallow depth of field. Hands pressing soil, turning a root. Natural sound only. Hold 8–12 seconds, loop seamlessly.",
    mood: ["hands", "soil", "trust", "intimacy"],
  },
  {
    title: "Дървена врата се отваря",
    description:
      "POV walking toward an old wooden farm gate. Dog runs ahead. Soft golden hour. Handheld but stabilized — human, not shaky.",
    mood: ["old wood", "dogs", "arrival", "warmth"],
  },
  {
    title: "Оранжерия на зора",
    description:
      "Condensation on glass, breath visible inside. Sun rays through leaves. Slow pan across tomato vines. Peaceful greenhouse silence.",
    mood: ["greenhouse", "sunlight", "slow moments", "green"],
  },
];

/** Sound direction for future mobile app — ambient, never promotional */
export const soundscapeIdeas: SoundscapeIdea[] = [
  {
    name: "Сутрешна мъгла",
    description: "Distant birds, soft wind through rows, no music.",
    when: "App open / homepage hero",
  },
  {
    name: "Пътека до фермата",
    description: "Footsteps on gravel, dog collar, wooden gate creak.",
    when: "Navigating to a farmer profile",
  },
  {
    name: "Оранжерия",
    description: "Humid quiet, drip irrigation, leaf rustle.",
    when: "Watching greenhouse videos",
  },
  {
    name: "Жътва",
    description: "Scissors on stems, basket wood, distant conversation.",
    when: "Seasonal harvest section",
  },
];
