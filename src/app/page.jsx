import Link from "next/link";
import { ArrowRight, BarChart3, Brain, Mail, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const ROLE_HOME = {
  recruiter: "/recruiter/dashboard",
  hiring_manager: "/manager/dashboard",
  admin: "/admin/users",
  candidate: "/candidate/dashboard",
};

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    const role = profile?.role || "candidate";
    redirect(ROLE_HOME[role]);
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <p className="text-lg font-bold">TalentAI ATS</p>
          <div className="flex gap-3">
            <Link href="/login" className="rounded-lg px-4 py-2 text-sm hover:bg-slate-800">
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-indigo-400">
          Proyecto 2 — AI Recruitment Platform
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Recluta más rápido con IA y automatización
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
          Analiza CVs en PDF, extrae skills, detecta seniority, genera ranking por vacante y
          automatiza confirmaciones por email con n8n.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-semibold hover:bg-indigo-500"
          >
            Comenzar gratis <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-slate-700 px-6 py-3 font-semibold hover:bg-slate-900"
          >
            Ya tengo cuenta
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-20 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Upload, title: "Upload CV PDF", desc: "Parsing automático de currículums con extracción de skills y experiencia." },
          { icon: Brain, title: "Análisis IA", desc: "Summary, classification, suggestions y riskLevel en JSON estructurado." },
          { icon: BarChart3, title: "Ranking por vacante", desc: "Score comparativo entre candidatos con detección de seniority." },
          { icon: Mail, title: "Automatización n8n", desc: "Emails, agendar entrevistas y mover etapas del pipeline automáticamente." },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
            <Icon className="h-8 w-8 text-indigo-400" />
            <h3 className="mt-4 font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-slate-400">{desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
