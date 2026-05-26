import Link from "next/link";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { getLayoutViewer } from "@/lib/auth/server";
import { getServerLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";
import { HeaderAuth } from "@/components/layout/header-auth";
import { MainNav } from "@/components/layout/main-nav";

export async function Header() {
  const viewer = await getLayoutViewer();
  const locale = await getServerLocale();

  return (
    <header className="sticky top-0 z-50 shrink-0 border-b border-stone-400/25 bg-cream/90 backdrop-blur-sm">
      <div className="page-shell-wide flex items-center justify-between gap-4 py-4 sm:py-5">
        <div className="flex min-w-0 items-center gap-6 lg:gap-10">
          <Link
            href="/"
            className="editorial-serif text-xl font-medium tracking-tight text-forest-deep transition-colors duration-500 hover:text-forest"
          >
            Farmly
          </Link>

          <nav
            aria-label={translate(locale, "Основна навигация", "Primary navigation")}
            className="hidden items-center gap-6 md:flex"
          >
            <MainNav isAuthenticated={viewer.status === "authenticated"} />
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />

          <details className="group relative md:hidden">
            <summary className="list-none text-sm font-medium text-stone-700 transition-colors duration-300 hover:text-forest [&::-webkit-details-marker]:hidden">
              {translate(locale, "Меню", "Menu")}
            </summary>
            <nav
              aria-label={translate(locale, "Мобилна навигация", "Mobile navigation")}
              className="absolute right-0 mt-3 min-w-44 rounded-sm border border-stone-300/50 bg-mist/95 p-3 shadow-[0_20px_44px_-24px_rgba(26,22,16,0.28)] backdrop-blur-sm"
            >
              <MainNav
                variant="menu"
                isAuthenticated={viewer.status === "authenticated"}
              />
            </nav>
          </details>

          <HeaderAuth viewer={viewer} />
        </div>
      </div>
    </header>
  );
}
