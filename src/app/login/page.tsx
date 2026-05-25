import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = {
  title: "Вход | Farmly",
  description:
    "Влезте в Farmly и се свържете отново с местни фермери, сезонни истории и истинска храна.",
};

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 page-y">
      <Suspense
        fallback={
          <AuthCard title="Добре дошли отново" message="Зареждане на входа...">
            <div className="h-40 animate-pulse rounded-2xl bg-stone-100/90" />
          </AuthCard>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
