"use client";

import { useLocale } from "@/components/i18n/language-provider";
import { type Locale, SUPPORTED_LOCALES } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/translate";

const labels: Record<Locale, string> = {
  bg: "БГ",
  en: "EN",
};

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <div
      role="group"
      aria-label={translate(locale, "Смени езика", "Switch language")}
      className="inline-flex rounded-full border border-stone-300/80 bg-white/80 p-1 shadow-[0_8px_18px_-16px_rgba(47,42,36,0.16)]"
    >
      {SUPPORTED_LOCALES.map((option) => {
        const isActive = option === locale;

        return (
          <button
            key={option}
            type="button"
            onClick={() => setLocale(option)}
            aria-pressed={isActive}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold tracking-[0.16em] transition-colors duration-300 ${
              isActive
                ? "bg-forest text-mist"
                : "text-stone-600 hover:text-forest"
            }`}
          >
            {labels[option]}
          </button>
        );
      })}
    </div>
  );
}
