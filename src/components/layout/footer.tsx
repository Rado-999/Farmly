import Link from "next/link";

import {
  getFooterAccountLinks,
  getFooterExploreLinks,
} from "@/lib/site-navigation";
import { getServerLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";

const footerLinkClassName =
  "text-sm text-stone-700/90 transition-colors duration-500 hover:text-forest";

function FooterLinkGroup({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h2 className="text-xs font-medium tracking-[0.12em] text-soil uppercase">
        {title}
      </h2>
      <ul className="mt-4 stack-tight">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className={footerLinkClassName}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function Footer() {
  const locale = await getServerLocale();
  const footerExploreLinks = getFooterExploreLinks(locale);
  const footerAccountLinks = getFooterAccountLinks(locale);

  return (
    <footer className="mt-auto border-t border-stone-400/30 bg-[linear-gradient(180deg,#e0d8c8_0%,#e8e2d4_100%)]">
      <div className="page-shell-wide page-y">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.5fr)_repeat(2,minmax(0,1fr))] lg:gap-12">
          <div className="stack-tight">
            <Link
              href="/"
              className="editorial-serif inline-block text-xl font-medium text-forest-deep transition-colors duration-300 hover:text-forest"
            >
              Farmly
            </Link>
            <p className="max-w-sm text-sm leading-7 text-stone-700/90">
              {translate(
                locale,
                "Спокойна дигитална провинция — истински ферми, истински хора, истински сезони. Създадено за принадлежност, преди покупката.",
                "A calm digital countryside with real farms, real people, and real seasons. Built for belonging before the purchase.",
              )}
            </p>
          </div>

          <FooterLinkGroup
            title={translate(locale, "Открий", "Explore")}
            links={footerExploreLinks}
          />
          <FooterLinkGroup
            title={translate(locale, "Акаунт", "Account")}
            links={footerAccountLinks}
          />
        </div>

        <div className="mt-10 border-t border-stone-400/25 pt-6 text-sm text-stone-600/80 lg:mt-12">
          <p>&copy; {new Date().getFullYear()} Farmly</p>
        </div>
      </div>
    </footer>
  );
}
