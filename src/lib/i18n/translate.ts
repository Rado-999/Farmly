import type { Locale } from "@/lib/i18n/config";

export function translate<T>(locale: Locale, bg: T, en: T): T {
  return locale === "en" ? en : bg;
}
