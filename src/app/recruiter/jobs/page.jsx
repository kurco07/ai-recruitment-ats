import Link from "next/link";
import { AppShell, Badge, EmptyState } from "@/components/layout/app-shell";
import { Pagination } from "@/components/layout/pagination";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";

const PAGE_SIZE = 10;

export default async function JobsPage({ searchParams }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp?.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  const { data: jobs, count } = await supabase
    .from("jobs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

  return (
    <AppShell title="Gestión de Vacantes">
      <div className="mb-6 flex justify-end">
        <Link
          href="/recruiter/jobs/new"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500"
        >
          <Plus className="h-4 w-4" /> Nueva vacante
        </Link>
      </div>

      {!jobs?.length ? (
        <EmptyState
          title="Sin vacantes"
          description="Crea tu primera vacante para empezar a recibir candidatos."
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={`/recruiter/jobs/${job.id}`}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 transition hover:border-indigo-600"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold">{job.title}</h3>
                  <Badge variant={job.status === "open" ? "success" : job.status === "draft" ? "warning" : "default"}>
                    {job.status}
                  </Badge>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-slate-400">{job.description}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                  <span>{job.department || "General"}</span>
                  <span>{formatDate(job.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} basePath="/recruiter/jobs" />
        </>
      )}
    </AppShell>
  );
}
