import type {
  AuthFieldErrors,
  LoginFormValues,
  SignupFormValues,
} from "@/lib/auth/types";
import type { Locale } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/translate";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(
  email: string,
  locale: Locale,
): string | undefined {
  const value = email.trim();

  if (!value) {
    return translate(locale, "Имейлът е задължителен.", "Email is required.");
  }

  if (!emailPattern.test(value)) {
    return translate(
      locale,
      "Въведете валиден имейл адрес.",
      "Enter a valid email address.",
    );
  }

  return undefined;
}

function validatePassword(
  password: string,
  locale: Locale,
  minLength = 8,
): string | undefined {
  if (!password) {
    return translate(locale, "Паролата е задължителна.", "Password is required.");
  }

  if (password.length < minLength) {
    return translate(
      locale,
      `Паролата трябва да е поне ${minLength} символа.`,
      `Password must be at least ${minLength} characters.`,
    );
  }

  return undefined;
}

export function validateLoginForm(
  values: LoginFormValues,
  locale: Locale = "bg",
): AuthFieldErrors<keyof LoginFormValues> {
  const errors: AuthFieldErrors<keyof LoginFormValues> = {};
  const emailError = validateEmail(values.email, locale);

  if (emailError) {
    errors.email = emailError;
  }

  if (!values.password) {
    errors.password = translate(
      locale,
      "Паролата е задължителна.",
      "Password is required.",
    );
  }

  return errors;
}

export function validateSignupForm(
  values: SignupFormValues,
  locale: Locale = "bg",
): AuthFieldErrors<keyof SignupFormValues> {
  const errors: AuthFieldErrors<keyof SignupFormValues> = {};
  const emailError = validateEmail(values.email, locale);
  const passwordError = validatePassword(values.password, locale);
  const fullName = values.fullName.trim();

  if (!fullName) {
    errors.fullName = translate(
      locale,
      "Пълното име е задължително.",
      "Full name is required.",
    );
  } else if (fullName.length < 2) {
    errors.fullName = translate(
      locale,
      "Въведете пълното си име.",
      "Enter your full name.",
    );
  }

  if (emailError) {
    errors.email = emailError;
  }

  if (passwordError) {
    errors.password = passwordError;
  }

  return errors;
}
