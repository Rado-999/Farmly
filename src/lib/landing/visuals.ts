/** Local media paths + remote fallbacks until farmer media is ready. */

export const landingImages = {
  heroPoster: {
    src: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=2400&q=85&auto=format&fit=crop",
    alt: "Зlatна сутрешна светлина над тихо поле",
  },
  morningFog: {
    src: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1800&q=85&auto=format&fit=crop",
    alt: "Мъгла над зелени редове в зora",
  },
  handsSoil: {
    src: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1800&q=85&auto=format&fit=crop",
    alt: "Ръце, които докосват жива почва",
  },
  greenhouse: {
    src: "https://images.unsplash.com/photo-1534723328310-e82dad3ee43f?w=1800&q=85&auto=format&fit=crop",
    alt: "Топла светлина в оранжерия",
  },
  fieldRows: {
    src: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1800&q=85&auto=format&fit=crop",
    alt: "Зелени редове култури при мека светлина",
  },
  oldWood: {
    src: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1800&q=85&auto=format&fit=crop",
    alt: "Старa дървена конструкция на ферма",
  },
} as const;

/** Drop hero-dawn.mp4 in public/landing/ — component falls back to poster + Ken Burns */
export const landingHeroVideo = {
  src: "/landing/hero-dawn.mp4",
  poster: landingImages.heroPoster.src,
} as const;

/** @deprecated Use landingImages.heroPoster */
export const landingHeroImage = landingImages.heroPoster;

/** @deprecated Use landingImages.fieldRows */
export const landingAtmosphereImage = landingImages.fieldRows;

export const discoverHeroImage = landingImages.fieldRows;
