import Link from "next/link";
import { AppShell, Badge, EmptyState } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/server";

export default async function CandidateJobsPage() {
  const supabase = await createClient();
  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  return (
    <AppShell title="Vacantes Abiertas">
      {!jobs?.length ? (
        <EmptyState title="No hay vacantes abiertas" description="Vuelve más tarde." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/candidate/jobs/${job.id}`}
              className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 hover:border-indigo-600"
            >
              <h3 className="font-semibold">{job.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-slate-400">{job.description}</p>
              <div className="mt-4 flex gap-2">
                <Badge variant="info">{job.department || "General"}</Badge>
                <Badge>{job.seniority_level}</Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
