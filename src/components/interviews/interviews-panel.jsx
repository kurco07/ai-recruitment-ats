"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { formatDateTime } from "@/lib/utils";
import { PIPELINE_STAGES } from "@/lib/types";
import { Calendar, Loader2 } from "lucide-react";

const NEXT_STAGES = PIPELINE_STAGES.filter(
  (s) => s.value !== "applied" && s.value !== "screening"
);

export function InterviewsPanel({ applications }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedApp = searchParams.get("applicationId") || "";
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedApp, setSelectedApp] = useState(preselectedApp);
  const [finalizingId, setFinalizingId] = useState(null);
  const [nextStage, setNextStage] = useState("technical_test");

  useEffect(() => {
    fetchInterviews();
  }, []);

  async function fetchInterviews() {
    const res = await fetch("/api/interviews");
    const d = await res.json();
    setInterviews(d.interviews || []);
    setLoading(false);
  }

  async function handleSchedule(e) {
    e.preventDefault();
    setScheduling(true);
    setMessage(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/interviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Entrevista agendada. n8n enviará confirmación por email.");
      e.currentTarget.reset();
      setSelectedApp("");
      await fetchInterviews();
      router.refresh();
    } else {
      setMessage(data.error);
    }
    setScheduling(false);
  }

  async function handleComplete(interviewId, applicationId) {
    await fetch(`/api/interviews/${interviewId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    });
    await fetch(`/api/applications/${applicationId}/stage`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: nextStage }),
    });
    setFinalizingId(null);
    await fetchInterviews();
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={handleSchedule} className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="font-semibold">Agendar entrevista</h2>
        <p className="text-xs text-slate-400">Automatización n8n: email de confirmación al candidato</p>
        <div>
          <label className="mb-1 block text-sm text-slate-300">Candidato *</label>
          <select
            name="applicationId"
            required
            value={selectedApp}
            onChange={(e) => setSelectedApp(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          >
            <option value="">Seleccionar candidato — vacante</option>
            {applications.map((app) => (
              <option key={app.id} value={app.id}>
                {app.candidate?.full_name} — {app.job?.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-300">Fecha y hora *</label>
          <input name="scheduledAt" type="datetime-local" required className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-300">URL reunión</label>
          <input name="meetingUrl" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" placeholder="https://meet.google.com/..." />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-300">Notas</label>
          <textarea name="notes" rows={2} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" />
        </div>
        <button type="submit" disabled={scheduling} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500 disabled:opacity-50">
          {scheduling ? "Agendando..." : "Agendar y notificar"}
        </button>
        {message && <p className="text-sm text-emerald-400">{message}</p>}
      </form>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="mb-4 font-semibold">Próximas entrevistas</h2>
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        ) : interviews.length === 0 ? (
          <p className="text-sm text-slate-500">No hay entrevistas programadas</p>
        ) : (
          <div className="space-y-3">
            {interviews.filter((i) => i.status !== "completed").map((i) => (
              <div key={i.id} className="rounded-lg border border-slate-700 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 flex-shrink-0 text-indigo-400" />
                      <span className="font-medium truncate">{i.application?.candidate?.full_name}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">{i.application?.job?.title}</p>
                    <p className="mt-2 text-sm">{formatDateTime(i.scheduled_at)}</p>
                    {i.meeting_url && (
                      <a href={i.meeting_url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-indigo-400 hover:underline">
                        Unirse a reunión
                      </a>
                    )}
                  </div>
                  {finalizingId !== i.id && (
                    <button
                      onClick={() => { setFinalizingId(i.id); setNextStage("technical_test"); }}
                      className="flex-shrink-0 rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs text-slate-400 hover:border-indigo-500 hover:text-indigo-400"
                    >
                      Finalizar
                    </button>
                  )}
                </div>

                {finalizingId === i.id && (
                  <div className="mt-4 space-y-2 rounded-lg border border-slate-700 bg-slate-950/50 p-3">
                    <select
                      value={nextStage}
                      onChange={(e) => setNextStage(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                    >
                      {NEXT_STAGES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleComplete(i.id, i.application?.id)}
                        className="flex-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium hover:bg-emerald-500"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => { setFinalizingId(null); setNextStage("technical_test"); }}
                        className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-500"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
