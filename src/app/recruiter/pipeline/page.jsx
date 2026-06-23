import { AppShell } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/server";
import { PIPELINE_STAGES } from "@/lib/types";
import Link from "next/link";
import { rel } from "@/lib/utils";
import { StageAction } from "@/components/pipeline/stage-action";
import { StageFilter } from "@/components/pipeline/stage-filter";
import { AcceptCounterOffer } from "@/components/offer/accept-counter-offer";

export default async function PipelinePage({ searchParams }) {
  const sp = await searchParams;
  const stagesParam = sp?.stages || "";

  const supabase = await createClient();
  const { data: applications } = await supabase
    .from("applications")
    .select(
      `
      id, stage, score, salary_offered, offer_status, offer_counter_amount, offer_counter_position, offer_counter_notes, offer_pdf_url, notes,
      candidate:candidates(full_name, id),
      job:jobs(title, id),
      stage_history:stage_history(to_stage, rejection_reason, rejection_type, created_at)
    `,
    )
    .order("score", { ascending: false, nullsFirst: false });

  const byStage = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage.value] =
      applications?.filter((a) => a.stage === stage.value) || [];
    return acc;
  }, {});

  const counts = {};
  for (const stage of PIPELINE_STAGES) {
    counts[stage.value] = byStage[stage.value]?.length || 0;
  }

  const activeStages = stagesParam
    ? stagesParam
        .split(",")
        .filter((s) => PIPELINE_STAGES.some((ps) => ps.value === s))
    : PIPELINE_STAGES.filter((s) => counts[s.value] > 0).map((s) => s.value);

  const visibleStages = PIPELINE_STAGES.filter((s) =>
    activeStages.includes(s.value),
  );

  return (
    <AppShell title="Pipeline de Reclutamiento">
      <p className="mb-4 text-sm text-slate-400">Vista Kanban del proceso.</p>
      <StageFilter stages={PIPELINE_STAGES} counts={counts} />
      <div className="scrollbar-dark flex gap-4 overflow-x-auto pb-4">
        {visibleStages.map((stage) => (
          <div key={stage.value} className="min-w-[260px] flex-shrink-0">
            <div className={`mb-3 rounded-lg px-3 py-2 ${stage.color}`}>
              <span className="text-sm font-semibold text-white">
                {stage.label}
              </span>
              <span className="ml-2 text-xs text-white/80">
                ({byStage[stage.value]?.length || 0})
              </span>
            </div>
            <div className="space-y-3">
              {byStage[stage.value]?.map((app) => {
                const candidate = rel(app.candidate);
                const job = rel(app.job);
                return (
                  <div
                    key={app.id}
                    className="rounded-lg border border-slate-800 bg-slate-900/60 p-3"
                  >
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
                      <div className="mt-2 space-y-2">
                        <div className="rounded-lg border border-emerald-800/30 bg-emerald-950/20 p-2">
                          <p className="text-xs font-medium text-emerald-300">
                            Salario: ${app.salary_offered ? Number(app.salary_offered).toLocaleString("es-US") : "—"}
                          </p>
                          {app.offer_status === "pending" && (
                            <p className="text-xs text-slate-400">Pendiente de respuesta</p>
                          )}
                          {app.offer_status === "accepted" && (
                            <p className="text-xs text-emerald-400">✓ Aceptado</p>
                          )}
                          {app.offer_status === "countered" && app.offer_counter_amount && (
                            <p className="text-xs text-amber-400">
                              ← Contraoferta: ${Number(app.offer_counter_amount).toLocaleString("es-US")}
                              {app.offer_counter_position ? ` (${app.offer_counter_position})` : ""}
                            </p>
                          )}
                          {app.offer_counter_notes && (
                            <p className="mt-1 text-xs text-slate-500 italic">{app.offer_counter_notes}</p>
                          )}
                        </div>
                        {app.offer_pdf_url && (
                          <a
                            href={app.offer_pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-xs text-indigo-400 hover:text-indigo-300"
                          >
                            📄 Descargar contrato
                          </a>
                        )}
                        {app.offer_status === "countered" ? (
                          <AcceptCounterOffer applicationId={app.id} counterAmount={app.offer_counter_amount} counterPosition={app.offer_counter_position} />
                        ) : (
                          <div className="flex gap-2">
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
                      </div>
                    )}
                    {app.stage === "rejected" &&
                      (() => {
                        const rejection = app.stage_history?.find(
                          (h) => h.to_stage === "rejected",
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
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
