"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";

export function AdminUsersPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [search, setSearch] = useState("");

  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ fullName: "", email: "", role: "" });
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setUsers(data || []);
        setLoading(false);
      });
  }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  async function updateRole(userId, role) {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const data = await res.json();
    setMessage(data.error || "Rol actualizado");
    if (!data.error) {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
    }
  }

  function openEdit(user) {
    setEditUser(user);
    setEditForm({ fullName: user.full_name, email: user.email, role: user.role });
  }

  async function saveEdit() {
    if (!editUser) return;
    setSaving(true);
    const res = await fetch(`/api/admin/users/${editUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    const data = await res.json();
    setSaving(false);
    if (data.error) {
      setMessage(data.error);
    } else {
      setMessage("Usuario actualizado");
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editUser.id
            ? { ...u, full_name: editForm.fullName, email: editForm.email, role: editForm.role }
            : u
        )
      );
      setEditUser(null);
    }
  }

  async function deleteUser() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/users/${deleteTarget.id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    setDeleting(false);
    if (data.error) {
      setMessage(data.error);
    } else {
      setMessage("Usuario eliminado");
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  }

  if (loading) return <p className="text-slate-400">Cargando usuarios...</p>;

  return (
    <div>
      {message && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 p-3">
          <p className="text-sm text-emerald-400">{message}</p>
          <button onClick={() => setMessage(null)} className="text-slate-500 hover:text-slate-300">
            ✕
          </button>
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/80 text-left text-slate-400">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-t border-slate-800">
                <td className="px-4 py-3">{user.full_name}</td>
                <td className="px-4 py-3 text-slate-400">{user.email}</td>
                <td className="px-4 py-3 capitalize">{user.role.replace("_", " ")}</td>
                <td className="px-4 py-3 text-slate-400">{formatDate(user.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <select
                      value={user.role}
                      onChange={(e) => updateRole(user.id, e.target.value)}
                      className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
                    >
                      <option value="recruiter">Recruiter</option>
                      <option value="hiring_manager">Hiring Manager</option>
                      <option value="candidate">Candidato</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      onClick={() => openEdit(user)}
                      className="rounded border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setDeleteTarget(user)}
                      className="rounded border border-red-900/50 px-2 py-1 text-xs text-red-400 hover:bg-red-950/30"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  {search ? "Sin resultados para esa búsqueda." : "Sin usuarios registrados."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="mb-4 text-lg font-semibold">Editar usuario</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-slate-400">Nombre completo</label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-400">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-400">Rol</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                >
                  <option value="recruiter">Recruiter</option>
                  <option value="hiring_manager">Hiring Manager</option>
                  <option value="candidate">Candidato</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditUser(null)}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500 disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="mb-2 text-lg font-semibold text-red-400">Eliminar usuario</h3>
            <p className="text-sm text-slate-300">
              ¿Eliminar a <strong>{deleteTarget.full_name}</strong> ({deleteTarget.email})?
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Esta acción eliminará el perfil y la cuenta de autenticación. No se puede deshacer.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={deleteUser}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium hover:bg-red-500 disabled:opacity-50"
              >
                {deleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
