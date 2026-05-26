export const SUPPORTED_LOCALES = ["bg", "en"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "bg";
export const LOCALE_COOKIE_NAME = "farmly-locale";
export const LOCALE_STORAGE_KEY = "farmly-locale";

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "bg" || value === "en";
}

export function resolveLocale(value: string | null | undefined): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function getLocaleHtmlLang(locale: Locale): string {
  return locale === "en" ? "en" : "bg";
}

export function getLocaleDateFormat(locale: Locale): string {
  return locale === "en" ? "en-US" : "bg-BG";
}
