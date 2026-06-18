import { Skeleton, SkeletonCard, SkeletonPagination } from "@/components/layout/skeleton";

export default function JobsLoading() {
  return (
    <div>
      <div className="mb-6 flex justify-end">
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <SkeletonPagination />
    </div>
  );
}
