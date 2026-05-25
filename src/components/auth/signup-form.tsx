"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { AuthButton } from "@/components/auth/auth-button";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthInput } from "@/components/auth/auth-input";
import { completeSignup } from "@/lib/auth/complete-signup";
import type { AuthFieldErrors, SignupFormValues } from "@/lib/auth/types";
import { validateSignupForm } from "@/lib/auth/validation";
import { createSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

const initialValues: SignupFormValues = {
  fullName: "",
  email: "",
  password: "",
};

export function SignupForm() {
  const router = useRouter();
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

    const nextFieldErrors = validateSignupForm(values);
    setFieldErrors(nextFieldErrors);

    if (Object.keys(nextFieldErrors).length > 0) {
      return;
    }

    if (!isSupabaseConfigured()) {
      setFormError("Удостоверяването все още не е конфигурирано.");
      return;
    }

    const supabase = createSupabaseClient();

    if (!supabase) {
      setFormError("Удостоверяването все още не е конфигурирано.");
      return;
    }

    setIsLoading(true);

    const result = await completeSignup(supabase, values);

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
      "Акаунтът ви е готов. Проверете имейла си за потвърждение, след което влезте.",
    );
    setValues(initialValues);
  }

  return (
    <AuthCard
      title="Присъединете се към Farmly"
      message="Запознайте се с хората зад храната си и изградете доверие сезон след сезон."
      footer={
        <>
          Вече имате акаунт?{" "}
          <Link href="/login" className="text-link">
            Вход
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <AuthInput
          id="signup-full-name"
          label="Пълно име"
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
          label="Имейл"
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
          label="Парола"
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
          Всеки нов акаунт започва като купувач. Ако по-късно искате да публикувате
          като фермер, можете да активирате фермерски профил от акаунта си.
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

        <AuthButton isLoading={isLoading} loadingLabel="Създаване на акаунт">
          Създай акаунт
        </AuthButton>
      </form>
    </AuthCard>
  );
}
