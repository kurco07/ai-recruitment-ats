import Link from "next/link";
import { Briefcase, LogOut } from "lucide-react";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

const NAV_BY_ROLE = {
  recruiter: [
    { href: "/recruiter/dashboard", label: "Dashboard" },
    { href: "/recruiter/jobs", label: "Vacantes" },
    { href: "/recruiter/candidates", label: "Candidatos" },
    { href: "/recruiter/candidates/upload", label: "Subir CV" },
    { href: "/recruiter/pipeline", label: "Pipeline" },
    { href: "/recruiter/interviews", label: "Entrevistas" },
    { href: "/recruiter/metrics", label: "Métricas" },
    { href: "/recruiter/ai-audit", label: "IA & Tokens" },
  ],
  hiring_manager: [
    { href: "/manager/dashboard", label: "Dashboard" },
    { href: "/manager/compare", label: "Comparar scores" },
    { href: "/manager/metrics", label: "Métricas" },
  ],
  admin: [
    { href: "/admin/users", label: "Usuarios" },
    { href: "/recruiter/dashboard", label: "Recruiter" },
  ],
  candidate: [
    { href: "/candidate/dashboard", label: "Mis aplicaciones" },
    { href: "/candidate/jobs", label: "Vacantes abiertas" },
  ],
};

export async function AppShell({ children, title }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const h = await headers();
  const role = h.get("x-user-role") || "candidate";

  const { data: profile } = user
    ? await supabase.from("profiles").select("full_name").eq("id", user.id).single()
    : { data: null };

  const navItems = NAV_BY_ROLE[role];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href={navItems[0]?.href || "/"} className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold">TalentAI ATS</p>
              <p className="text-xs text-slate-400">Proyecto 2 — Reclutamiento IA</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">{profile?.full_name}</p>
              <p className="text-xs capitalize text-slate-400">{role.replace("_", " ")}</p>
            </div>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="inline-flex items-center gap-1 rounded-md border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800"
              >
                <LogOut className="h-4 w-4" />
                Salir
              </button>
            </form>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto border-t border-slate-800 px-4 py-2 lg:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-md px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {title && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}

export function StatCard({ label, value, hint, className }) {
  return (
    <div className={cn("rounded-xl border border-slate-800 bg-slate-900/60 p-5", className)}>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function Badge({ children, variant = "default" }) {
  const variants = {
    default: "bg-slate-800 text-slate-200",
    success: "bg-emerald-900/50 text-emerald-300",
    warning: "bg-amber-900/50 text-amber-300",
    danger: "bg-red-900/50 text-red-300",
    info: "bg-indigo-900/50 text-indigo-300",
  };
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", variants[variant])}>
      {children}
    </span>
  );
}

export function EmptyState({ title, description }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/30 p-12 text-center">
      <p className="text-lg font-medium text-slate-200">{title}</p>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </div>
  );
}

export function ScoreBar({ score }) {
  const value = score ?? 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            value >= 80 ? "bg-emerald-500" : value >= 60 ? "bg-amber-500" : "bg-red-500"
          )}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
      <span className="w-10 text-right text-sm font-semibold">{value ? Math.round(value) : "—"}</span>
    </div>
  );
}
