"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";

export function AcceptCounterOffer({ applicationId, counterAmount, counterPosition }) {
  const router = useRouter();
  const [loading, setLoading] = useState(null);

  async function handleAccept() {
    setLoading("accept");
    try {
      const res = await fetch(`/api/applications/${applicationId}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage: "hired",
          salaryOffered: counterAmount,
          notes: "Contraoferta aceptada",
        }),
      });
      if (res.ok) router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  }

  async function handleReject() {
    setLoading("reject");
    try {
      const res = await fetch(`/api/applications/${applicationId}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage: "rejected",
          rejectionType: "company",
          rejectionReason: "Contraoferta rechazada",
          notes: "El reclutador rechazó la contraoferta",
        }),
      });
      if (res.ok) router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  }

  async function handleKeepOriginal() {
    setLoading("keep");
    try {
      const res = await fetch(`/api/applications/${applicationId}/offer/reset-counter`, {
        method: "PATCH",
      });
      if (res.ok) router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mt-2 flex flex-col gap-2">
      <button
        onClick={handleAccept}
        disabled={loading}
        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium hover:bg-emerald-500 disabled:opacity-50"
      >
        {loading === "accept" ? "..." : `Aceptar contraoferta ($${Number(counterAmount).toLocaleString("es-US")}${counterPosition ? ` - ${counterPosition}` : ""})`}
      </button>
      <div className="flex gap-2">
        <button
          onClick={handleKeepOriginal}
          disabled={loading}
          className="flex-1 rounded-lg border border-amber-700 bg-amber-950/30 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-900/30 disabled:opacity-50"
        >
          {loading === "keep" ? "..." : (
            <><RotateCcw className="mr-1 inline-block h-3 w-3" />Mantener oferta original</>
          )}
        </button>
        <button
          onClick={handleReject}
          disabled={loading}
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:border-red-500 hover:text-red-400 disabled:opacity-50"
        >
          {loading === "reject" ? "..." : "Rechazar"}
        </button>
      </div>
    </div>
  );
}
