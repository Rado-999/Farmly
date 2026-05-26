"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ONBOARDING_PATH } from "@/lib/auth/constants";
import { loadSupabaseClient } from "@/lib/supabase/load-client";

type BecomeFarmerButtonProps = {
  onSuccess?: () => void;
};

export function BecomeFarmerButton({ onSuccess }: BecomeFarmerButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBecomeFarmer() {
    setError(null);

    const supabase = await loadSupabaseClient();

    if (!supabase) {
      setError("Удостоверяването все още не е конфигурирано.");
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
      setError(getAuthErrorMessage({ message: result.message }));
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
        {isLoading ? "Подготвяме фермата ви..." : "Станете фермер"}
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
