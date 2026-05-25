"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { VILLAGE_PATH } from "@/lib/auth/constants";
import { useAuthSession } from "@/lib/auth/use-auth-session";
import { mainNavLinks } from "@/lib/site-navigation";

const navLinkClassName =
  "px-1 py-1 text-sm font-medium text-stone-700/90 transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-forest";

type MainNavProps = {
  /** Mobile dropdown vs desktop inline */
  variant?: "inline" | "menu";
};

export function MainNav({ variant = "inline" }: MainNavProps) {
  const pathname = usePathname();
  const auth = useAuthSession();

  const links = [...mainNavLinks];

  if (auth.status === "authenticated") {
    links.push({ href: VILLAGE_PATH, label: "Моето село" });
  }

  const linkClass =
    variant === "menu"
      ? "block py-2 text-sm font-medium text-stone-700 transition-colors duration-300 hover:text-forest"
      : navLinkClassName;

  return (
    <>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={pathname === link.href ? "page" : undefined}
          className={linkClass}
        >
          {link.label}
        </Link>
      ))}
    </>
  );
}
