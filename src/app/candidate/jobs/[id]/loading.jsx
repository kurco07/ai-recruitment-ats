import { Skeleton, SkeletonText, SkeletonCard } from "@/components/layout/skeleton";

export default function CandidateJobDetailLoading() {
  return (
    <div className="space-y-6">
      <SkeletonCard className="p-6">
        <div className="mb-3 flex items-center gap-3">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        <SkeletonText lines={4} />
      </SkeletonCard>

      <Skeleton className="h-6 w-48" />

      <SkeletonCard className="p-6">
        <Skeleton className="mb-4 h-48 w-full rounded-lg border-2 border-dashed border-slate-700" />
        <div className="space-y-3">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </SkeletonCard>
    </div>
  );
}
