import { AppShell } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/server";
import { PIPELINE_STAGES } from "@/lib/types";
import Link from "next/link";
import { rel } from "@/lib/utils";
import { StageAction } from "@/components/pipeline/stage-action";
import { StageFilter } from "@/components/pipeline/stage-filter";

export default async function PipelinePage({ searchParams }) {
  const sp = await searchParams;
  const stagesParam = sp?.stages || "";

  const supabase = await createClient();
  const { data: applications } = await supabase
    .from("applications")
    .select(`
      id, stage, score,
      candidate:candidates(full_name, id),
      job:jobs(title, id),
      stage_history:stage_history(to_stage, rejection_reason, rejection_type, created_at)
    `)
    .order("score", { ascending: false, nullsFirst: false });

  const byStage = PIPELINE_STAGES.reduce(
    (acc, stage) => {
      acc[stage.value] = applications?.filter((a) => a.stage === stage.value) || [];
      return acc;
    },
    {}
  );

  const counts = {};
  for (const stage of PIPELINE_STAGES) {
    counts[stage.value] = byStage[stage.value]?.length || 0;
  }

  const activeStages = stagesParam
    ? stagesParam.split(",").filter((s) => PIPELINE_STAGES.some((ps) => ps.value === s))
    : PIPELINE_STAGES.filter((s) => counts[s.value] > 0).map((s) => s.value);

  const visibleStages = PIPELINE_STAGES.filter((s) => activeStages.includes(s.value));

  return (
    <AppShell title="Pipeline de Reclutamiento">
      <p className="mb-4 text-sm text-slate-400">
        Vista Kanban del proceso. Mover etapas dispara webhooks n8n para emails y automatizaciones.
      </p>
      <StageFilter stages={PIPELINE_STAGES} counts={counts} />
      <div className="scrollbar-dark flex gap-4 overflow-x-auto pb-4">
        {visibleStages.map((stage) => (
          <div key={stage.value} className="min-w-[260px] flex-shrink-0">
            <div className={`mb-3 rounded-lg px-3 py-2 ${stage.color}`}>
              <span className="text-sm font-semibold text-white">{stage.label}</span>
              <span className="ml-2 text-xs text-white/80">({byStage[stage.value]?.length || 0})</span>
            </div>
            <div className="space-y-3">
              {byStage[stage.value]?.map((app) => {
                const candidate = rel(app.candidate);
                const job = rel(app.job);
                return (
                <div key={app.id} className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                  <Link
                    href={`/recruiter/candidates/${candidate?.id}`}
                    className="font-medium hover:text-indigo-400"
                  >
                    {candidate?.full_name}
                  </Link>
                  <p className="mt-1 text-xs text-slate-400">{job?.title}</p>
                  <p className="mt-2 text-sm font-semibold text-indigo-400">
                    {app.score ? Math.round(app.score) : "—"} pts
                  </p>
                  {app.stage === "interview" && (
                    <Link
                      href={`/recruiter/interviews?applicationId=${app.id}`}
                      className="mt-2 inline-block text-xs text-indigo-400 hover:text-indigo-300"
                    >
                      Agendar entrevista
                    </Link>
                  )}
                  {app.stage === "technical_test" && (
                    <StageAction
                      applicationId={app.id}
                      targetStage="offer"
                      label="Mover a Oferta"
                    />
                  )}
                  {app.stage === "offer" && (
                    <div className="mt-2 flex gap-2">
                      <StageAction
                        applicationId={app.id}
                        targetStage="hired"
                        label="Contratar"
                      />
                      <StageAction
                        applicationId={app.id}
                        targetStage="rejected"
                        label="Descartar"
                      />
                    </div>
                  )}
                  {app.stage === "rejected" && (() => {
                    const rejection = app.stage_history?.find(
                      (h) => h.to_stage === "rejected"
                    );
                    if (!rejection) return null;
                    return (
                      <div className="mt-2 rounded-lg border border-red-900/50 bg-red-950/30 p-2">
                        <p className="text-xs font-medium text-red-300">
                          {rejection.rejection_type === "candidate"
                            ? "El candidato rechazó la oferta"
                            : "Descartado por la empresa"}
                        </p>
                        {rejection.rejection_reason && (
                          <p className="mt-1 text-xs text-slate-400">
                            {rejection.rejection_reason}
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              );})}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
