import { AppShell } from "@/components/layout/app-shell";
import { JobForm } from "@/components/jobs/job-form";

export default function NewJobPage() {
  return (
    <AppShell title="Crear Vacante">
      <JobForm />
    </AppShell>
  );
}
