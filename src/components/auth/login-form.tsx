"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";

import { AuthButton } from "@/components/auth/auth-button";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthInput } from "@/components/auth/auth-input";
import { useLocale } from "@/components/i18n/language-provider";
import type { AuthFieldErrors, LoginFormValues } from "@/lib/auth/types";
import { translate } from "@/lib/i18n/translate";
import { isSupabaseConfigured } from "@/lib/supabase";
import { loadSupabaseClient } from "@/lib/supabase/load-client";

const initialValues: LoginFormValues = {
  email: "",
  password: "",
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLocale();
  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] =
    useState<AuthFieldErrors<keyof LoginFormValues>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const { validateLoginForm } = await import("@/lib/auth/validation");
    const nextFieldErrors = validateLoginForm(values, locale);
    setFieldErrors(nextFieldErrors);

    if (Object.keys(nextFieldErrors).length > 0) {
      return;
    }

    if (!isSupabaseConfigured()) {
      setFormError(
        translate(
          locale,
          "Удостоверяването все още не е конфигурирано.",
          "Authentication is not configured yet.",
        ),
      );
      return;
    }

    const supabase = await loadSupabaseClient();

    if (!supabase) {
      setFormError(
        translate(
          locale,
          "Удостоверяването все още не е конфигурирано.",
          "Authentication is not configured yet.",
        ),
      );
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email.trim(),
      password: values.password,
    });

    if (error) {
      const { getAuthErrorMessage } = await import("@/lib/auth/messages");
      setIsLoading(false);
      setFormError(getAuthErrorMessage(error, locale));
      return;
    }

    if (data.user) {
      setTimeout(() => {
        void import("@/lib/auth/ensure-profile")
          .then(({ ensureProfileForAuthUser }) =>
            ensureProfileForAuthUser(supabase, data.user!),
          )
          .catch((err) => {
            console.error("[LoginForm] ensureProfileForAuthUser failed", err);
          });
      }, 0);
    }

    const userId = data.user?.id;
    const redirectPath =
      userId != null
        ? await import("@/lib/auth/post-auth-redirect").then(
            ({ resolvePostAuthPath }) =>
              resolvePostAuthPath(supabase, userId, searchParams.get("next")),
          )
        : "/onboarding";

    setIsLoading(false);
    router.push(redirectPath);
    router.refresh();
  }

  return (
    <AuthCard
      title={translate(locale, "Добре дошли отново", "Welcome back")}
      message={translate(
        locale,
        "Свържете се отново с истинска храна и истински фермери.",
        "Reconnect with real food and real farmers.",
      )}
      footer={
        <>
          {translate(locale, "Нови сте в Farmly? ", "New to Farmly? ")}
          <Link
            href="/signup"
            className="text-link"
          >
            {translate(locale, "Създайте акаунт", "Create an account")}
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <AuthInput
          id="login-email"
          label={translate(locale, "Имейл", "Email")}
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(event) =>
            setValues((current) => ({ ...current, email: event.target.value }))
          }
          error={fieldErrors.email}
        />

        <AuthInput
          id="login-password"
          label={translate(locale, "Парола", "Password")}
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              password: event.target.value,
            }))
          }
          error={fieldErrors.password}
        />

        {formError ? (
          <p
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {formError}
          </p>
        ) : null}

        <AuthButton
          isLoading={isLoading}
          loadingLabel={translate(locale, "Влизане", "Signing in")}
        >
          {translate(locale, "Вход", "Log in")}
        </AuthButton>
      </form>
    </AuthCard>
  );
}
