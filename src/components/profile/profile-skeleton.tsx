export function ProfileSkeleton() {
  return (
    <div className="page-shell max-w-3xl animate-pulse stack-relaxed page-y">
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-end sm:gap-8">
        <div className="h-24 w-24 rounded-[1.5rem] bg-stone-200/80 sm:h-28 sm:w-28" />
        <div className="w-full max-w-md space-y-3">
          <div className="mx-auto h-4 w-28 rounded-full bg-stone-200/80 sm:mx-0" />
          <div className="mx-auto h-10 w-56 rounded-2xl bg-stone-200/80 sm:mx-0" />
          <div className="mx-auto h-6 w-24 rounded-full bg-stone-200/70 sm:mx-0" />
        </div>
      </div>

      <div className="space-y-4 rounded-[1.75rem] border border-stone-200/80 bg-white/80 p-6">
        <div className="h-5 w-32 rounded-full bg-stone-200/80" />
        <div className="h-4 w-full rounded-full bg-stone-200/70" />
        <div className="h-4 w-4/5 rounded-full bg-stone-200/70" />
        <div className="h-4 w-3/5 rounded-full bg-stone-200/70" />
      </div>

      <div className="space-y-3 rounded-[1.75rem] border border-dashed border-stone-200/90 bg-stone-50/70 p-6">
        <div className="h-5 w-28 rounded-full bg-stone-200/80" />
        <div className="h-4 w-full rounded-full bg-stone-200/70" />
      </div>
    </div>
  );
}
