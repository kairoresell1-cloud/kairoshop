"use client";

import { useEffect, useState } from "react";
import AdminPageShell from "@/components/AdminPageShell";

const LEVELS = ["Nuovo", "Attivo", "VIP", "Inattivo", "Top"];
const LEVEL_COLOR = {
  Nuovo: "text-white/50",
  Attivo: "text-blue-300",
  VIP: "text-kairo-sakura",
  Inattivo: "text-white/30",
  Top: "text-yellow-300",
};

export default function CustomersAdminPage() {
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState(null);

  function load() {
    fetch("/api/customers").then((r) => r.json()).then(setCustomers);
  }
  useEffect(load, []);

  async function saveNotes(id, adminNotes, customerLevel) {
    await fetch(`/api/customers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminNotes, customerLevel }),
    });
    setSelected(null);
    load();
  }

  return (
    <AdminPageShell title="Clienti (CRM)" description="Segmentazione, spesa totale e note interne.">
      {customers.length === 0 ? (
        <div className="glass p-10 text-center text-white/40 text-sm">Nessun cliente ancora registrato.</div>
      ) : (
        <div className="space-y-2">
          {customers.map((c) => (
            <div key={c.id} className="glass p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-medium">{c.name || c.email}</p>
                  <p className="text-xs text-white/40">
                    {c.ordersCount} ordini · €{c.totalSpent.toFixed(2)} spesi
                    {c.orders?.[0] && ` · ultimo: ${new Date(c.orders[0].createdAt).toLocaleDateString("it-IT")}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium ${LEVEL_COLOR[c.customerLevel]}`}>{c.customerLevel}</span>
                  <button onClick={() => setSelected(c)} className="text-xs text-kairo-sakura hover:underline">
                    Note
                  </button>
                </div>
              </div>

              {selected?.id === c.id && (
                <CustomerEditor customer={c} onSave={saveNotes} onCancel={() => setSelected(null)} />
              )}
            </div>
          ))}
        </div>
      )}
    </AdminPageShell>
  );
}

function CustomerEditor({ customer, onSave, onCancel }) {
  const [notes, setNotes] = useState(customer.adminNotes || "");
  const [level, setLevel] = useState(customer.customerLevel);

  return (
    <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
      <select value={level} onChange={(e) => setLevel(e.target.value)} className="input text-xs w-auto">
        {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
      </select>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Note interne sul cliente..." className="input min-h-[70px] text-xs" />
      <div className="flex gap-2">
        <button onClick={() => onSave(customer.id, notes, level)} className="text-xs bg-kairo-sakura text-kairo-black px-4 py-2 rounded-full font-medium">
          Salva
        </button>
        <button onClick={onCancel} className="text-xs text-white/40">Annulla</button>
      </div>
    </div>
  );
}
