import { Skeleton, SkeletonText, SkeletonCard } from "@/components/layout/skeleton";

export default function UploadLoading() {
  return (
    <div>
      <SkeletonText lines={2} className="mb-6 max-w-2xl" />
      <div className="grid gap-6 lg:grid-cols-2">
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
        <div />
      </div>
    </div>
  );
}
