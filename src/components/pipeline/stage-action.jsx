"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PIPELINE_STAGES } from "@/lib/types";

const REJECTION_TYPES = [
  { value: "company", label: "La empresa descartó al candidato" },
  { value: "candidate", label: "El candidato rechazó la oferta" },
];

export function StageAction({ applicationId, targetStage, label, onComplete }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [salary, setSalary] = useState("");
  const [notes, setNotes] = useState("");
  const [rejectionType, setRejectionType] = useState("company");
  const [rejectionReason, setRejectionReason] = useState("");

  async function handleConfirm() {
    setLoading(true);
    const body = {
      stage: targetStage,
      ...(targetStage === "offer" ? { salaryOffered: salary ? Number(salary) : null } : {}),
      ...(targetStage === "rejected" ? { rejectionType, rejectionReason: rejectionReason || null } : {}),
      ...(notes ? { notes } : {}),
    };
    const res = await fetch(`/api/applications/${applicationId}/stage`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setOpen(false);
      setSalary("");
      setNotes("");
      setRejectionReason("");
      router.refresh();
      onComplete?.();
    }
    setLoading(false);
  }

  function handleCancel() {
    setOpen(false);
    setSalary("");
    setNotes("");
    setRejectionReason("");
  }

  const stageLabel = PIPELINE_STAGES.find((s) => s.value === targetStage)?.label || targetStage;

  return (
    <div className="mt-2">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="w-full rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:border-indigo-500 hover:text-indigo-400"
        >
          {label || `Mover a ${stageLabel}`}
        </button>
      )}

      {open && (
        <div className="space-y-2 rounded-lg border border-slate-700 bg-slate-950/50 p-3">
          <p className="text-xs font-medium text-slate-300">
            {label || `Mover a ${stageLabel}`}
          </p>

          {targetStage === "offer" && (
            <div>
              <label className="mb-1 block text-xs text-slate-400">
                Salario ofrecido
              </label>
              <input
                type="number"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="Ej: 50000"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              />
            </div>
          )}

          {targetStage === "rejected" && (
            <>
              <div>
                <label className="mb-1 block text-xs text-slate-400">
                  Motivo del rechazo
                </label>
                <select
                  value={rejectionType}
                  onChange={(e) => setRejectionType(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                >
                  {REJECTION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">
                  Detalle del motivo
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={2}
                  placeholder="Explica el motivo..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                />
              </div>
            </>
          )}

          <div>
            <label className="mb-1 block text-xs text-slate-400">Notas</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Notas internas..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium hover:bg-emerald-500 disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Confirmar"}
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-500"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
