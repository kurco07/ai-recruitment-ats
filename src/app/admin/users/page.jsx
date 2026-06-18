import { AppShell } from "@/components/layout/app-shell";
import { AdminUsersPanel } from "@/components/admin/admin-users-panel";

export default function AdminUsersPage() {
  return (
    <AppShell title="Gestión de Usuarios y Roles">
      <p className="mb-6 text-sm text-slate-400">
        User story: asignar roles para controlar permisos (Recruiter, Hiring Manager, Candidato, Admin).
      </p>
      <AdminUsersPanel />
    </AppShell>
  );
}
