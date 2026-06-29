"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { AuthButton } from "@/components/auth/auth-button";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthInput } from "@/components/auth/auth-input";
import { useLocale } from "@/components/i18n/language-provider";
import type { AuthFieldErrors, SignupFormValues } from "@/lib/auth/types";
import { translate } from "@/lib/i18n/translate";
import { isSupabaseConfigured } from "@/lib/supabase";
import { loadSupabaseClient } from "@/lib/supabase/load-client";

const initialValues: SignupFormValues = {
  fullName: "",
  email: "",
  password: "",
};

export function SignupForm() {
  const router = useRouter();
  const { locale } = useLocale();
  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] =
    useState<AuthFieldErrors<keyof SignupFormValues>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const { validateSignupForm } = await import("@/lib/auth/validation");
    const nextFieldErrors = validateSignupForm(values, locale);
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

    const { completeSignup } = await import("@/lib/auth/complete-signup");
    const result = await completeSignup(supabase, values, locale);

    setIsLoading(false);

    if (result.status === "error") {
      setFormError(result.message);
      return;
    }

    if (result.status === "session") {
      router.push(result.redirectTo);
      router.refresh();
      return;
    }

    setSuccessMessage(
      translate(
        locale,
        "Акаунтът ви е готов. Проверете имейла си за потвърждение, след което влезте.",
        "Your account is ready. Check your email for confirmation, then sign in.",
      ),
    );
    setValues(initialValues);
  }

  return (
    <AuthCard
      title={translate(locale, "Присъединете се към Farmly", "Join Farmly")}
      message={translate(
        locale,
        "Създай акаунт, за да добавяш ферми в селото си и да виждаш новостите им.",
        "Create an account to add farms to your village and see their updates.",
      )}
      footer={
        <>
          {translate(locale, "Вече имате акаунт? ", "Already have an account? ")}
          <Link href="/login" className="text-link">
            {translate(locale, "Вход", "Log in")}
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <AuthInput
          id="signup-full-name"
          label={translate(locale, "Пълно име", "Full name")}
          type="text"
          autoComplete="name"
          value={values.fullName}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              fullName: event.target.value,
            }))
          }
          error={fieldErrors.fullName}
        />

        <AuthInput
          id="signup-email"
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
          id="signup-password"
          label={translate(locale, "Парола", "Password")}
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              password: event.target.value,
            }))
          }
          error={fieldErrors.password}
        />

        <p className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm leading-6 text-stone-600">
          {translate(
            locale,
            "Всеки нов акаунт започва като купувач. Ако по-късно искате да публикувате като фермер, можете да активирате фермерски профил от акаунта си.",
            "Every new account starts as a buyer. If you want to publish as a farmer later, you can enable a farmer profile from your account.",
          )}
        </p>

        {formError ? (
          <p
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {formError}
          </p>
        ) : null}

        {successMessage ? (
          <p
            role="status"
            className="rounded-2xl border border-forest/20 bg-forest/5 px-4 py-3 text-sm text-forest"
          >
            {successMessage}
          </p>
        ) : null}

        <AuthButton
          isLoading={isLoading}
          loadingLabel={translate(locale, "Създаване на акаунт", "Creating account")}
        >
          {translate(locale, "Създай акаунт", "Create account")}
        </AuthButton>
      </form>
    </AuthCard>
  );
}
