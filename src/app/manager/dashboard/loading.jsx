import { Skeleton, SkeletonStat, SkeletonCard } from "@/components/layout/skeleton";

export default function ManagerDashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <SkeletonStat />
        <SkeletonStat />
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-2 h-10 w-40 rounded-lg" />
        </div>
      </div>
      <Skeleton className="h-6 w-48" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} className="flex items-center justify-between p-4">
            <div>
              <Skeleton className="mb-1 h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-3 w-32 rounded-full" />
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}
