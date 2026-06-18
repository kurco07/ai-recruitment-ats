import { Skeleton, SkeletonText, SkeletonCard } from "@/components/layout/skeleton";

export default function JobDetailLoading() {
  return (
    <div className="space-y-6">
      <SkeletonCard className="p-6">
        <div className="mb-3 flex items-center gap-3">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-5 w-48" />
        </div>
        <SkeletonText lines={3} />
        <Skeleton className="mt-3 h-4 w-64" />
      </SkeletonCard>

      <Skeleton className="h-6 w-48" />

      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} className="p-5">
            <div className="flex items-start gap-4">
              <Skeleton className="h-10 w-10 flex-shrink-0 rounded-full" />
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="mb-2 h-3 w-full rounded-full" />
                <Skeleton className="h-4 w-64" />
                <div className="mt-3 flex gap-2">
                  <Skeleton className="h-8 w-32 rounded-lg" />
                  <Skeleton className="h-8 w-28 rounded-lg" />
                </div>
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}
