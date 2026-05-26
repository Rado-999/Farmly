import type { Locale } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/translate";

type AuthErrorLike = {
  message?: string;
  code?: string;
  status?: number;
};

export function getAuthErrorMessage(
  error: AuthErrorLike,
  locale: Locale = "bg",
): string {
  const message = error.message ?? "";
  const normalized = message.toLowerCase();
  const code = error.code?.toLowerCase();

  if (
    code === "email_address_invalid" ||
    normalized.includes("email address") && normalized.includes("invalid")
  ) {
    return translate(
      locale,
      "Използвайте истински имейл адрес, на който можете да получавате поща.",
      "Use a real email address that can receive mail.",
    );
  }

  if (
    code === "over_email_send_rate_limit" ||
    normalized.includes("rate limit")
  ) {
    return translate(
      locale,
      "Supabase временно блокира нови имейли за потвърждение след твърде много опити за регистрация. Изчакайте около час или изключете „Confirm email“ в Authentication → Providers → Email за локална разработка.",
      'Supabase has temporarily blocked new confirmation emails after too many signup attempts. Wait about an hour or disable "Confirm email" in Authentication -> Providers -> Email for local development.',
    );
  }

  if (
    code === "user_already_exists" ||
    normalized.includes("user already registered") ||
    normalized.includes("already been registered")
  ) {
    return translate(
      locale,
      "Вече съществува акаунт с този имейл.",
      "An account with this email already exists.",
    );
  }

  if (normalized.includes("invalid login credentials")) {
    return translate(
      locale,
      "Този имейл или парола не съвпадат с нашите записи.",
      "This email or password does not match our records.",
    );
  }

  if (normalized.includes("email not confirmed")) {
    return translate(
      locale,
      "Потвърдете имейла си, преди да влезете.",
      "Confirm your email before signing in.",
    );
  }

  if (
    normalized.includes("row-level security") ||
    normalized.includes("violates row-level security")
  ) {
    return translate(
      locale,
      "Не успяхме да завършим настройката на профила ви. Опитайте да влезете отново.",
      "We could not finish setting up your profile. Try signing in again.",
    );
  }

  if (
    code === "23505" ||
    normalized.includes("duplicate key") ||
    normalized.includes("unique constraint")
  ) {
    if (normalized.includes("farmer_profiles_slug")) {
      return translate(
        locale,
        "Не успяхме да резервираме URL адреса на вашата фермерска страница. Моля, опитайте отново.",
        "We could not reserve the URL for your farmer page. Please try again.",
      );
    }

    return translate(
      locale,
      "Този запис вече съществува. Опитайте да влезете вместо това.",
      "This record already exists. Try signing in instead.",
    );
  }

  if (normalized.includes("password")) {
    return translate(
      locale,
      "Проверете паролата си и опитайте отново.",
      "Check your password and try again.",
    );
  }

  return translate(
    locale,
    "Нещо се обърка. Моля, опитайте отново.",
    "Something went wrong. Please try again.",
  );
}

export function getSignupWithoutUserMessage(locale: Locale = "bg"): string {
  return translate(
    locale,
    "Ако този имейл вече е регистриран, влезте в акаунта си. В противен случай опитайте отново след малко.",
    "If this email is already registered, sign in to your account. Otherwise, try again shortly.",
  );
}
