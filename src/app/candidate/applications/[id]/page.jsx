import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { AppShell, Badge, EmptyState } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatDateTime, getScoreColor, getRiskBadgeColor, rel } from "@/lib/utils";
import { STAGE_LABELS, PIPELINE_STAGES } from "@/lib/types";
import { OfferPanel } from "@/components/offer/offer-panel";

const STAGE_COLORS = {
  applied: "bg-slate-500",
  screening: "bg-blue-500",
  interview: "bg-violet-500",
  technical_test: "bg-amber-500",
  offer: "bg-emerald-500",
  hired: "bg-green-600",
  rejected: "bg-red-500",
};

export default async function ApplicationDetailPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: application } = await supabase
    .from("applications")
    .select("*, job:jobs(*), candidate:candidates(*)")
    .eq("id", id)
    .single();

  if (!application) notFound();

  const candidate = rel(application.candidate);
  if (!candidate || candidate.user_id !== user.id) notFound();

  const job = rel(application.job);

  const { data: interviews } = await supabase
    .from("interviews")
    .select("*")
    .eq("application_id", id)
    .order("scheduled_at", { ascending: true });

  const { data: history } = await supabase
    .from("stage_history")
    .select("*")
    .eq("application_id", id)
    .order("created_at", { ascending: true });

  const currentStageIndex = PIPELINE_STAGES.findIndex(
    (s) => s.value === application.stage
  );

  const skills = Array.isArray(candidate.skills) ? candidate.skills : [];
  const suggestions = Array.isArray(candidate.ai_suggestions) ? candidate.ai_suggestions : [];

  return (
    <AppShell title={`Aplicación — ${job?.title || "Vacante"}`}>
      <Link href="/candidate/dashboard" className="mb-6 inline-flex items-center gap-1 text-sm text-indigo-400 hover:underline">
        ← Volver a mis aplicaciones
      </Link>

      {/* Estado de la aplicación */}
      <div className="mb-8 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">{job?.title}</h2>
            <p className="mt-1 text-sm text-slate-400">
              {job?.department && `${job.department} · `}
              {job?.seniority_level}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-bold ${getScoreColor(application.score)}`}>
              {application.score ? Math.round(application.score) : "—"}
            </p>
            <p className="text-xs text-slate-500">Score de match</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white ${STAGE_COLORS[application.stage] || "bg-slate-500"}`}>
            {STAGE_LABELS[application.stage]}
          </span>
          {application.ranking_position && (
            <span className="inline-flex items-center rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
              #{application.ranking_position} en ranking
            </span>
          )}
        </div>

        <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-slate-500">Fecha de aplicación</p>
            <p className="text-slate-200">{formatDate(application.created_at)}</p>
          </div>
          {application.stage_changed_at && (
            <div>
              <p className="text-slate-500">Último cambio de etapa</p>
              <p className="text-slate-200">{formatDate(application.stage_changed_at)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Pipeline visual */}
      <div className="mb-8 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <h3 className="mb-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Progreso del proceso</h3>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {PIPELINE_STAGES.map((stage, i) => {
            const isActive = stage.value === application.stage;
            const isPast = i < currentStageIndex;
            const isRejected = application.stage === "rejected";

            return (
              <div key={stage.value} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                      isActive
                        ? `${stage.color} text-white ring-2 ring-white/30`
                        : isPast && !isRejected
                          ? `${stage.color} text-white opacity-60`
                          : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    {isPast && !isActive ? "✓" : i + 1}
                  </div>
                  <span className={`mt-1 text-[10px] whitespace-nowrap ${isActive ? "text-white font-semibold" : "text-slate-500"}`}>
                    {stage.label}
                  </span>
                </div>
                {i < PIPELINE_STAGES.length - 1 && (
                  <div className={`mx-1 mb-5 h-0.5 w-6 ${isPast && !isRejected ? "bg-slate-500" : "bg-slate-800"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Oferta */}
      {application.stage === "offer" && (
        <div className="mb-8">
          <OfferPanel application={application} />
        </div>
      )}

      {/* Historial de etapas */}
      {history && history.length > 0 && (
        <div className="mb-8 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Historial de cambios</h3>
          <div className="space-y-3">
            {history.map((h) => (
              <div key={h.id} className="flex items-start gap-3">
                <div className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full ${STAGE_COLORS[h.to_stage] || "bg-slate-500"}`} />
                <div>
                  <p className="text-sm text-slate-200">
                    {h.from_stage ? `${STAGE_LABELS[h.from_stage]} → ` : ""}
                    <span className="font-semibold">{STAGE_LABELS[h.to_stage]}</span>
                  </p>
                  <p className="text-xs text-slate-500">{formatDateTime(h.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Entrevistas */}
      <div className="mb-8 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <h3 className="mb-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Entrevistas</h3>
        {!interviews?.length ? (
          <p className="text-sm text-slate-500">No hay entrevistas programadas.</p>
        ) : (
          <div className="space-y-3">
            {interviews.map((interview) => (
              <div key={interview.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    {formatDateTime(interview.scheduled_at)}
                  </p>
                  {interview.notes && (
                    <p className="mt-1 text-xs text-slate-400">{interview.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    interview.status === "completed"
                      ? "bg-emerald-100 text-emerald-800"
                      : interview.status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-violet-100 text-violet-800"
                  }`}>
                    {interview.status === "completed" ? "Completada" : interview.status === "cancelled" ? "Cancelada" : "Programada"}
                  </span>
                  {interview.meeting_url && (
                    <a
                      href={interview.meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
                    >
                      Unirse
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info del perfil / CV */}
      <div className="mb-8 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <h3 className="mb-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Tu perfil</h3>
        <div className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-slate-500">Experiencia</p>
            <p className="text-slate-200">{candidate.experience_years ? `${candidate.experience_years} años` : "—"}</p>
          </div>
          <div>
            <p className="text-slate-500">Seniority</p>
            <p className="text-slate-200 capitalize">{candidate.seniority || "—"}</p>
          </div>
          {candidate.ai_risk_level && (
            <div>
              <p className="text-slate-500">Nivel de riesgo</p>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getRiskBadgeColor(candidate.ai_risk_level)}`}>
                {candidate.ai_risk_level}
              </span>
            </div>
          )}
        </div>

        {skills.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-sm text-slate-500">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill, i) => (
                <span key={i} className="inline-flex items-center rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {candidate.ai_summary && (
          <div className="mt-4">
            <p className="mb-1 text-sm text-slate-500">Resumen IA</p>
            <p className="text-sm text-slate-300 leading-relaxed">{candidate.ai_summary}</p>
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-sm text-slate-500">Sugerencias</p>
            <ul className="list-inside list-disc space-y-1 text-sm text-slate-300">
              {suggestions.map((s, i) => (
                <li key={i}>{typeof s === "string" ? s : s.text || JSON.stringify(s)}</li>
              ))}
            </ul>
          </div>
        )}

        {candidate.cv_url && (
          <div className="mt-4">
            <a
              href={candidate.cv_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:underline"
            >
              Ver CV original ↗
            </a>
          </div>
        )}
      </div>

      {/* Info de la vacante */}
      {job && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Sobre la vacante</h3>
          <p className="text-sm text-slate-300 leading-relaxed">{job.description}</p>
          {job.requirements && (
            <p className="mt-3 text-sm"><span className="text-slate-500">Requisitos:</span> <span className="text-slate-300">{job.requirements}</span></p>
          )}
        </div>
      )}
    </AppShell>
  );
}
