import Link from "next/link";
import { AppShell, Badge, ScoreBar, EmptyState } from "@/components/layout/app-shell";
import { StageSelector } from "@/components/applications/stage-selector";
import { createClient } from "@/lib/supabase/server";
import { getRiskBadgeColor, rel } from "@/lib/utils";
import { Calendar } from "lucide-react";

export default async function JobDetailPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: job } = await supabase.from("jobs").select("*").eq("id", id).single();

  const { data: applications } = await supabase
    .from("applications")
    .select(`
      *,
      candidate:candidates(*)
    `)
    .eq("job_id", id)
    .order("ranking_position", { ascending: true, nullsFirst: false })
    .order("score", { ascending: false, nullsFirst: false });

  if (!job) {
    return (
      <AppShell title="Vacante no encontrada">
        <EmptyState title="No existe" description="Esta vacante no fue encontrada." />
      </AppShell>
    );
  }

  return (
    <AppShell title={job.title}>
      <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={job.status === "open" ? "success" : "warning"}>{job.status}</Badge>
          <span className="text-sm text-slate-400">{job.department}</span>
          <span className="text-sm text-slate-400">Seniority: {job.seniority_level}</span>
        </div>
        <p className="mt-4 text-slate-300">{job.description}</p>
        <p className="mt-2 text-sm text-slate-400">
          <strong>Requisitos:</strong> {job.requirements}
        </p>
      </div>

      <h2 className="mb-4 text-lg font-semibold">Ranking de candidatos</h2>

      {!applications?.length ? (
        <EmptyState
          title="Sin candidatos"
          description="Sube CVs y asígnalos a esta vacante para ver el ranking."
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app, index) => {
            const candidate = rel(app.candidate);
            return (
            <div
              key={app.id}
              className="rounded-xl border border-slate-800 bg-slate-900/50 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold">
                      #{app.ranking_position || index + 1}
                    </span>
                    <div>
                      <Link
                        href={`/recruiter/candidates/${app.candidate_id}`}
                        className="font-semibold hover:text-indigo-400"
                      >
                        {candidate?.full_name}
                      </Link>
                      <p className="text-sm text-slate-400">{candidate?.email}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="info">{candidate?.seniority}</Badge>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${getRiskBadgeColor(candidate?.ai_risk_level)}`}>
                      Riesgo: {candidate?.ai_risk_level || "N/A"}
                    </span>
                  </div>
                </div>
                <div className="w-full max-w-xs">
                  <p className="mb-1 text-xs text-slate-400">Match score</p>
                  <ScoreBar score={app.score} />
                </div>
              </div>

              {candidate?.ai_summary && (
                <p className="mt-4 text-sm text-slate-300">{candidate.ai_summary}</p>
              )}

              <div className="mt-4 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <StageSelector
                    applicationId={app.id}
                    currentStage={app.stage}
                    aiNextStep={app.ai_next_step}
                  />
                </div>
                {app.stage === "interview" && (
                  <Link
                    href={`/recruiter/interviews?applicationId=${app.id}`}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:border-indigo-500 hover:text-indigo-400"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    Agendar entrevista
                  </Link>
                )}
              </div>
            </div>
          );})}
        </div>
      )}
    </AppShell>
  );
}
