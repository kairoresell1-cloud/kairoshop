"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (session) {
      fetch("/api/dashboard/stats")
        .then((r) => r.json())
        .then(setStats)
        .catch(() => setStats(null));
    }
  }, [session]);

  if (status === "loading") return <p className="text-center mt-20 text-white/50">Caricamento...</p>;

  if (!session || !["ADMIN", "OWNER", "SUPER_OWNER"].includes(session.user.role)) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="glass p-8 text-white/70">Accesso riservato allo staff Kairo.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold glow-text mb-2">Dashboard</h1>
      <p className="text-white/50 mb-8">
        Ruolo: <span className="text-kairo-sakura">{session.user.role}</span>
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Ordini totali" value={stats?.totalOrders ?? "—"} />
        <StatCard label="Ordini oggi" value={stats?.todayOrders ?? "—"} />
        <StatCard label="Fatturato" value={stats ? `€${stats.revenue.toFixed(2)}` : "—"} />
        <StatCard label="Stock basso" value={stats?.lowStock ?? "—"} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionLink href="/admin/products" title="Prodotti" desc="Catalogo, varianti, prezzi bulk" />
        <SectionLink href="/admin/orders" title="Ordini" desc="Gestione e tracking spedizioni" />
        <SectionLink href="/admin/inventory" title="Magazzino" desc="Stock e prenotazioni" />
        <SectionLink href="/admin/customers" title="Clienti (CRM)" desc="Segmentazione e note" />
        <SectionLink href="/admin/promotions" title="Promozioni & Coupon" desc="Sconti attivi" />
        {["OWNER", "SUPER_OWNER"].includes(session.user.role) && (
          <SectionLink href="/admin/suppliers" title="Fornitori (ERP)" desc="Costi, lotti, margini — riservato" />
        )}
        {["OWNER", "SUPER_OWNER"].includes(session.user.role) && (
          <SectionLink href="/admin/team" title="Team & Permessi" desc="Gestione Admin/Owner" />
        )}
        <SectionLink href="/admin/audit-log" title="Audit Log" desc="Tracciamento completo azioni" />
      </div>
    </main>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="glass p-4 text-center">
      <p className="text-2xl font-bold text-kairo-sakura">{value}</p>
      <p className="text-xs text-white/50 mt-1">{label}</p>
    </div>
  );
}

function SectionLink({ href, title, desc }) {
  return (
    <a href={href} className="glass p-6 hover:bg-white/5 transition-all block">
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-white/50 text-sm mt-1">{desc}</p>
    </a>
  );
}
