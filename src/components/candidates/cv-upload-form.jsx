"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, Loader2 } from "lucide-react";

export function CvUploadForm({ jobs }) {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [jobId, setJobId] = useState(jobs[0]?.id || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      setError("Selecciona un archivo PDF");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("phone", phone);
    if (jobId) formData.append("jobId", jobId);

    try {
      const response = await fetch("/api/candidates/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error al procesar CV");
      setResult(data);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <div>
          <label className="mb-1 block text-sm text-slate-300">CV en PDF *</label>
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-700 bg-slate-950 px-6 py-10 hover:border-indigo-500">
            <Upload className="mb-2 h-8 w-8 text-slate-500" />
            <span className="text-sm text-slate-400">
              {file ? file.name : "Arrastra o selecciona un PDF"}
            </span>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-slate-300">Nombre completo *</label>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className={`grid gap-4 ${jobs.length === 1 ? "sm:grid-cols-1" : "sm:grid-cols-2"}`}>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Teléfono</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            />
          </div>
          {jobs.length > 1 && (
            <div>
              <label className="mb-1 block text-sm text-slate-300">Vacante</label>
              <select
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              >
                <option value="">Sin vacante específica</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Analizando con IA...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4" /> Subir y analizar CV
            </>
          )}
        </button>
      </form>

      {result && (
        <div className="rounded-xl border border-emerald-800/50 bg-emerald-950/20 p-6">
          <h3 className="text-lg font-semibold text-emerald-300">Análisis completado</h3>
          <pre className="mt-4 max-h-96 overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-300">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
