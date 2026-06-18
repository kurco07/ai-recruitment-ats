import { Skeleton, SkeletonText, SkeletonCard } from "@/components/layout/skeleton";

export default function CandidateDashboardLoading() {
  return (
    <div className="space-y-6">
      <SkeletonText lines={2} className="max-w-2xl" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="mb-1 h-5 w-48" />
                <Skeleton className="h-4 w-24 rounded-full" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
            <div className="mt-3 flex items-center gap-3">
              <Skeleton className="h-5 w-28 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          </SkeletonCard>
        ))}
      </div>
      <Skeleton className="h-4 w-40 rounded-lg" />
    </div>
  );
}
