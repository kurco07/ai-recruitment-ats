import { AppShell, StatCard } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/server";
import { PIPELINE_STAGES } from "@/lib/types";

export default async function MetricsPage() {
  const supabase = await createClient();

  const [{ data: jobs }, { data: applications }] = await Promise.all([
    supabase.from("jobs").select("id, title, status"),
    supabase.from("applications").select("job_id, stage, score"),
  ]);

  const jobMetrics = jobs?.map((job) => {
    const jobApps = applications?.filter((a) => a.job_id === job.id) || [];
    const avgScore =
      jobApps.length > 0
        ? Math.round(
            jobApps.reduce((acc, a) => acc + (a.score || 0), 0) /
              jobApps.length,
          )
        : 0;
    const stageBreakdown = PIPELINE_STAGES.map((s) => ({
      stage: s.label,
      count: jobApps.filter((a) => a.stage === s.value).length,
    }));
    return { ...job, total: jobApps.length, avgScore, stageBreakdown };
  });

  return (
    <AppShell title="Métricas por Vacante">
      <p className="mb-6 text-sm text-slate-400">
        Métricas de avance por vacante para el equipo de talento.
      </p>
      <div className="grid gap-6">
        {jobMetrics?.map((job) => (
          <div
            key={job.id}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{job.title}</h3>
                <p className="text-sm text-slate-400 capitalize">
                  Estado: {job.status}
                </p>
              </div>
              <div className="flex gap-4">
                <StatCard
                  label="Candidatos"
                  value={job.total}
                  className="min-w-[120px] p-4"
                />
                <StatCard
                  label="Score medio"
                  value={job.avgScore}
                  className="min-w-[120px] p-4"
                />
              </div>
            </div>
            <div className="mt-6 grid gap-2 sm:grid-cols-4 lg:grid-cols-7">
              {job.stageBreakdown.map((s) => (
                <div
                  key={s.stage}
                  className="rounded-lg bg-slate-950 p-3 text-center"
                >
                  <p className="text-2xl font-bold">{s.count}</p>
                  <p className="text-xs text-slate-400">{s.stage}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
        {!jobMetrics?.length && (
          <p className="text-center text-slate-500">
            Crea vacantes para ver métricas
          </p>
        )}
      </div>
    </AppShell>
  );
}
