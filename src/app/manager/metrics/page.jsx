import { AppShell, StatCard, ScoreBar } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/server";
import { PIPELINE_STAGES } from "@/lib/types";

export default async function ManagerMetricsPage() {
  const supabase = await createClient();

  const [{ data: jobs }, { data: applications }] = await Promise.all([
    supabase.from("jobs").select("id, title, status").eq("status", "open"),
    supabase.from("applications").select("job_id, stage, score, candidate:candidates(full_name)"),
  ]);

  const jobMetrics = jobs?.map((job) => {
    const jobApps = applications?.filter((a) => a.job_id === job.id) || [];
    const avgScore =
      jobApps.length > 0
        ? Math.round(jobApps.reduce((acc, a) => acc + (a.score || 0), 0) / jobApps.length)
        : 0;
    const stageBreakdown = PIPELINE_STAGES.map((s) => ({
      stage: s.label,
      count: jobApps.filter((a) => a.stage === s.value).length,
    }));
    return { ...job, total: jobApps.length, avgScore, stageBreakdown };
  }) || [];

  const totalCandidates = applications?.length || 0;
  const overallAvg =
    totalCandidates > 0
      ? Math.round(applications.reduce((acc, a) => acc + (a.score || 0), 0) / totalCandidates)
      : 0;

  const topCandidates = applications
    ?.filter((a) => a.score != null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10) || [];

  return (
    <AppShell title="Métricas — Hiring Manager">
      <p className="mb-6 text-sm text-slate-400">
        Métricas de avance por vacante y comparación de candidatos.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Vacantes activas" value={jobMetrics.length} />
        <StatCard label="Total candidatos" value={totalCandidates} />
        <StatCard label="Score promedio" value={overallAvg} />
      </div>

      <h2 className="mb-4 mt-8 text-lg font-semibold">Por vacante</h2>
      <div className="grid gap-6">
        {jobMetrics.map((job) => (
          <div key={job.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{job.title}</h3>
                <p className="text-sm text-slate-400 capitalize">Estado: {job.status}</p>
              </div>
              <div className="flex gap-4">
                <StatCard label="Candidatos" value={job.total} className="min-w-[120px] p-4" />
                <StatCard label="Score medio" value={job.avgScore} className="min-w-[120px] p-4" />
              </div>
            </div>
            <div className="mt-6 grid gap-2 sm:grid-cols-4 lg:grid-cols-7">
              {job.stageBreakdown.map((s) => (
                <div key={s.stage} className="rounded-lg bg-slate-950 p-3 text-center">
                  <p className="text-2xl font-bold">{s.count}</p>
                  <p className="text-xs text-slate-400">{s.stage}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
        {jobMetrics.length === 0 && (
          <p className="text-center text-slate-500">No hay vacantes activas.</p>
        )}
      </div>

      <h2 className="mb-4 mt-8 text-lg font-semibold">Top candidatos</h2>
      <div className="space-y-3">
        {topCandidates.map((app, i) => {
          const candidate = app.candidate?.[0] || app.candidate;
          const job = jobs?.find((j) => j.id === app.job_id);
          return (
            <div key={i} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-slate-500 w-6 text-right">{i + 1}</span>
                <div>
                  <p className="font-medium">{candidate?.full_name || "Sin nombre"}</p>
                  <p className="text-sm text-slate-400">{job?.title}</p>
                </div>
              </div>
              <div className="w-32">
                <ScoreBar score={app.score} />
              </div>
            </div>
          );
        })}
        {topCandidates.length === 0 && (
          <p className="text-center text-slate-500">Sin candidatos con score aún.</p>
        )}
      </div>
    </AppShell>
  );
}
