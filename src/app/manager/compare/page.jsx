import { AppShell, EmptyState, ScoreBar } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/server";
import { getRiskBadgeColor, rel } from "@/lib/utils";

export default async function ComparePage() {
  const supabase = await createClient();

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, title")
    .order("title");

  const comparisons = await Promise.all(
    (jobs || []).map(async (job) => {
      const { data: apps } = await supabase
        .from("applications")
        .select(`score, ranking_position, candidate:candidates(full_name, seniority, ai_risk_level, ai_summary)`)
        .eq("job_id", job.id)
        .order("score", { ascending: false, nullsFirst: false });
      return { job, applications: apps || [] };
    })
  );

  const withCandidates = comparisons.filter((c) => c.applications.length > 0);

  return (
    <AppShell title="Comparar Scores entre Candidatos">
      {!withCandidates.length ? (
        <EmptyState title="Sin datos" description="No hay candidatos con score para comparar." />
      ) : (
        <div className="space-y-8">
          {withCandidates.map(({ job, applications }) => (
            <div key={job.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
              <h3 className="text-lg font-semibold">{job.title}</h3>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-slate-400">
                    <tr>
                      <th className="pb-3 pr-4">#</th>
                      <th className="pb-3 pr-4">Candidato</th>
                      <th className="pb-3 pr-4">Seniority</th>
                      <th className="pb-3 pr-4">Riesgo</th>
                      <th className="pb-3 pr-4">Score</th>
                      <th className="pb-3">Resumen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app, i) => {
                      const candidate = rel(app.candidate);
                      return (
                      <tr key={i} className="border-t border-slate-800">
                        <td className="py-3 pr-4 font-bold text-indigo-400">
                          {app.ranking_position || i + 1}
                        </td>
                        <td className="py-3 pr-4 font-medium">{candidate?.full_name}</td>
                        <td className="py-3 pr-4">{candidate?.seniority}</td>
                        <td className="py-3 pr-4">
                          <span className={`rounded-full px-2 py-0.5 text-xs ${getRiskBadgeColor(candidate?.ai_risk_level)}`}>
                            {candidate?.ai_risk_level}
                          </span>
                        </td>
                        <td className="py-3 pr-4 w-36">
                          <ScoreBar score={app.score} />
                        </td>
                        <td className="py-3 text-slate-400 line-clamp-2 max-w-xs">
                          {candidate?.ai_summary}
                        </td>
                      </tr>
                    );})}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
