"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AdminPageShell from "@/components/AdminPageShell";

const LEVELS = ["Nuovo", "Attivo", "VIP", "Inattivo", "Top"];

export default function CustomerDossierPage() {
  const { id } = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState(null);
  const [notes, setNotes] = useState("");
  const [level, setLevel] = useState("Nuovo");

  function load() {
    fetch(`/api/customers/${id}`).then((r) => r.json()).then((data) => {
      setCustomer(data);
      setNotes(data.adminNotes || "");
      setLevel(data.customerLevel);
    });
  }
  useEffect(load, [id]);

  async function handleSave() {
    await fetch(`/api/customers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminNotes: notes, customerLevel: level }),
    });
    load();
  }

  async function handleBanToggle() {
    const action = customer.banned ? "ri-attivare" : "bannare";
    if (!confirm(`Vuoi davvero ${action} questo cliente?`)) return;
    await fetch(`/api/customers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ banned: !customer.banned }),
    });
    load();
  }

  if (!customer) {
    return <AdminPageShell title="Cliente"><div className="glass h-40 animate-pulse" /></AdminPageShell>;
  }

  return (
    <AdminPageShell title={customer.name || customer.email} description={customer.email}>
      <button onClick={() => router.push("/admin/customers")} className="text-xs text-white/40 hover:text-white/70 mb-6">
        ← Tutti i clienti
      </button>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Stat label="Spesa totale" value={`€${customer.totalSpent.toFixed(2)}`} />
        <Stat label="Ordini effettuati" value={customer.ordersCount} />
        <Stat label="Stato" value={customer.banned ? "Bannato" : "Attivo"} danger={customer.banned} />
      </div>

      <div className="glass p-5 mb-6">
        <h3 className="text-sm font-medium mb-3">Livello & Note interne</h3>
        <select value={level} onChange={(e) => setLevel(e.target.value)} className="input text-xs w-auto mb-3">
          {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input min-h-[80px] text-xs mb-3" placeholder="Note interne..." />
        <div className="flex gap-3">
          <button onClick={handleSave} className="text-xs bg-kairo-sakura text-kairo-black px-4 py-2 rounded-full font-medium">Salva</button>
          <button onClick={handleBanToggle} className={`text-xs px-4 py-2 rounded-full font-medium ${customer.banned ? "bg-white/10 text-white/70" : "bg-red-500/20 text-red-400"}`}>
            {customer.banned ? "Rimuovi ban" : "Banna utente"}
          </button>
        </div>
      </div>

      <div className="glass p-5">
        <h3 className="text-sm font-medium mb-3">Storico ordini</h3>
        {customer.orders?.length === 0 ? (
          <p className="text-xs text-white/40">Nessun ordine ancora.</p>
        ) : (
          <div className="space-y-2">
            {customer.orders.map((o) => (
              <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex justify-between text-xs hover:text-kairo-sakura transition-colors">
                <span>{o.code}</span>
                <span>€{o.total.toFixed(2)} · {new Date(o.createdAt).toLocaleDateString("it-IT")}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AdminPageShell>
  );
}

function Stat({ label, value, danger }) {
  return (
    <div className="glass p-4 text-center">
      <p className={`text-xl font-semibold ${danger ? "text-red-400" : "text-kairo-sakura"}`}>{value}</p>
      <p className="text-[10px] text-white/40 mt-1 uppercase tracking-wider">{label}</p>
    </div>
  );
}
