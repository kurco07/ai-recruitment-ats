"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PIPELINE_STAGES, STAGE_LABELS } from "@/lib/types";

export function StageSelector({ applicationId, currentStage, aiNextStep }) {
  const router = useRouter();
  const [stage, setStage] = useState(currentStage);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [approveAi, setApproveAi] = useState(false);

  async function handleMove() {
    setLoading(true);
    setMessage(null);

    const response = await fetch(`/api/applications/${applicationId}/stage`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage, approveAiSuggestion: approveAi }),
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Error al mover etapa");
    } else {
      setMessage("Etapa actualizada. n8n notificado por email.");
      router.refresh();
    }
    setLoading(false);
  }

  const normalize = (str) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[_\s]+/g, "");

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <p className="text-sm font-medium">Mover candidato de etapa</p>
      <p className="mt-1 text-xs text-slate-400">
        Human-in-the-loop: confirma manualmente antes de ejecutar acciones
        críticas.
      </p>

      {aiNextStep && normalize(aiNextStep) !== normalize(STAGE_LABELS[currentStage]) && (
        <div className="mt-3 rounded-lg border border-indigo-800/50 bg-indigo-950/30 px-3 py-2 text-sm">
          <span className="text-indigo-300">Sugerencia IA:</span> {aiNextStep}
          <label className="mt-2 flex items-center gap-2 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={approveAi}
              onChange={(e) => {
                setApproveAi(e.target.checked);
                if (e.target.checked) {
                  const match = PIPELINE_STAGES.find(
                    (s) =>
                      normalize(aiNextStep).includes(normalize(s.label)) ||
                      normalize(aiNextStep).includes(normalize(s.value)),
                  );
                  if (match) setStage(match.value);
                }
              }}
            />
            Aplicar sugerencia de IA
          </label>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-slate-400">
            Nueva etapa
          </label>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          >
            {PIPELINE_STAGES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleMove}
          disabled={loading || stage === currentStage}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? "Guardando..." : `Mover a ${STAGE_LABELS[stage]}`}
        </button>
      </div>
      {message && <p className="mt-2 text-sm text-emerald-400">{message}</p>}
      <p className="mt-2 text-xs text-slate-500">
        Etapa actual: {STAGE_LABELS[currentStage]}
      </p>
    </div>
  );
}
