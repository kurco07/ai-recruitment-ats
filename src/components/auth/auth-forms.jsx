"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}
      <div>
        <label className="mb-1 block text-sm text-slate-300">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
          placeholder="tu@email.com"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-300">Contraseña</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
          placeholder="••••••••"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        {loading ? "Entrando..." : "Iniciar sesión"}
      </button>
      <p className="text-center text-sm text-slate-400">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="text-indigo-400 hover:underline">
          Regístrate
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("recruiter");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => router.push("/login"), 2000);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-800 bg-emerald-950/50 px-4 py-3 text-sm text-emerald-300">
          Cuenta creada. Revisa tu email o inicia sesión.
        </div>
      )}
      <div>
        <label className="mb-1 block text-sm text-slate-300">Nombre completo</label>
        <input
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-300">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-300">Contraseña</label>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-300">Rol</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
        >
          <option value="recruiter">Recruiter</option>
          <option value="hiring_manager">Hiring Manager</option>
          <option value="candidate">Candidato</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        {loading ? "Creando cuenta..." : "Crear cuenta"}
      </button>
      <p className="text-center text-sm text-slate-400">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-indigo-400 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
