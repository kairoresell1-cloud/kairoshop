"use client";

import { useEffect, useState } from "react";
import AdminPageShell from "@/components/AdminPageShell";

export default function SuppliersAdminPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({ name: "", contact: "", notes: "" });

  function load() {
    fetch("/api/suppliers").then((r) => r.json()).then(setSuppliers).catch(() => {});
  }
  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    await fetch("/api/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", contact: "", notes: "" });
    load();
  }

  async function handleDelete(id) {
    if (!confirm("Eliminare questo fornitore?")) return;
    await fetch(`/api/suppliers/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <AdminPageShell title="Fornitori (ERP)" description="Costi di acquisto, lotti e margini — riservato a Owner." requireOwner>
      <form onSubmit={handleCreate} className="glass p-4 grid md:grid-cols-3 gap-3 mb-6">
        <input placeholder="Nome azienda" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" required />
        <input placeholder="Contatti" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className="input" />
        <input placeholder="Note" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input" />
        <button className="md:col-span-3 text-xs bg-kairo-sakura text-kairo-black py-2.5 rounded-full font-medium">+ Aggiungi fornitore</button>
      </form>

      {suppliers.length === 0 ? (
        <div className="glass p-10 text-center text-white/40 text-sm">Nessun fornitore registrato.</div>
      ) : (
        <div className="space-y-2">
          {suppliers.map((s) => (
            <div key={s.id} className="glass p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{s.name}</p>
                <p className="text-xs text-white/40">{s.contact} · {s.products?.length || 0} prodotti collegati · {s.status}</p>
              </div>
              <button onClick={() => handleDelete(s.id)} className="text-xs text-white/40 hover:text-red-400">Elimina</button>
            </div>
          ))}
        </div>
      )}
    </AdminPageShell>
  );
}
