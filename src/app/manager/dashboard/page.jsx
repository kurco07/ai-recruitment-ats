import { AppShell, StatCard, ScoreBar } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/server";
import { rel } from "@/lib/utils";
import Link from "next/link";

export default async function ManagerDashboard() {
  const supabase = await createClient();

  const { data: jobs } = await supabase.from("jobs").select("id, title").eq("status", "open");
  const { data: topCandidates } = await supabase
    .from("applications")
    .select(`score, candidate:candidates(full_name), job:jobs(title)`)
    .not("score", "is", null)
    .order("score", { ascending: false })
    .limit(5);

  return (
    <AppShell title="Dashboard — Hiring Manager">
      <p className="mb-6 text-sm text-slate-400">
        User story #5: score comparativo entre candidatos para decisiones de contratación.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Vacantes activas" value={jobs?.length || 0} />
        <StatCard label="Top candidatos" value={topCandidates?.length || 0} />
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-sm text-slate-400">Acción</p>
          <Link href="/manager/compare" className="mt-2 inline-block text-indigo-400 hover:underline">
            Comparar scores →
          </Link>
        </div>
      </div>

      <h2 className="mb-4 mt-8 text-lg font-semibold">Top candidatos global</h2>
      <div className="space-y-4">
        {topCandidates?.map((app, i) => {
          const candidate = rel(app.candidate);
          const job = rel(app.job);
          return (
          <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{candidate?.full_name}</p>
                <p className="text-sm text-slate-400">{job?.title}</p>
              </div>
              <div className="w-32">
                <ScoreBar score={app.score} />
              </div>
            </div>
          </div>
        );})}
      </div>
    </AppShell>
  );
}
