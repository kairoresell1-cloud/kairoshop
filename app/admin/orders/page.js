"use client";

import { useEffect, useState } from "react";
import AdminPageShell from "@/components/AdminPageShell";

const STATUSES = ["DA_PREPARARE", "PREPARATO", "SPEDITO", "CONSEGNATO"];
const STATUS_LABELS = {
  DA_PREPARARE: "Da preparare",
  PREPARATO: "Preparato",
  SPEDITO: "Spedito",
  CONSEGNATO: "Consegnato",
};

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lookupCode, setLookupCode] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupError, setLookupError] = useState("");

  function load() {
    fetch("/api/orders/list").then((r) => r.json()).then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }

  useEffect(load, []);

  async function handleLookup(e) {
    e.preventDefault();
    setLookupError("");
    setLookupResult(null);
    const res = await fetch(`/api/orders/lookup/${lookupCode.trim().toUpperCase()}`);
    if (!res.ok) {
      setLookupError("Codice ordine non trovato.");
      return;
    }
    setLookupResult(await res.json());
  }

  async function updateOrder(id, data) {
    await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    load();
  }

  return (
    <AdminPageShell title="Ordini" description="Gestione ordini, stati e tracking spedizioni.">
      <div className="glass p-5 mb-6">
        <p className="text-xs text-white/50 mb-3">Inserisci codice ordine (es. KS-XXXX-XXXX)</p>
        <form onSubmit={handleLookup} className="flex gap-2">
          <input value={lookupCode} onChange={(e) => setLookupCode(e.target.value)} placeholder="KS-XXXX-XXXX" className="input flex-1" />
          <button className="bg-kairo-sakura text-kairo-black px-5 rounded-full text-sm font-medium">Cerca</button>
        </form>
        {lookupError && <p className="text-xs text-red-400 mt-2">{lookupError}</p>}
        {lookupResult && (
          <div className="mt-4 text-sm space-y-1">
            <p className="text-kairo-sakura font-medium">{lookupResult.code}</p>
            <p className="text-white/60 text-xs">
              {lookupResult.items.map((i) => `${i.quantity}x ${i.product.title}`).join(", ")}
            </p>
            <p className="text-white/60 text-xs">Totale: €{lookupResult.total.toFixed(2)} · Stato: {STATUS_LABELS[lookupResult.status]}</p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="glass h-40 animate-pulse" />
      ) : orders.length === 0 ? (
        <div className="glass p-10 text-center text-white/40 text-sm">Nessun ordine ancora.</div>
      ) : (
        <div className="space-y-2">
          {orders.map((o) => (
            <div key={o.id} className="glass p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-kairo-sakura">{o.code}</p>
                <p className="text-xs text-white/40">
                  €{o.total.toFixed(2)} · {new Date(o.createdAt).toLocaleDateString("it-IT")}
                  {o.user?.name ? ` · ${o.user.name}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={o.status}
                  onChange={(e) => updateOrder(o.id, { status: e.target.value })}
                  className="input text-xs py-1.5 w-auto"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminPageShell>
  );
}
