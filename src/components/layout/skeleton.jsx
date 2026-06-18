import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-slate-800", className)}
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", i === lines - 1 ? "w-3/4" : "w-full")}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-800 bg-slate-900/50 p-5",
        className
      )}
    >
      <Skeleton className="mb-3 h-5 w-1/3" />
      <SkeletonText lines={2} />
    </div>
  );
}

export function SkeletonStat({ className }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-800 bg-slate-900/60 p-5",
        className
      )}
    >
      <Skeleton className="mb-2 h-4 w-1/2" />
      <Skeleton className="h-8 w-1/3" />
    </div>
  );
}

export function SkeletonTableRow({ cols = 5 }) {
  return (
    <tr className="border-t border-slate-800">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800">
      <table className="w-full text-sm">
        <thead className="bg-slate-900/80 text-left text-slate-400">
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <Skeleton className="h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonTableRow key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SkeletonPagination() {
  return (
    <div className="mt-6 flex items-center justify-center gap-4">
      <Skeleton className="h-10 w-28 rounded-lg" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-28 rounded-lg" />
    </div>
  );
}
