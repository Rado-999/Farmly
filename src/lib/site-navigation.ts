import type { Locale } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/translate";

export type SiteNavLink = {
  href: string;
  label: string;
};

export function getMainNavLinks(locale: Locale): SiteNavLink[] {
  return [
    { href: "/discover", label: translate(locale, "Открий", "Discover") },
    { href: "/farmers", label: translate(locale, "Фермери", "Farmers") },
  ];
}

export function getFooterExploreLinks(locale: Locale): SiteNavLink[] {
  return [
    { href: "/discover", label: translate(locale, "Открий", "Discover") },
    { href: "/farmers", label: translate(locale, "Фермери", "Farmers") },
  ];
}

export function getFooterAccountLinks(locale: Locale): SiteNavLink[] {
  return [
    { href: "/login", label: translate(locale, "Вход", "Log in") },
    { href: "/signup", label: translate(locale, "Регистрация", "Sign up") },
  ];
}
