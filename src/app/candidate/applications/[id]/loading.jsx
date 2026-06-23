import { Skeleton, SkeletonText, SkeletonCard } from "@/components/layout/skeleton";

export default function ApplicationDetailLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-48" />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
