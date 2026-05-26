"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useLocale } from "@/components/i18n/language-provider";
import { ONBOARDING_PATH } from "@/lib/auth/constants";
import { translate } from "@/lib/i18n/translate";
import { loadSupabaseClient } from "@/lib/supabase/load-client";

type BecomeFarmerButtonProps = {
  onSuccess?: () => void;
};

export function BecomeFarmerButton({ onSuccess }: BecomeFarmerButtonProps) {
  const router = useRouter();
  const { locale } = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBecomeFarmer() {
    setError(null);

    const supabase = await loadSupabaseClient();

    if (!supabase) {
      setError(
        translate(
          locale,
          "Удостоверяването все още не е конфигурирано.",
          "Authentication is not configured yet.",
        ),
      );
      return;
    }

    setIsLoading(true);

    const [{ becomeFarmer }, { getAuthErrorMessage }] = await Promise.all([
      import("@/lib/auth/become-farmer"),
      import("@/lib/auth/messages"),
    ]);
    const result = await becomeFarmer(supabase);

    setIsLoading(false);

    if (result.status === "error") {
      setError(getAuthErrorMessage({ message: result.message }, locale));
      return;
    }

    onSuccess?.();
    router.push(ONBOARDING_PATH);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => void handleBecomeFarmer()}
        disabled={isLoading}
        className="inline-flex rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white transition-[background-color,opacity] duration-300 hover:bg-[#324a2f] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading
          ? translate(locale, "Подготвяме фермата ви...", "Preparing your farm...")
          : translate(locale, "Станете фермер", "Become a farmer")}
      </button>

      {error ? (
        <p
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
