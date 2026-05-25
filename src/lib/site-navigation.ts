export type SiteNavLink = {
  href: string;
  label: string;
};

export const mainNavLinks: SiteNavLink[] = [
  { href: "/discover", label: "Открий" },
  { href: "/farmers", label: "Фермери" },
];

export const footerExploreLinks: SiteNavLink[] = [
  { href: "/discover", label: "Открий" },
  { href: "/farmers", label: "Фермери" },
];

export const footerAccountLinks: SiteNavLink[] = [
  { href: "/login", label: "Вход" },
  { href: "/signup", label: "Регистрация" },
];
