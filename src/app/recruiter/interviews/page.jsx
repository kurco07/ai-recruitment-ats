import { AppShell } from "@/components/layout/app-shell";
import { InterviewsPanel } from "@/components/interviews/interviews-panel";
import { createClient } from "@/lib/supabase/server";

export default async function InterviewsPage() {
  const supabase = await createClient();
  const { data: applications } = await supabase
    .from("applications")
    .select(`
      id, stage,
      candidate:candidates(full_name),
      job:jobs(title)
    `)
    .eq("stage", "interview")
    .order("created_at", { ascending: false });

  return (
    <AppShell title="Entrevistas">
      <InterviewsPanel applications={applications || []} />
    </AppShell>
  );
}
