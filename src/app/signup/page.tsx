import type { Metadata } from "next";

import { SignupForm } from "@/components/auth/signup-form";
import { getServerLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();

  return {
    title: translate(locale, "Създай акаунт | Farmly", "Create account | Farmly"),
    description: translate(
      locale,
      "Създайте акаунт в Farmly, за да откривате местна храна и по желание да станете фермер по-късно.",
      "Create a Farmly account to discover local food and optionally become a farmer later.",
    ),
  };
}

export default function SignupPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 page-y">
      <SignupForm />
    </main>
  );
}
