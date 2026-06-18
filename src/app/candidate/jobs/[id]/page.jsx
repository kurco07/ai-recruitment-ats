import { AppShell, Badge } from "@/components/layout/app-shell";
import { CvUploadForm } from "@/components/candidates/cv-upload-form";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/layout/app-shell";

export default async function CandidateJobDetailPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: job } = await supabase.from("jobs").select("*").eq("id", id).single();

  if (!job) {
    return (
      <AppShell title="Vacante no encontrada">
        <EmptyState title="No existe" description="Esta vacante no está disponible." />
      </AppShell>
    );
  }

  return (
    <AppShell title={job.title}>
      <div className="mb-8 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex gap-2">
          <Badge variant="success">Abierta</Badge>
          <Badge variant="info">{job.seniority_level}</Badge>
        </div>
        <p className="mt-4 text-slate-300">{job.description}</p>
        <p className="mt-4 text-sm"><strong className="text-slate-400">Requisitos:</strong> {job.requirements}</p>
      </div>

      <h2 className="mb-4 text-lg font-semibold">Postular con tu CV</h2>
      <CvUploadForm jobs={[{ id: job.id, title: job.title }]} />
    </AppShell>
  );
}
