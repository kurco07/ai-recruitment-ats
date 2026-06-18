import { Skeleton, SkeletonStat, SkeletonTable, SkeletonPagination } from "@/components/layout/skeleton";

export default function AiAuditLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SkeletonStat />
        <SkeletonStat />
        <SkeletonStat />
        <SkeletonStat />
      </div>
      <SkeletonTable rows={10} cols={5} />
      <SkeletonPagination />
    </div>
  );
}
