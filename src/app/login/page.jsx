import Link from "next/link";
import { LoginForm } from "@/components/auth/auth-forms";

const ERROR_MESSAGES = {
  no_profile: "Tu cuenta no tiene un perfil asociado. Contacta al administrador.",
};

export default async function LoginPage({ searchParams }) {
  const sp = await searchParams;
  const error = sp?.error;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold">
            TalentAI ATS
          </Link>
          <p className="mt-2 text-sm text-slate-400">Inicia sesión en tu cuenta</p>
        </div>
        {error && ERROR_MESSAGES[error] && (
          <div className="mb-4 rounded-lg border border-red-800/50 bg-red-950/30 p-4 text-sm text-red-300">
            {ERROR_MESSAGES[error]}
          </div>
        )}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
