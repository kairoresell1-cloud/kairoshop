"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminPageShell from "@/components/AdminPageShell";

const LEVEL_COLOR = {
  Nuovo: "text-white/50", Attivo: "text-blue-300", VIP: "text-kairo-sakura",
  Inattivo: "text-white/30", Top: "text-yellow-300",
};

export default function CustomersAdminPage() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetch("/api/customers").then((r) => r.json()).then(setCustomers);
  }, []);

  return (
    <AdminPageShell title="Clienti (CRM)" description="Clicca un cliente per il dossier completo.">
      {customers.length === 0 ? (
        <div className="glass p-10 text-center text-white/40 text-sm">Nessun cliente ancora registrato.</div>
      ) : (
        <div className="space-y-2">
          {customers.map((c) => (
            <Link key={c.id} href={`/admin/customers/${c.id}`} className="glass p-4 flex items-center justify-between gap-3 hover:bg-white/5 transition-all block">
              <div>
                <p className="text-sm font-medium">{c.name || c.email} {c.banned && <span className="text-red-400 text-[10px] ml-2">BANNATO</span>}</p>
                <p className="text-xs text-white/40">{c.ordersCount} ordini · €{c.totalSpent.toFixed(2)} spesi</p>
              </div>
              <span className={`text-xs font-medium ${LEVEL_COLOR[c.customerLevel]}`}>{c.customerLevel}</span>
            </Link>
          ))}
        </div>
      )}
    </AdminPageShell>
  );
}
