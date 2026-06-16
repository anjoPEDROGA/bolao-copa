export function MatchCardSkeleton() {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0f1727] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
      <div className="flex items-center justify-between gap-3">
        <div className="h-5 w-24 animate-pulse rounded-full bg-white/10" />
        <div className="h-6 w-20 animate-pulse rounded-full bg-white/10" />
      </div>

      <div className="mt-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-full bg-white/10" />
          <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-full bg-white/10" />
          <div className="h-4 w-28 animate-pulse rounded bg-white/10" />
        </div>
      </div>

      <div className="mt-5 h-10 animate-pulse rounded-2xl bg-white/10" />
    </div>
  );
}
