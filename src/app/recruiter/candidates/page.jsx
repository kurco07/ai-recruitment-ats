import Link from "next/link";
import { AppShell, Badge, EmptyState } from "@/components/layout/app-shell";
import { Pagination } from "@/components/layout/pagination";
import { createClient } from "@/lib/supabase/server";
import { formatDate, getRiskBadgeColor } from "@/lib/utils";

const PAGE_SIZE = 10;

export default async function CandidatesPage({ searchParams }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp?.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  const { data: candidates, count } = await supabase
    .from("candidates")
    .select("id, full_name, email, seniority, skills, ai_risk_level, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

  return (
    <AppShell title="Dashboard de Candidatos">
      <div className="mb-6 flex justify-end">
        <Link
          href="/recruiter/candidates/upload"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500"
        >
          Subir CV
        </Link>
      </div>

      {!candidates?.length ? (
        <EmptyState title="Sin candidatos" description="Sube CVs en PDF para analizarlos con IA." />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/80 text-left text-slate-400">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Seniority</th>
                  <th className="px-4 py-3">Skills</th>
                  <th className="px-4 py-3">Riesgo</th>
                  <th className="px-4 py-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => (
                  <tr key={c.id} className="border-t border-slate-800 hover:bg-slate-900/50">
                    <td className="px-4 py-3">
                      <Link href={`/recruiter/candidates/${c.id}`} className="font-medium hover:text-indigo-400">
                        {c.full_name}
                      </Link>
                      <p className="text-xs text-slate-500">{c.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="info">{c.seniority || "—"}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {c.skills?.slice(0, 3).map((s) => (
                          <span key={s} className="rounded bg-slate-800 px-2 py-0.5 text-xs">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${getRiskBadgeColor(c.ai_risk_level)}`}>
                        {c.ai_risk_level || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{formatDate(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} basePath="/recruiter/candidates" />
        </>
      )}
    </AppShell>
  );
}
