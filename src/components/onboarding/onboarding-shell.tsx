"use client";

import type { ReactNode } from "react";

import { useLocale } from "@/components/i18n/language-provider";
import { translate } from "@/lib/i18n/translate";

type OnboardingShellProps = {
  step: number;
  totalSteps: number;
  title: string;
  subtitle: string;
  onSkip: () => void;
  children: ReactNode;
};

export function OnboardingShell({
  step,
  totalSteps,
  title,
  subtitle,
  onSkip,
  children,
}: OnboardingShellProps) {
  const { locale } = useLocale();
  const progress = Math.round((step / totalSteps) * 100);

  return (
    <div className="page-shell flex max-w-xl flex-col page-y">
      <div className="mb-8 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-stone-500">
            {translate(locale, "Стъпка", "Step")} {step}{" "}
            {translate(locale, "от", "of")} {totalSteps}
          </p>
          <button
            type="button"
            onClick={onSkip}
            className="text-sm font-medium text-stone-500 transition-colors hover:text-stone-800"
          >
            {translate(locale, "Пропусни засега", "Skip for now")}
          </button>
        </div>

        <div
          aria-hidden
          className="h-1.5 overflow-hidden rounded-full bg-stone-200/80"
        >
          <div
            className="h-full rounded-full bg-forest transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
            {title}
          </h1>
          <p className="text-sm leading-6 text-stone-600 sm:text-base">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex flex-col">{children}</div>
    </div>
  );
}
