import { Skeleton, SkeletonCard } from "@/components/layout/skeleton";

export default function PipelineLoading() {
  return (
    <div>
      <Skeleton className="mb-6 h-4 w-96" />
      <div className="flex gap-4 overflow-x-auto pb-4">
        {Array.from({ length: 7 }).map((_, col) => (
          <div key={col} className="min-w-[260px] flex-shrink-0">
            <Skeleton className="mb-3 h-9 w-full rounded-lg" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
