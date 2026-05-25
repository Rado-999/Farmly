import Link from "next/link";

import { ONBOARDING_PATH } from "@/lib/auth/constants";

type IncompleteProfileBannerProps = {
  wasSkipped?: boolean;
};

function WarningIcon() {
  return (
    <span
      aria-hidden
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800 ring-1 ring-amber-200/90"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-5 w-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      </svg>
    </span>
  );
}

export function IncompleteProfileBanner({
  wasSkipped = false,
}: IncompleteProfileBannerProps) {
  return (
    <div
      role="status"
      className="rounded-[1.5rem] border border-amber-300/70 bg-[linear-gradient(135deg,#fff8eb_0%,#fef3c7_55%,#fdecc8_100%)] p-5 shadow-[0_14px_32px_-22px_rgba(180,130,50,0.28)] ring-1 ring-amber-200/50"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <WarningIcon />
          <div className="space-y-1.5">
            <p className="inline-flex rounded-full border border-amber-400/60 bg-amber-50/90 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.16em] text-amber-950">
              Нужно действие
            </p>
            <p className="text-sm font-medium leading-6 text-amber-950">
              {wasSkipped
                ? "Профилът ви все още не е напълно видим за другите."
                : "Профилът ви е непълен."}
            </p>
            <p className="text-sm leading-6 text-amber-900/85">
              {wasSkipped
                ? "Довършете настройката, за да могат купувачите да ви откриват и да се доверяват в Farmly."
                : "Довършете останалите стъпки, за да могат другите да ви откриват и да се доверяват в Farmly."}
            </p>
          </div>
        </div>
        <Link
          href={ONBOARDING_PATH}
          className="inline-flex shrink-0 justify-center rounded-full bg-forest px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#324a2f] sm:self-center"
        >
          Довърши профила
        </Link>
      </div>
    </div>
  );
}
