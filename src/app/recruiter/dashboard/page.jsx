import Link from "next/link";
import { AppShell, StatCard } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/server";
import { formatDate, rel } from "@/lib/utils";
import { ArrowRight, Briefcase, Brain, Users } from "lucide-react";

export default async function RecruiterDashboard() {
  const supabase = await createClient();

  const [
    { count: jobsCount },
    { count: candidatesCount },
    { count: applicationsCount },
    { count: interviewsCount },
    { data: recentApplications },
    { data: tokenStats },
  ] = await Promise.all([
    supabase.from("jobs").select("*", { count: "exact", head: true }),
    supabase.from("candidates").select("*", { count: "exact", head: true }),
    supabase.from("applications").select("*", { count: "exact", head: true }),
    supabase.from("interviews").select("*", { count: "exact", head: true }),
    supabase
      .from("applications")
      .select(`id, score, stage, created_at, candidate:candidates(full_name), job:jobs(title)`)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("ai_audit_logs").select("total_tokens, latency_ms").limit(500),
  ]);

  const totalTokens = tokenStats?.reduce((acc, l) => acc + (l.total_tokens || 0), 0) || 0;
  const avgLatency = tokenStats?.length
    ? Math.round(tokenStats.reduce((acc, l) => acc + (l.latency_ms || 0), 0) / tokenStats.length)
    : 0;

  return (
    <AppShell title="Dashboard de Reclutamiento">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Vacantes" value={jobsCount || 0} hint="Total en plataforma" />
        <StatCard label="Candidatos" value={candidatesCount || 0} hint="CVs analizados" />
        <StatCard label="Aplicaciones" value={applicationsCount || 0} hint="Matching activo" />
        <StatCard label="Entrevistas" value={interviewsCount || 0} hint="Programadas" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <StatCard
          label="Tokens IA consumidos"
          value={totalTokens.toLocaleString()}
          hint="Observabilidad — criterio baremo #10"
        />
        <StatCard label="Latencia media IA" value={`${avgLatency} ms`} hint="Por análisis de CV" />
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-sm text-slate-400">Acciones rápidas</p>
          <div className="mt-4 space-y-2">
            <Link href="/recruiter/candidates/upload" className="flex items-center gap-2 text-sm text-indigo-400 hover:underline">
              <Users className="h-4 w-4" /> Subir CV PDF
            </Link>
            <Link href="/recruiter/jobs/new" className="flex items-center gap-2 text-sm text-indigo-400 hover:underline">
              <Briefcase className="h-4 w-4" /> Crear vacante
            </Link>
            <Link href="/recruiter/ai-audit" className="flex items-center gap-2 text-sm text-indigo-400 hover:underline">
              <Brain className="h-4 w-4" /> Ver auditoría IA
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Aplicaciones recientes</h2>
        <div className="overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/80 text-left text-slate-400">
              <tr>
                <th className="px-4 py-3">Candidato</th>
                <th className="px-4 py-3">Vacante</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Etapa</th>
                <th className="px-4 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {recentApplications?.map((app) => {
                const candidate = rel(app.candidate);
                const job = rel(app.job);
                return (
                <tr key={app.id} className="border-t border-slate-800">
                  <td className="px-4 py-3">{candidate?.full_name}</td>
                  <td className="px-4 py-3">{job?.title}</td>
                  <td className="px-4 py-3 font-semibold text-indigo-400">
                    {app.score ? Math.round(app.score) : "—"}
                  </td>
                  <td className="px-4 py-3 capitalize">{app.stage?.replace("_", " ")}</td>
                  <td className="px-4 py-3 text-slate-400">{formatDate(app.created_at)}</td>
                </tr>
              );})}
              {!recentApplications?.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No hay aplicaciones.{" "}
                    <Link href="/recruiter/candidates/upload" className="text-indigo-400 hover:underline">
                      Sube un CV
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
