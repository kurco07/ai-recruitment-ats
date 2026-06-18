import { Skeleton, SkeletonText, SkeletonCard } from "@/components/layout/skeleton";

export default function InterviewsLoading() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <SkeletonCard className="p-6">
        <Skeleton className="mb-4 h-6 w-40" />
        <div className="space-y-3">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </SkeletonCard>
      <SkeletonCard className="p-6">
        <Skeleton className="mb-4 h-6 w-36" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-slate-800 p-4">
              <div className="mb-2 flex items-center gap-3">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-48" />
              </div>
              <Skeleton className="mb-1 h-4 w-32" />
              <Skeleton className="h-4 w-40" />
              <div className="mt-3 flex gap-2">
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </SkeletonCard>
    </div>
  );
}
