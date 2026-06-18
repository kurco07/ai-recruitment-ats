import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata = {
  title: "TalentAI ATS — Plataforma de Reclutamiento con IA",
  description:
    "ATS inteligente para analizar CVs, rankear candidatos y automatizar reclutamiento. Proyecto 2 — VENESOFT",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}
