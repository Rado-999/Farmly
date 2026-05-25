function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-sm bg-stone-300/45 ${className}`}
    />
  );
}

type PageLoadingShellProps = {
  label?: string;
};

/** Lightweight route fallback — keeps header/footer visible without a full-page swap. */
export function PageLoadingShell({
  label = "Loading page",
}: PageLoadingShellProps) {
  return (
    <main
      className="flex-1 bg-cream"
      aria-busy="true"
      aria-label={label}
    >
      <div className="page-shell-wide section-space">
        <SkeletonBlock className="h-4 w-28" />
        <SkeletonBlock className="mt-5 h-12 w-full max-w-xl" />
        <SkeletonBlock className="mt-4 h-20 w-full max-w-lg" />
        <div className="content-after-head grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonBlock className="min-h-52" />
          <SkeletonBlock className="min-h-52" />
          <SkeletonBlock className="min-h-52 sm:col-span-2 lg:col-span-1" />
        </div>
      </div>
    </main>
  );
}
