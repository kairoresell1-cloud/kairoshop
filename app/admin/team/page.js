"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import AdminPageShell from "@/components/AdminPageShell";

const ALL_PERMISSIONS = [
  "USERS_VIEW", "USERS_EDIT", "USERS_DELETE",
  "PRODUCTS_VIEW", "PRODUCTS_EDIT", "PRODUCTS_DELETE",
  "ORDERS_VIEW", "ORDERS_EDIT", "ORDERS_DELETE",
  "INVENTORY_VIEW", "INVENTORY_EDIT",
  "PROMOTIONS_VIEW", "PROMOTIONS_EDIT",
  "COUPONS_VIEW", "COUPONS_EDIT",
  "ANALYTICS_VIEW", "FINANCE_VIEW",
  "SUPPLIERS_VIEW", "SUPPLIERS_EDIT", "SUPPLIERS_DELETE", "SUPPLIERS_COSTS_VIEW",
  "AUDIT_LOG_VIEW",
];

export default function TeamAdminPage() {
  const { data: session } = useSession();
  const [staff, setStaff] = useState([]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [editingPerms, setEditingPerms] = useState(null);

  function load() {
    fetch("/api/team").then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setStaff(data);
    });
  }
  useEffect(load, []);

  async function handlePromote(e) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, action: "promote" }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Errore");
      return;
    }
    setEmail("");
    load();
  }

  async function handleDemote(userId) {
    if (!confirm("Rimuovere i permessi Admin a questo utente?")) return;
    const target = staff.find((s) => s.id === userId);
    await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: target.email, action: "demote" }),
    });
    load();
  }

  async function handleRoleChange(userId, role) {
    await fetch("/api/team", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });
    load();
  }

  async function savePermissions(userId, permissions) {
    await fetch("/api/team", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, permissions }),
    });
    setEditingPerms(null);
    load();
  }

  const canAssignOwner = session?.user?.role === "SUPER_OWNER";

  return (
    <AdminPageShell title="Team & Permessi" description="Creazione Admin/Owner e permessi granulari." requireOwner>
      <form onSubmit={handlePromote} className="glass p-4 flex gap-2 mb-2">
        <input
          type="email"
          placeholder="Email Google dell'utente (deve aver già fatto login una volta)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input flex-1"
          required
        />
        <button className="text-xs bg-kairo-sakura text-kairo-black px-5 rounded-full font-medium">
          + Rendi Admin
        </button>
      </form>
      {error && <p className="text-xs text-red-400 mb-4">{error}</p>}

      <div className="space-y-2 mt-6">
        {staff.map((s) => (
          <div key={s.id} className="glass p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm font-medium">{s.name || s.email}</p>
                <p className="text-xs text-white/40">{s.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {s.role === "SUPER_OWNER" ? (
                  <span className="text-xs text-kairo-sakura font-medium px-3 py-1.5">SUPER OWNER · protetto</span>
                ) : (
                  <>
                    <select
                      value={s.role}
                      onChange={(e) => handleRoleChange(s.id, e.target.value)}
                      className="input text-xs py-1.5 w-auto"
                    >
                      <option value="ADMIN">Admin</option>
                      {canAssignOwner && <option value="OWNER">Owner</option>}
                    </select>
                    {s.role === "ADMIN" && (
                      <button onClick={() => setEditingPerms(editingPerms === s.id ? null : s.id)} className="text-xs text-kairo-sakura hover:underline">
                        Permessi
                      </button>
                    )}
                    <button onClick={() => handleDemote(s.id)} className="text-xs text-white/40 hover:text-red-400">
                      Rimuovi
                    </button>
                  </>
                )}
              </div>
            </div>

            {editingPerms === s.id && (
              <PermissionsEditor
                current={s.permissions?.map((p) => p.key) || []}
                onSave={(perms) => savePermissions(s.id, perms)}
              />
            )}
          </div>
        ))}
      </div>
    </AdminPageShell>
  );
}

function PermissionsEditor({ current, onSave }) {
  const [selected, setSelected] = useState(current);

  function toggle(key) {
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  return (
    <div className="mt-4 pt-4 border-t border-white/10">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
        {ALL_PERMISSIONS.map((key) => (
          <label key={key} className="flex items-center gap-2 text-[11px] text-white/60 cursor-pointer">
            <input type="checkbox" checked={selected.includes(key)} onChange={() => toggle(key)} className="accent-kairo-sakura" />
            {key}
          </label>
        ))}
      </div>
      <button onClick={() => onSave(selected)} className="text-xs bg-kairo-sakura text-kairo-black px-4 py-2 rounded-full font-medium">
        Salva permessi
      </button>
    </div>
  );
}
