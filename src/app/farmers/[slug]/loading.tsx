function SkeletonLine({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-full bg-loam-300/70 ${className}`}
    />
  );
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-sm bg-loam-300/60 ${className}`}
    />
  );
}

export default function Loading() {
  return (
    <main
      className="flex-1 bg-loam-100"
      aria-busy="true"
      aria-label="Зареждане на фермерския профил"
    >
      <SkeletonBlock className="min-h-[min(60vh,28rem)] w-full rounded-none" />

      <div className="border-y border-loam-300/50 bg-loam-200/60 py-5">
        <div className="page-shell flex justify-center">
          <SkeletonLine className="h-4 w-64 max-w-full" />
        </div>
      </div>

      <div className="page-shell space-y-10 py-14 sm:py-20">
        <div className="max-w-2xl space-y-4">
          <SkeletonLine className="h-3 w-24" />
          <SkeletonLine className="h-10 w-full max-w-md" />
        </div>
        <SkeletonBlock className="aspect-[21/9] w-full max-w-5xl" />
        <div className="layout-split grid gap-10 lg:grid-cols-2">
          <SkeletonBlock className="min-h-48" />
          <SkeletonBlock className="min-h-40" />
        </div>
      </div>
    </main>
  );
}
