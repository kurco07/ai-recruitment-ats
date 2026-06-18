import { Skeleton, SkeletonText, SkeletonTable } from "@/components/layout/skeleton";

export default function CompareLoading() {
  return (
    <div className="space-y-8">
      <SkeletonText lines={2} className="max-w-2xl" />
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <Skeleton className="mb-4 h-6 w-56" />
          <SkeletonTable rows={4} cols={6} />
        </div>
      ))}
    </div>
  );
}
