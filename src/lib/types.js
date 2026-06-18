export const PIPELINE_STAGES = [
  { value: "applied", label: "Aplicado", color: "bg-slate-500" },
  { value: "screening", label: "Screening", color: "bg-blue-500" },
  { value: "interview", label: "Entrevista", color: "bg-violet-500" },
  { value: "technical_test", label: "Prueba técnica", color: "bg-amber-500" },
  { value: "offer", label: "Oferta", color: "bg-emerald-500" },
  { value: "hired", label: "Contratado", color: "bg-green-600" },
  { value: "rejected", label: "Descartado", color: "bg-red-500" },
];

export const STAGE_LABELS = Object.fromEntries(
  PIPELINE_STAGES.map((s) => [s.value, s.label])
);
