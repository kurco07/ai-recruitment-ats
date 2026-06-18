import Link from "next/link";
import { AppShell, Badge, EmptyState } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/server";
import { formatDate, getScoreColor } from "@/lib/utils";

export default async function CandidateDetailPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: candidate } = await supabase.from("candidates").select("*").eq("id", id).single();

  const { data: applications } = await supabase
    .from("applications")
    .select(`*, job:jobs(title, id)`)
    .eq("candidate_id", id);

  if (!candidate) {
    return (
      <AppShell title="Candidato no encontrado">
        <EmptyState title="No existe" description="Este candidato no fue encontrado." />
      </AppShell>
    );
  }

  const suggestions = candidate.ai_suggestions || [];
  const classification = candidate.ai_classification;

  return (
    <AppShell title={candidate.full_name}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="font-semibold">Resumen IA</h2>
            <p className="mt-3 text-slate-300">{candidate.ai_summary || "Sin análisis"}</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="font-semibold">Clasificación (JSON estándar)</h2>
            <pre className="mt-3 overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-300">
              {JSON.stringify(
                {
                  summary: candidate.ai_summary,
                  classification: classification,
                  suggestions: suggestions,
                  riskLevel: candidate.ai_risk_level,
                },
                null,
                2
              )}
            </pre>
          </div>

          {candidate.cv_text && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
              <h2 className="font-semibold">Texto extraído del CV</h2>
              <p className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap text-sm text-slate-400">
                {candidate.cv_text.slice(0, 3000)}
                {candidate.cv_text.length > 3000 && "..."}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <h3 className="font-semibold">Perfil</h3>
            <dl className="mt-4 space-y-2 text-sm">
              <div><dt className="text-slate-500">Email</dt><dd>{candidate.email}</dd></div>
              <div><dt className="text-slate-500">Teléfono</dt><dd>{candidate.phone || "—"}</dd></div>
              <div><dt className="text-slate-500">Seniority</dt><dd><Badge variant="info">{candidate.seniority}</Badge></dd></div>
              <div><dt className="text-slate-500">Experiencia</dt><dd>{candidate.experience_years ?? "—"} años</dd></div>
              <div><dt className="text-slate-500">Riesgo</dt><dd>{candidate.ai_risk_level}</dd></div>
            </dl>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <h3 className="font-semibold">Sugerencias IA</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {suggestions.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-indigo-400">•</span> {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <h3 className="font-semibold">Aplicaciones</h3>
            <div className="mt-3 space-y-2">
              {applications?.map((app) => (
                <Link
                  key={app.id}
                  href={`/recruiter/jobs/${app.job?.id}`}
                  className="block rounded-lg border border-slate-700 p-3 text-sm hover:border-indigo-600"
                >
                  <p>{app.job?.title}</p>
                  <p className={`font-semibold ${getScoreColor(app.score)}`}>
                    Score: {app.score ? Math.round(app.score) : "—"}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
