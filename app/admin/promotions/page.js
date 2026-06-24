"use client";

import { useEffect, useState } from "react";
import AdminPageShell from "@/components/AdminPageShell";

export default function PromotionsAdminPage() {
  const [coupons, setCoupons] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [newCoupon, setNewCoupon] = useState({ code: "", percentOff: "", fixedOff: "", usageLimit: "" });

  function load() {
    fetch("/api/coupons").then((r) => r.json()).then(setCoupons);
    fetch("/api/promotions").then((r) => r.json()).then(setPromotions);
  }
  useEffect(load, []);

  async function createCoupon(e) {
    e.preventDefault();
    await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCoupon),
    });
    setNewCoupon({ code: "", percentOff: "", fixedOff: "", usageLimit: "" });
    load();
  }

  async function toggleCoupon(c) {
    await fetch(`/api/coupons/${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !c.active }),
    });
    load();
  }

  async function deleteCoupon(id) {
    await fetch(`/api/coupons/${id}`, { method: "DELETE" });
    load();
  }

  async function createPromo(type) {
    await fetch("/api/promotions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, rules: {} }),
    });
    load();
  }

  async function togglePromo(p) {
    await fetch(`/api/promotions/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !p.active }),
    });
    load();
  }

  const PROMO_LABELS = {
    PRODUCT_DISCOUNT: "Sconto prodotto",
    QTY_DISCOUNT: "Sconto quantità",
    CART_DISCOUNT: "Sconto carrello",
    FREE_SHIPPING: "Spedizione gratuita",
  };

  return (
    <AdminPageShell title="Promozioni & Coupon" description="Sconti attivi, codici e regole.">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium mb-3 text-white/70">Coupon</h3>
          <form onSubmit={createCoupon} className="glass p-4 space-y-2 mb-4">
            <input placeholder="CODICE" value={newCoupon.code} onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })} className="input text-xs" required />
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="% sconto" value={newCoupon.percentOff} onChange={(e) => setNewCoupon({ ...newCoupon, percentOff: e.target.value })} className="input text-xs" />
              <input type="number" placeholder="€ fisso" value={newCoupon.fixedOff} onChange={(e) => setNewCoupon({ ...newCoupon, fixedOff: e.target.value })} className="input text-xs" />
            </div>
            <input type="number" placeholder="Limite utilizzi" value={newCoupon.usageLimit} onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: e.target.value })} className="input text-xs" />
            <button className="w-full text-xs bg-kairo-sakura text-kairo-black py-2 rounded-full font-medium">+ Crea coupon</button>
          </form>

          <div className="space-y-2">
            {coupons.map((c) => (
              <div key={c.id} className="glass p-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-medium text-kairo-sakura">{c.code}</p>
                  <p className="text-white/40">
                    {c.percentOff ? `${c.percentOff}%` : `€${c.fixedOff}`} · usati {c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleCoupon(c)} className={c.active ? "text-green-400" : "text-white/30"}>
                    {c.active ? "Attivo" : "Disattivo"}
                  </button>
                  <button onClick={() => deleteCoupon(c.id)} className="text-white/30 hover:text-red-400">✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3 text-white/70">Promozioni</h3>
          <div className="glass p-4 mb-4 flex flex-wrap gap-2">
            {Object.entries(PROMO_LABELS).map(([type, label]) => (
              <button key={type} onClick={() => createPromo(type)} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-2 rounded-full">
                + {label}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {promotions.map((p) => (
              <div key={p.id} className="glass p-3 flex items-center justify-between text-xs">
                <span>{PROMO_LABELS[p.type] || p.type}</span>
                <button onClick={() => togglePromo(p)} className={p.active ? "text-green-400" : "text-white/30"}>
                  {p.active ? "Attiva" : "Disattiva"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminPageShell>
  );
}
