import { Skeleton, SkeletonTable, SkeletonPagination } from "@/components/layout/skeleton";

export default function CandidatesLoading() {
  return (
    <div>
      <div className="mb-6 flex justify-end">
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>
      <SkeletonTable rows={10} cols={5} />
      <SkeletonPagination />
    </div>
  );
}
