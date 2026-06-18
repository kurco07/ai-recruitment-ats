import { Skeleton, SkeletonText, SkeletonCard } from "@/components/layout/skeleton";

export default function CandidateDetailLoading() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <SkeletonCard className="p-6">
          <Skeleton className="mb-3 h-6 w-40" />
          <SkeletonText lines={4} />
        </SkeletonCard>
        <SkeletonCard className="p-6">
          <Skeleton className="mb-3 h-6 w-48" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </SkeletonCard>
        <SkeletonCard className="p-6">
          <Skeleton className="mb-3 h-6 w-44" />
          <SkeletonText lines={6} />
        </SkeletonCard>
      </div>
      <div className="space-y-6">
        <SkeletonCard className="p-6">
          <Skeleton className="mb-4 h-6 w-32" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </SkeletonCard>
        <SkeletonCard className="p-6">
          <Skeleton className="mb-4 h-6 w-36" />
          <SkeletonText lines={4} />
        </SkeletonCard>
        <SkeletonCard className="p-6">
          <Skeleton className="mb-4 h-6 w-32" />
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </SkeletonCard>
      </div>
    </div>
  );
}
