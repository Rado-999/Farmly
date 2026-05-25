import type { FarmerImage, FarmerVideo } from "@/lib/farmers/types";

const gradientPalettes = [
  { from: "#3d5238", to: "#1f3022" },
  { from: "#5c4a32", to: "#2a241c" },
  { from: "#6b5a42", to: "#3a3024" },
  { from: "#4a5c3f", to: "#2f4530" },
  { from: "#7a5c3e", to: "#4a3828" },
  { from: "#526848", to: "#2a3a28" },
];

export function getGradientForSeed(seed: string) {
  const index =
    seed.split("").reduce((total, character) => total + character.charCodeAt(0), 0) %
    gradientPalettes.length;

  return gradientPalettes[index];
}

export function createFarmerImage(
  alt: string,
  imageUrl: string | null | undefined,
  seed: string,
): FarmerImage {
  const gradient = getGradientForSeed(seed);

  return {
    alt,
    imageUrl: imageUrl ?? null,
    gradientFrom: gradient.from,
    gradientTo: gradient.to,
  };
}

export function mapVideoStage(
  type: string | null | undefined,
): FarmerVideo["stage"] {
  switch (type) {
    case "planting":
      return "planting";
    case "harvest":
    case "harvesting":
      return "harvesting";
    case "growing":
      return "growing";
    default:
      return "daily";
  }
}

export function formatVideoStage(stage: FarmerVideo["stage"]): string {
  switch (stage) {
    case "planting":
      return "Засаждане";
    case "growing":
      return "Растеж";
    case "harvesting":
      return "Жътва";
    case "daily":
      return "Ежедневие";
    default:
      return stage;
  }
}

export function formatPrice(price: number | string | null | undefined) {
  if (price === null || price === undefined || price === "") {
    return "Сезонна цена";
  }

  const amount = typeof price === "number" ? price : Number.parseFloat(price);

  if (Number.isNaN(amount)) {
    return String(price);
  }

  return new Intl.NumberFormat("bg-BG", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

const PRICE_UNIT_LABELS: Record<string, string> = {
  kg: "кг",
  box: "кутия",
  l: "л",
  piece: "брой",
};

export function formatPriceUnitLabel(unit: string | null | undefined) {
  if (!unit) {
    return "кг";
  }

  return PRICE_UNIT_LABELS[unit] ?? unit;
}

export function formatPriceWithUnit(
  price: number | string | null | undefined,
  unit: string | null | undefined,
) {
  const formatted = formatPrice(price);

  if (formatted === "Сезонна цена") {
    return formatted;
  }

  return `${formatted} / ${formatPriceUnitLabel(unit)}`;
}

export function formatSeason(season: string | null | undefined) {
  if (!season) {
    return "Сезонна наличност";
  }

  return `${season.charAt(0).toUpperCase()}${season.slice(1)} — жътва`;
}

export function formatReviewDate(value: string | null | undefined) {
  if (!value) {
    return "Наскоро";
  }

  return new Intl.DateTimeFormat("bg-BG", {
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function formatExperienceYears(
  years: number | null | undefined,
) {
  if (years === null || years === undefined || years <= 0) {
    return null;
  }

  if (years === 1) {
    return "1 година на земята";
  }

  return `${years} години на земята`;
}

export function formatLocation(
  location: string | null | undefined,
  region: string | null | undefined,
) {
  if (location && region) {
    return `${location}, ${region}, България`;
  }

  if (location) {
    return `${location}, България`;
  }

  if (region) {
    return `${region}, България`;
  }

  return "България";
}

export function formatVideoType(type: string | null | undefined) {
  if (!type) {
    return "Видео история";
  }

  return type
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
