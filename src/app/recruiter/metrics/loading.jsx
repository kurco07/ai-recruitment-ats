import { Skeleton, SkeletonStat, SkeletonText } from "@/components/layout/skeleton";

export default function MetricsLoading() {
  return (
    <div className="space-y-6">
      <SkeletonText lines={2} className="max-w-2xl" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="mb-4 flex items-center gap-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <SkeletonStat />
            <SkeletonStat />
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, j) => (
              <div key={j} className="rounded-lg bg-slate-800/50 p-3 text-center">
                <Skeleton className="mx-auto mb-1 h-6 w-10" />
                <Skeleton className="mx-auto h-3 w-14" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
