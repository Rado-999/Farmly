export const FARMING_TYPE_OPTIONS = [
  "Органично",
  "Традиционно",
  "Семейна ферма",
  "Зеленчуци",
  "Овощни градини",
  "Животновъдство",
  "Млечни продукти",
  "Билки",
  "Мед",
  "Лозе",
  "Оранжерия",
  "Регенеративно",
] as const;

export type FarmingType = (typeof FARMING_TYPE_OPTIONS)[number];
