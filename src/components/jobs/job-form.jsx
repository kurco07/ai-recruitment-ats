"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function JobForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const body = Object.fromEntries(form.entries());

    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }

    router.push(`/recruiter/jobs/${data.job.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-4 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
      <div>
        <label className="mb-1 block text-sm text-slate-300">Título *</label>
        <input name="title" required className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-300">Descripción</label>
        <textarea name="description" rows={4} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-300">Requisitos (para matching IA)</label>
        <textarea name="requirements" rows={4} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" placeholder="React, Node.js, 3+ años..." />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm text-slate-300">Departamento</label>
          <input name="department" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-300">Seniority esperado</label>
          <select name="seniority_level" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm">
            <option value="junior">Junior</option>
            <option value="mid">Mid</option>
            <option value="senior">Senior</option>
            <option value="lead">Lead</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-300">Estado</label>
          <select name="status" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm">
            <option value="draft">Borrador</option>
            <option value="open">Abierta</option>
            <option value="closed">Cerrada</option>
          </select>
        </div>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button type="submit" disabled={loading} className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold hover:bg-indigo-500 disabled:opacity-50">
        {loading ? "Creando..." : "Crear vacante"}
      </button>
    </form>
  );
}
