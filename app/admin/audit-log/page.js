"use client";

import { useEffect, useState } from "react";
import AdminPageShell from "@/components/AdminPageShell";

const ACTION_LABELS = {
  PRODUCT_CREATE: "Prodotto creato",
  PRODUCT_UPDATE: "Prodotto modificato",
  PRODUCT_DELETE: "Prodotto eliminato",
  ORDER_CREATE: "Ordine creato",
  ORDER_UPDATE: "Ordine aggiornato",
  ORDER_DELETE: "Ordine eliminato",
  STOCK_ADJUST: "Stock modificato",
  STOCK_ADJUST_VARIANT: "Stock variante modificato",
  CUSTOMER_UPDATE: "Cliente aggiornato",
  TEAM_UPDATE: "Permessi team aggiornati",
  TEAM_PROMOTE: "Utente promosso ad Admin",
  TEAM_DEMOTE: "Permessi Admin rimossi",
  SUPPLIER_CREATE: "Fornitore creato",
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch("/api/audit-log").then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setLogs(data);
    });
  }, []);

  return (
    <AdminPageShell title="Audit Log" description="Tracciamento completo di ogni azione su prodotti, ordini, stock e team.">
      {logs.length === 0 ? (
        <div className="glass p-10 text-center text-white/40 text-sm">Nessuna azione registrata ancora.</div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="glass p-4 text-xs">
              <div className="flex justify-between items-start">
                <span className="text-kairo-sakura font-medium">
                  {ACTION_LABELS[log.action] || log.action}
                </span>
                <span className="text-white/30">
                  {new Date(log.createdAt).toLocaleString("it-IT")}
                </span>
              </div>
              <p className="text-white/40 mt-1">
                {log.user?.name || log.user?.email || "Sistema"} · {log.entity}
              </p>
            </div>
          ))}
        </div>
      )}
    </AdminPageShell>
  );
}
