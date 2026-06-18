"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export function StageFilter({ stages, counts }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("stages") || "";

  const activeSet = new Set(current ? current.split(",") : []);

  const buildUrl = (values) => {
    const params = new URLSearchParams(searchParams);
    if (values.length > 0) {
      params.set("stages", values.join(","));
    } else {
      params.delete("stages");
    }
    return `${pathname}?${params.toString()}`;
  };

  const toggleStage = (value) => {
    const next = new Set(activeSet);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    return buildUrl(Array.from(next));
  };

  const showAll = activeSet.size === 0;

  const stagesWithCounts = stages.map((s) => ({
    ...s,
    count: counts[s.value] || 0,
  }));

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      <Link
        href={buildUrl([])}
        className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
          showAll
            ? "bg-slate-600 text-white"
            : "border border-slate-700 text-slate-300 hover:bg-slate-800"
        }`}
      >
        Todas ({Object.values(counts).reduce((a, b) => a + b, 0)})
      </Link>
      {stagesWithCounts.map((stage) => {
        const isActive = activeSet.has(stage.value);
        return (
          <Link
            key={stage.value}
            href={toggleStage(stage.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              isActive
                ? `${stage.color} text-white`
                : "border border-slate-700 text-slate-300 hover:bg-slate-800"
            }`}
          >
            {stage.label} ({stage.count})
          </Link>
        );
      })}
    </div>
  );
}
