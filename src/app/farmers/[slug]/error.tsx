"use client";

import Link from "next/link";

type FarmerProfileErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function FarmerProfileError({
  reset,
}: FarmerProfileErrorProps) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-xl space-y-5">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-forest">
          Farmer profile
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          We could not load this farmer profile.
        </h1>
        <p className="text-base leading-7 text-stone-600">
          The connection may have dropped, or the profile may be temporarily
          unavailable. You can try again or return to the farmer directory.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex rounded-full bg-forest px-5 py-3 text-sm font-medium text-cream transition-colors hover:bg-forest/90"
          >
            Try again
          </button>
          <Link
            href="/farmers"
            className="inline-flex rounded-full border border-stone-300/80 bg-white px-5 py-3 text-sm font-medium text-stone-800 transition-colors hover:border-stone-400"
          >
            Explore farmers
          </Link>
        </div>
      </div>
    </main>
  );
}
