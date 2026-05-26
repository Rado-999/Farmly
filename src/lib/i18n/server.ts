import "server-only";

import { cookies } from "next/headers";

import {
  type Locale,
  LOCALE_COOKIE_NAME,
  resolveLocale,
} from "@/lib/i18n/config";

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();

  return resolveLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);
}
