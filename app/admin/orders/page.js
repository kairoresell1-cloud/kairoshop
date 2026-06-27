"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminPageShell from "@/components/AdminPageShell";

const STATUS_LABELS = {
  DA_PREPARARE: "Da preparare",
  PREPARATO: "Preparato",
  SPEDITO: "Spedito",
  CONSEGNATO: "Consegnato",
};

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/orders").then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setOrders(data);
      setLoading(false);
    });
  }, []);

  const filtered = orders.filter((o) => {
    const q = query.toLowerCase();
    return (
      o.code.toLowerCase().includes(q) ||
      o.customerName?.toLowerCase().includes(q) ||
      o.customerSurname?.toLowerCase().includes(q) ||
      o.user?.name?.toLowerCase().includes(q) ||
      o.user?.email?.toLowerCase().includes(q)
    );
  });

  return (
    <AdminPageShell title="Ordini" description="Visualizza, modifica ed elimina ordini reali.">
      <div className="flex flex-wrap gap-3 justify-between mb-6">
        <input
          placeholder="Cerca per codice, nome cliente, email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input flex-1 max-w-sm"
        />
        <Link href="/admin/orders/create" className="text-xs bg-kairo-sakura text-kairo-black px-5 py-2.5 rounded-full font-medium hover:bg-kairo-sakuraDeep">
          + Crea ordine
        </Link>
      </div>

      {loading ? (
        <div className="glass h-40 animate-pulse" />
      ) : filtered.length === 0 ? (
        <div className="glass p-10 text-center text-white/40 text-sm">Nessun ordine trovato.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((o) => (
            <div key={o.id} className="glass p-4 flex flex-wrap items-center justify-between gap-3 hover:bg-white/5 transition-all">
              <Link href={`/admin/orders/${o.id}`} className="flex-1 min-w-0">
                <p className="text-sm font-medium text-kairo-sakura">{o.code}</p>
                <p className="text-xs text-white/40">
                  €{o.total.toFixed(2)} · {new Date(o.createdAt).toLocaleDateString("it-IT")} {new Date(o.createdAt).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </Link>
              {o.userId ? (
                <Link href={`/admin/customers/${o.userId}`} className="text-xs text-white/60 hover:text-kairo-sakura hover:underline">
                  {o.user?.name || o.user?.email}
                </Link>
              ) : (
                <span className="text-xs text-white/30">
                  {[o.customerName, o.customerSurname].filter(Boolean).join(" ") || "Cliente non registrato"}
                </span>
              )}
              <Link href={`/admin/orders/${o.id}`} className="text-xs px-3 py-1.5 rounded-full bg-white/10 text-white/70">
                {STATUS_LABELS[o.status]}
              </Link>
            </div>
          ))}
        </div>
      )}
    </AdminPageShell>
  );
}
