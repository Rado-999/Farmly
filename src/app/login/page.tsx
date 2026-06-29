import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { AuthCard } from "@/components/auth/auth-card";
import { getServerLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();

  return {
    title: translate(locale, "Вход | Farmly", "Log in | Farmly"),
    description: translate(
      locale,
      "Влез в Farmly, за да добавяш ферми в селото си и да виждаш новостите им.",
      "Log in to Farmly to add farms to your village and see their updates.",
    ),
  };
}

export default async function LoginPage() {
  const locale = await getServerLocale();

  return (
    <main className="flex flex-1 items-center justify-center px-4 page-y">
      <Suspense
        fallback={
          <AuthCard
            title={translate(locale, "Добре дошли отново", "Welcome back")}
            message={translate(locale, "Зареждане на входа...", "Loading sign in...")}
          >
            <div className="h-40 animate-pulse rounded-2xl bg-stone-100/90" />
          </AuthCard>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
