import { Skeleton, SkeletonCard } from "@/components/layout/skeleton";

export default function CandidateJobsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
