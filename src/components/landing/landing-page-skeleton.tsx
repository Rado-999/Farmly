function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-sm bg-stone-300/50 ${className}`}
    />
  );
}

export function LandingPageSkeleton() {
  return (
    <main className="flex-1" aria-busy="true" aria-label="Loading landing page">
      <section className="min-h-[70vh] bg-forest-deep">
        <div className="page-shell-wide flex min-h-[70vh] flex-col justify-end pb-16 pt-24">
          <SkeletonBlock className="h-4 w-36 bg-stone-500/40" />
          <SkeletonBlock className="mt-6 h-16 w-full max-w-xl bg-stone-500/40" />
          <SkeletonBlock className="mt-6 h-20 w-full max-w-lg bg-stone-500/30" />
        </div>
      </section>

      <section className="bg-mist section-space">
        <div className="page-shell-wide layout-split lg:grid-cols-2">
          <SkeletonBlock className="h-40 w-full max-w-lg" />
          <SkeletonBlock className="aspect-[4/5] w-full" />
        </div>
      </section>

      <section className="bg-cream section-space">
        <div className="page-shell-wide section-stack">
          <SkeletonBlock className="h-28 max-w-xl" />
          <SkeletonBlock className="min-h-[24rem] w-full" />
        </div>
      </section>
    </main>
  );
}
