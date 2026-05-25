import Link from "next/link";

export default function FarmerNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-xl space-y-4">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-forest">
          Farmer profile
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          This farmer profile is not available yet.
        </h1>
        <p className="text-base leading-7 text-stone-600">
          The grower may still be preparing their story, or the link may be out
          of date.
        </p>
        <Link
          href="/farmers"
          className="inline-flex rounded-full bg-forest px-5 py-3 text-sm font-medium text-cream transition-colors hover:bg-forest/90"
        >
          Explore farmers
        </Link>
      </div>
    </main>
  );
}
