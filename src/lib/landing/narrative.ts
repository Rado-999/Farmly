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
    whisper: translate(locale, "Местна храна", "Local food"),
    headline: translate(
      locale,
      "Знаеш кой отглежда храната ти.",
      "Know who grows your food.",
    ),
    subline: translate(
      locale,
      "Farmly е място да видиш български фермери, да чуеш историите им и да разбереш откъде идва храната ти.",
      "Farmly is where you meet Bulgarian farmers, hear their stories, and see where your food comes from. No catalog, no rush.",
    ),
  } as const;
}

export function getAtmosphereChapters(locale: Locale): AtmosphereChapter[] {
  return [
    {
      id: "morning-fog",
      kicker: translate(locale, "На полето", "In the field"),
      title: translate(
        locale,
        "Видеа и бележки от фермата",
        "Videos and notes from the farm",
      ),
      body: translate(
        locale,
        "Фермерите споделят как работят — какво садят, какво берат, какво се случва тази седмица. Гледаш ги в действие",
        "Farmers share how they work: what they plant, what they harvest, what is happening this week. You see them in action before you decide whether to add them to your village.",
      ),
      caption: translate(
        locale,
        "Реални фермери, реални полета. Всичко е заснето на място.",
        "Real people, real fields. Everything is filmed on location.",
      ),
      imageKey: "morningFog",
      align: "right",
      tone: "mist",
    },
    {
      id: "hands-soil",
      kicker: translate(locale, "Доверие", "Trust"),
      title: translate(
        locale,
        "Доверието идва, когато виждаш работата с очите си",
        "Trust comes when you see the work yourself",
      ),
      body: translate(
        locale,
        "Сертификатите са полезни, но не заместват срещата с човека. Тук виждаш фермера в полето и сам решаваш на кого да се довериш.",
        "Certificates help, but they do not replace meeting the person. Here you see the farmer in the field and decide for yourself who to trust.",
      ),
      imageKey: "handsSoil",
      align: "left",
      tone: "dawn",
    },
    {
      id: "village-calm",
      kicker: translate(locale, "Моето село", "My village"),
      title: translate(
        locale,
        "Място за хората, които вече познаваш",
        "A home for the farmers you already know",
      ),
      body: translate(
        locale,
        "Когато намериш фермер, при когото искаш да се върнеш, запази го в селото си. Там виждаш новите им бележки и видеа.",
        "When you find a farmer you want to return to, save them in your village. That is where you see their new notes and videos, without notifications or noise.",
      ),
      caption: translate(
        locale,
        "Вкусът е там, където храната е истинска. Без добавки, без химически вещества, без изкуствени цветове — истинска храна.",
        "The taste is where the food is real. No additives, no chemicals, no artificial colours — just real food.",
      ),
      imageKey: "villageHome",
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
