import Link from "next/link";
import { AppShell, Badge, EmptyState } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/server";
import { formatDate, getScoreColor, rel } from "@/lib/utils";
import { STAGE_LABELS } from "@/lib/types";

export default async function CandidateDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: candidates } = await supabase
    .from("candidates")
    .select("id")
    .eq("user_id", user.id);

  const candidateIds = (candidates || []).map((c) => c.id);

  const { data: applications } = candidateIds.length > 0
    ? await supabase
        .from("applications")
        .select(`*, job:jobs(title, id), candidate:candidates(full_name)`)
        .in("candidate_id", candidateIds)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <AppShell title="Mis Aplicaciones">
      <p className="mb-6 text-sm text-slate-400">
        User story #7: recibir confirmaciones por correo en cada cambio de etapa (vía n8n).
      </p>

      {!applications?.length ? (
        <EmptyState
          title="Sin aplicaciones"
          description="Explora vacantes abiertas y postúlate."
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const job = rel(app.job);
            const candidate = rel(app.candidate);
            return (
            <Link key={app.id} href={`/candidate/applications/${app.id}`} className="block rounded-xl border border-slate-800 bg-slate-900/50 p-5 transition hover:border-indigo-500/50">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold hover:text-indigo-400">
                    {job?.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {candidate?.full_name} · {STAGE_LABELS[app.stage]}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${getScoreColor(app.score)}`}>
                    {app.score ? Math.round(app.score) : "—"}
                  </p>
                  <p className="text-xs text-slate-500">Score de match</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="info">{app.ai_next_step || "En revisión"}</Badge>
                <span className="text-xs text-slate-500">{formatDate(app.created_at)}</span>
              </div>
            </Link>
          );})}
        </div>
      )}

      <div className="mt-6">
        <Link href="/candidate/jobs" className="text-indigo-400 hover:underline">
          Ver vacantes abiertas →
        </Link>
      </div>
    </AppShell>
  );
}
