type AuthErrorLike = {
  message?: string;
  code?: string;
  status?: number;
};

export function getAuthErrorMessage(error: AuthErrorLike): string {
  const message = error.message ?? "";
  const normalized = message.toLowerCase();
  const code = error.code?.toLowerCase();

  if (
    code === "email_address_invalid" ||
    normalized.includes("email address") && normalized.includes("invalid")
  ) {
    return "Използвайте истински имейл адрес, на който можете да получавате поща.";
  }

  if (
    code === "over_email_send_rate_limit" ||
    normalized.includes("rate limit")
  ) {
    return "Supabase временно блокира нови имейли за потвърждение след твърде много опити за регистрация. Изчакайте около час или изключете „Confirm email“ в Authentication → Providers → Email за локална разработка.";
  }

  if (
    code === "user_already_exists" ||
    normalized.includes("user already registered") ||
    normalized.includes("already been registered")
  ) {
    return "Вече съществува акаунт с този имейл.";
  }

  if (normalized.includes("invalid login credentials")) {
    return "Този имейл или парола не съвпадат с нашите записи.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Потвърдете имейла си, преди да влезете.";
  }

  if (
    normalized.includes("row-level security") ||
    normalized.includes("violates row-level security")
  ) {
    return "Не успяхме да завършим настройката на профила ви. Опитайте да влезете отново.";
  }

  if (
    code === "23505" ||
    normalized.includes("duplicate key") ||
    normalized.includes("unique constraint")
  ) {
    if (normalized.includes("farmer_profiles_slug")) {
      return "Не успяхме да резервираме URL адреса на вашата фермерска страница. Моля, опитайте отново.";
    }

    return "Този запис вече съществува. Опитайте да влезете вместо това.";
  }

  if (normalized.includes("password")) {
    return "Проверете паролата си и опитайте отново.";
  }

  return "Нещо се обърка. Моля, опитайте отново.";
}

export function getSignupWithoutUserMessage(): string {
  return "Ако този имейл вече е регистриран, влезте в акаунта си. В противен случай опитайте отново след малко.";
}
