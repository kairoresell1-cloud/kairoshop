"use client";

import { useEffect, useState } from "react";
import AdminPageShell from "@/components/AdminPageShell";

export default function InventoryAdminPage() {
  const [products, setProducts] = useState([]);

  function load() {
    fetch("/api/products").then((r) => r.json()).then(setProducts);
  }

  useEffect(load, []);

  async function adjust(productId, delta, variantId = null) {
    await fetch(`/api/products/${productId}/stock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delta, variantId }),
    });
    load();
  }

  return (
    <AdminPageShell title="Magazzino" description="Stock prodotti e varianti — mai negativo, sync automatica con gli ordini.">
      {products.length === 0 ? (
        <div className="glass p-10 text-center text-white/40 text-sm">Nessun prodotto.</div>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <div key={p.id} className="glass p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{p.title}</p>
                  <p className={`text-xs mt-0.5 ${p.stock < 5 ? "text-red-400" : "text-white/40"}`}>
                    Stock totale: {p.stock} {p.stock < 5 && "⚠️ basso"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => adjust(p.id, -1)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-sm">−</button>
                  <button onClick={() => adjust(p.id, 1)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-sm">+</button>
                </div>
              </div>

              {p.variants?.length > 0 && (
                <div className="mt-3 pl-4 border-l border-white/10 space-y-2">
                  {p.variants.map((v) => (
                    <div key={v.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ background: v.colorHex }} />
                        <span className="text-xs text-white/60">{v.colorName} — stock {v.stock}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => adjust(p.id, -1, v.id)} className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-xs">−</button>
                        <button onClick={() => adjust(p.id, 1, v.id)} className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-xs">+</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminPageShell>
  );
}
