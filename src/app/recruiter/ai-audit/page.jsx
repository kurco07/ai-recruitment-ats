import { AppShell, StatCard } from "@/components/layout/app-shell";
import { Pagination } from "@/components/layout/pagination";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";

const PAGE_SIZE = 10;

const INPUT_PRICE_PER_M = 0.59;
const OUTPUT_PRICE_PER_M = 0.79;

function calcCost(inputTokens, outputTokens) {
  return (inputTokens / 1_000_000) * INPUT_PRICE_PER_M +
    (outputTokens / 1_000_000) * OUTPUT_PRICE_PER_M;
}

function formatCost(usd) {
  if (usd < 0.01) return `$${usd.toFixed(4)}`;
  return `$${usd.toFixed(2)}`;
}

export default async function AiAuditPage({ searchParams }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp?.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  const { data: logs, count } = await supabase
    .from("ai_audit_logs")
    .select("id, created_at, entity_type, model_version, input_tokens, output_tokens, total_tokens, latency_ms", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

  const totalTokens = logs?.reduce((acc, l) => acc + l.total_tokens, 0) || 0;
  const totalInput = logs?.reduce((acc, l) => acc + l.input_tokens, 0) || 0;
  const totalOutput = logs?.reduce((acc, l) => acc + l.output_tokens, 0) || 0;
  const avgLatency = logs?.length
    ? Math.round(logs.reduce((acc, l) => acc + l.latency_ms, 0) / logs.length)
    : 0;

  const totalCost = calcCost(totalInput, totalOutput);

  return (
    <AppShell title="IA & Tokens — Observabilidad">
      <div className="mb-6 rounded-xl border border-indigo-800/50 bg-indigo-950/20 p-4">
        <h2 className="font-semibold text-indigo-300">Optimización de tokens (Baremo #11)</h2>
        <ul className="mt-2 space-y-1 text-sm text-slate-300">
          <li>• Limitar CV a 12.000 caracteres antes de enviar a la IA</li>
          <li>• Usar gpt-4o-mini para análisis masivo; reservar modelos grandes para casos críticos</li>
          <li>• Cachear análisis por hash de CV para evitar reprocesamiento</li>
          <li>• Pedir JSON estructurado con response_format para reducir tokens de salida</li>
          <li>• Temperatura baja (0.2) para respuestas más deterministas y concisas</li>
        </ul>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total tokens" value={totalTokens.toLocaleString()} />
        <StatCard label="Input tokens" value={totalInput.toLocaleString()} />
        <StatCard label="Output tokens" value={totalOutput.toLocaleString()} />
        <StatCard label="Latencia media" value={`${avgLatency} ms`} />
        <StatCard label="Costo total (Groq)" value={formatCost(totalCost)} hint="$0.59 input / $0.79 output per 1M" />
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/80 text-left text-slate-400">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Entidad</th>
              <th className="px-4 py-3">Modelo</th>
              <th className="px-4 py-3">Tokens</th>
              <th className="px-4 py-3">Costo</th>
              <th className="px-4 py-3">Latencia</th>
            </tr>
          </thead>
          <tbody>
            {logs?.map((log) => {
              const cost = calcCost(log.input_tokens, log.output_tokens);
              return (
                <tr key={log.id} className="border-t border-slate-800">
                  <td className="px-4 py-3 text-slate-400">{formatDateTime(log.created_at)}</td>
                  <td className="px-4 py-3">{log.entity_type}</td>
                  <td className="px-4 py-3">{log.model_version}</td>
                  <td className="px-4 py-3">{log.total_tokens}</td>
                  <td className="px-4 py-3 text-emerald-400">{formatCost(cost)}</td>
                  <td className="px-4 py-3">{log.latency_ms} ms</td>
                </tr>
              );
            })}
            {!logs?.length && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Sin registros. Sube un CV para generar auditoría IA.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} basePath="/recruiter/ai-audit" />
    </AppShell>
  );
}
