"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Send, DollarSign, Calendar, Briefcase, Download } from "lucide-react";

export function OfferPanel({ application }) {
  const router = useRouter();
  const [mode, setMode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const [signedName, setSignedName] = useState(application.candidate?.full_name || "");
  const [startDate, setStartDate] = useState("");

  const [counterAmount, setCounterAmount] = useState("");
  const [counterPosition, setCounterPosition] = useState("");
  const [counterStartDate, setCounterStartDate] = useState("");
  const [counterNotes, setCounterNotes] = useState("");

  const status = application.offer_status;

  async function handleAccept() {
    if (!signedName.trim()) {
      setError("Escribe tu nombre completo para firmar");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/applications/${application.id}/offer`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "accept",
          signedName: signedName.trim(),
          startDate: startDate || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      router.refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCounter() {
    if (!counterAmount && !counterPosition && !counterStartDate && !counterNotes) {
      setError("Ingresa al menos un cambio en tu contraoferta");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/applications/${application.id}/offer`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "counter",
          counterAmount: counterAmount ? Number(counterAmount) : null,
          counterPosition: counterPosition || null,
          counterStartDate: counterStartDate || null,
          counterNotes: counterNotes || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      router.refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (result?.stage === "hired") {
    return (
      <div className="rounded-xl border border-emerald-800/50 bg-emerald-950/20 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600">
            <Check className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-emerald-300">¡Oferta aceptada!</h3>
            <p className="text-sm text-emerald-400/80">Has firmado el contrato exitosamente.</p>
          </div>
        </div>
        {result.pdfUrl && (
          <a
            href={result.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            <Download className="h-4 w-4" />
            Descargar contrato firmado
          </a>
        )}
      </div>
    );
  }

  if (status === "countered") {
    return (
      <div className="rounded-xl border border-amber-800/50 bg-amber-950/20 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-600">
            <Send className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-amber-300">Contraoferta enviada</h3>
            <p className="text-sm text-amber-400/80">La empresa revisará tu propuesta.</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "accepted") {
    return (
      <div className="rounded-xl border border-emerald-800/50 bg-emerald-950/20 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600">
            <Check className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-emerald-300">Oferta aceptada</h3>
            <p className="text-sm text-emerald-400/80">Firmado por {application.candidate_signed_name}</p>
          </div>
        </div>
        {application.offer_pdf_url && (
          <a
            href={application.offer_pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            <Download className="h-4 w-4" />
            Descargar contrato
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Mi Oferta</h3>
        <a
          href={`/api/applications/${application.id}/offer/preview`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:border-indigo-500 hover:text-indigo-300"
        >
          <Download className="h-3.5 w-3.5" />
          Ver contrato
        </a>
      </div>

      {/* Offer details */}
      <div className="mb-6 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <p className="text-slate-500">Salario ofrecido</p>
          <p className="text-xl font-bold text-emerald-400">
            {application.salary_offered
              ? `$${Number(application.salary_offered).toLocaleString("es-US")}/año`
              : "—"}
          </p>
        </div>
        {application.notes && (
          <div>
            <p className="text-slate-500">Notas del reclutador</p>
            <p className="text-slate-200">{application.notes}</p>
          </div>
        )}
      </div>

      {/* Accept or Counter */}
      {!mode && (
        <div className="flex gap-3">
          <button
            onClick={() => setMode("accept")}
            className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            <Check className="mr-1.5 inline-block h-4 w-4" />
            Aceptar y Firmar
          </button>
          <button
            onClick={() => setMode("counter")}
            className="flex-1 rounded-lg border border-amber-700 bg-amber-950/30 px-4 py-2.5 text-sm font-semibold text-amber-300 hover:bg-amber-900/30"
          >
            <Send className="mr-1.5 inline-block h-4 w-4" />
            Hacer Contraoferta
          </button>
        </div>
      )}

      {/* Accept mode */}
      {mode === "accept" && (
        <div className="space-y-4">
          <p className="text-sm text-slate-300">Revisa y firma el contrato para aceptar la oferta.</p>

          <div>
            <label className="mb-1 block text-sm text-slate-400">Nombre completo (firma digital) *</label>
            <input
              type="text"
              value={signedName}
              onChange={(e) => setSignedName(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-400">Fecha de inicio (opcional)</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleAccept}
              disabled={loading}
              className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {loading ? "Firmando..." : "Firmar y Aceptar"}
            </button>
            <button
              onClick={() => { setMode(null); setError(null); }}
              disabled={loading}
              className="rounded-lg border border-slate-600 px-4 py-2.5 text-sm text-slate-300 hover:border-slate-500"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Counter mode */}
      {mode === "counter" && (
        <div className="space-y-4">
          <p className="text-sm text-slate-300">Propón tus cambios para negociar la oferta.</p>

          <div>
            <label className="mb-1 flex items-center gap-1.5 text-sm text-slate-400">
              <DollarSign className="h-3.5 w-3.5" /> Contrapropuesta salarial
            </label>
            <input
              type="number"
              value={counterAmount}
              onChange={(e) => setCounterAmount(e.target.value)}
              placeholder="Ej: 60000"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1.5 text-sm text-slate-400">
              <Briefcase className="h-3.5 w-3.5" /> Cargo propuesto
            </label>
            <input
              type="text"
              value={counterPosition}
              onChange={(e) => setCounterPosition(e.target.value)}
              placeholder="Ej: Desarrollador Semi-Senior"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1.5 text-sm text-slate-400">
              <Calendar className="h-3.5 w-3.5" /> Fecha de inicio propuesta
            </label>
            <input
              type="date"
              value={counterStartDate}
              onChange={(e) => setCounterStartDate(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-400">Notas para tu contraoferta</label>
            <textarea
              value={counterNotes}
              onChange={(e) => setCounterNotes(e.target.value)}
              rows={3}
              placeholder="Explica tu propuesta..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleCounter}
              disabled={loading}
              className="flex-1 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-500 disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviar Contraoferta"}
            </button>
            <button
              onClick={() => { setMode(null); setError(null); }}
              disabled={loading}
              className="rounded-lg border border-slate-600 px-4 py-2.5 text-sm text-slate-300 hover:border-slate-500"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
