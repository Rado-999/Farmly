/** Emotional beats — FEEL → TRUST → COMMERCE. Not a conversion funnel. */

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

export const heroCopy = {
  whisper: "Преди зората",
  headline: "Тук храната помни ръцете, които я отглеждат.",
  subline:
    "Не магазин. Не приложение. Сутрешна мъгла, дървена врата, куче, което тича напред — и човек, който те посреща без бързане.",
} as const;

export const atmosphereChapters: AtmosphereChapter[] = [
  {
    id: "morning-fog",
    kicker: "Сутрешна мъгла",
    title: "Полето се събужда преди нас.",
    body: "Вятърът носи миризма на влажна почва. Слънце, което още не е решило дали да излезе. Това е началото — не на покупка, а на присъствие.",
    caption: "Несъвършена светлина. Истински ръце. Сезон, който почти можеш да помиришеш.",
    imageKey: "morningFog",
    align: "right",
    tone: "mist",
  },
  {
    id: "hands-soil",
    kicker: "Ръце в земята",
    title: "Доверието започва там, където пръстите докосват почвата.",
    body: "Не сертификат. Не етикет. Времето по кожата, кал по ботушите, същите редове през пролет и жътва — доказателство, което не може да се фалшифицира.",
    imageKey: "handsSoil",
    align: "left",
    tone: "dawn",
  },
  {
    id: "village-calm",
    kicker: "Селска тишина",
    title: "Куче по пътя. Старо дърво. Оранжерия, която диша.",
    body: "Селото не се представя. То просто е там — бавно, топло, истинско. Farmly е начин да влезеш внутри, без да развалиш спокойствието.",
    caption: "Вятър в листата. Далечен лай. Момент, който не иска нищо от теб.",
    imageKey: "greenhouse",
    align: "right",
    tone: "mist",
  },
];

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
