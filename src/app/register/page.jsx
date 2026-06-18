import Link from "next/link";
import { RegisterForm } from "@/components/auth/auth-forms";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold">
            TalentAI ATS
          </Link>
          <p className="mt-2 text-sm text-slate-400">Crea tu cuenta de reclutamiento</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
