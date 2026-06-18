import { Skeleton, SkeletonStat, SkeletonTable } from "@/components/layout/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SkeletonStat />
        <SkeletonStat />
        <SkeletonStat />
        <SkeletonStat />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <SkeletonStat />
        <SkeletonStat />
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <Skeleton className="mb-4 h-5 w-32" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full rounded-lg" />
            <Skeleton className="h-4 w-full rounded-lg" />
            <Skeleton className="h-4 w-full rounded-lg" />
          </div>
        </div>
      </div>
      <Skeleton className="h-6 w-48" />
      <SkeletonTable rows={5} cols={5} />
    </div>
  );
}
