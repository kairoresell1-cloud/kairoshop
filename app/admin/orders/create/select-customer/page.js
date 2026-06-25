"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminPageShell from "@/components/AdminPageShell";

export default function SelectCustomerPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/customers").then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setCustomers(data);
    });
  }, []);

  const filtered = customers.filter((c) => {
    const q = query.toLowerCase();
    return c.email.toLowerCase().includes(q) || c.name?.toLowerCase().includes(q);
  });

  function handleSelect(customer) {
    const draftRaw = sessionStorage.getItem("kairo_order_draft");
    const draft = draftRaw ? JSON.parse(draftRaw) : { customer: {}, items: [], mode: "manual" };
    draft.customer = { ...draft.customer, userEmail: customer.email, customerName: customer.name || "" };
    sessionStorage.setItem("kairo_order_draft", JSON.stringify(draft));
    router.push("/admin/orders/create");
  }

  return (
    <AdminPageShell title="Seleziona cliente" description="Scegli un cliente già registrato, oppure torna indietro e inseriscine uno manualmente.">
      <input
        autoFocus
        placeholder="Cerca per nome o email..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="input mb-6 max-w-md"
      />

      {filtered.length === 0 ? (
        <div className="glass p-10 text-center text-white/40 text-sm">Nessun cliente trovato.</div>
      ) : (
        <div className="space-y-2 max-w-md">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => handleSelect(c)}
              className="w-full glass p-4 flex items-center justify-between text-left hover:bg-kairo-sakura/10 transition-all"
            >
              <div>
                <p className="text-sm">{c.name || "Senza nome"}</p>
                <p className="text-xs text-white/40">{c.email}</p>
              </div>
              <span className="text-[10px] text-kairo-sakura/70">{c.ordersCount} ordini</span>
            </button>
          ))}
        </div>
      )}

      <button onClick={() => router.push("/admin/orders/create")} className="block mt-8 text-xs text-white/40 hover:text-white/70">
        ← Torna alla creazione ordine senza selezionare
      </button>
    </AdminPageShell>
  );
}
