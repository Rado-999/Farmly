import type {
  AuthFieldErrors,
  LoginFormValues,
  SignupFormValues,
} from "@/lib/auth/types";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string): string | undefined {
  const value = email.trim();

  if (!value) {
    return "Имейлът е задължителен.";
  }

  if (!emailPattern.test(value)) {
    return "Въведете валиден имейл адрес.";
  }

  return undefined;
}

function validatePassword(password: string, minLength = 8): string | undefined {
  if (!password) {
    return "Паролата е задължителна.";
  }

  if (password.length < minLength) {
    return `Паролата трябва да е поне ${minLength} символа.`;
  }

  return undefined;
}

export function validateLoginForm(
  values: LoginFormValues,
): AuthFieldErrors<keyof LoginFormValues> {
  const errors: AuthFieldErrors<keyof LoginFormValues> = {};
  const emailError = validateEmail(values.email);

  if (emailError) {
    errors.email = emailError;
  }

  if (!values.password) {
    errors.password = "Паролата е задължителна.";
  }

  return errors;
}

export function validateSignupForm(
  values: SignupFormValues,
): AuthFieldErrors<keyof SignupFormValues> {
  const errors: AuthFieldErrors<keyof SignupFormValues> = {};
  const emailError = validateEmail(values.email);
  const passwordError = validatePassword(values.password);
  const fullName = values.fullName.trim();

  if (!fullName) {
    errors.fullName = "Пълното име е задължително.";
  } else if (fullName.length < 2) {
    errors.fullName = "Въведете пълното си име.";
  }

  if (emailError) {
    errors.email = emailError;
  }

  if (passwordError) {
    errors.password = passwordError;
  }

  if (values.role !== "buyer" && values.role !== "farmer") {
    errors.role = "Изберете как искате да използвате Farmly.";
  }

  return errors;
}
