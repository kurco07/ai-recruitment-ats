import { AppShell } from "@/components/layout/app-shell";
import { CvUploadForm } from "@/components/candidates/cv-upload-form";
import { createClient } from "@/lib/supabase/server";

export default async function UploadCvPage() {
  const supabase = await createClient();
  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, title")
    .in("status", ["open", "draft"])
    .order("title");

  return (
    <AppShell title="Subir CV en PDF">
      <p className="mb-6 text-sm text-slate-400">
        La IA extraerá skills, detectará seniority, generará score y sugerirá el siguiente paso del
        proceso. El resultado dispara automatizaciones en n8n.
      </p>
      <CvUploadForm jobs={jobs || []} />
    </AppShell>
  );
}
