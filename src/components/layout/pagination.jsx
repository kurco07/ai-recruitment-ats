import Link from "next/link";

export function Pagination({ page, totalPages, basePath }) {
  if (totalPages <= 1) return null;

  const buildUrl = (p) => {
    const url = new URL(basePath, "http://localhost");
    url.searchParams.set("page", String(p));
    return url.pathname + url.search;
  };

  return (
    <div className="mt-6 flex items-center justify-center gap-4 text-sm">
      {page > 1 ? (
        <Link
          href={buildUrl(page - 1)}
          className="rounded-lg border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
        >
          ← Anterior
        </Link>
      ) : (
        <span className="rounded-lg border border-slate-800 px-4 py-2 text-slate-600">
          ← Anterior
        </span>
      )}

      <span className="text-slate-400">
        Página {page} de {totalPages}
      </span>

      {page < totalPages ? (
        <Link
          href={buildUrl(page + 1)}
          className="rounded-lg border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
        >
          Siguiente →
        </Link>
      ) : (
        <span className="rounded-lg border border-slate-800 px-4 py-2 text-slate-600">
          Siguiente →
        </span>
      )}
    </div>
  );
}
