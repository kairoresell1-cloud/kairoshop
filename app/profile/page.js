"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const STATUS_LABELS = {
  DA_PREPARARE: "Da preparare",
  PREPARATO: "Preparato",
  SPEDITO: "Spedito",
  CONSEGNATO: "Consegnato",
};

const STATUS_STEP = {
  DA_PREPARARE: 0,
  PREPARATO: 1,
  SPEDITO: 2,
  CONSEGNATO: 3,
};

export default function ProfilePage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetch("/api/my-orders")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen px-6 md:px-10 py-10 max-w-3xl">
      <div className="glass card-glow-border p-6 mb-10 flex items-center gap-4">
        {session?.user?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={session.user.image} alt="" className="w-14 h-14 rounded-full border border-kairo-sakura/30 flex-shrink-0 object-cover" />
        ) : (
          <div className="w-14 h-14 rounded-full border border-kairo-sakura/30 flex-shrink-0 flex items-center justify-center bg-kairo-sakura/10 text-kairo-sakura font-medium">
            {session?.user?.name?.[0]?.toUpperCase() || "K"}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-[10px] text-kairo-sakura uppercase tracking-[0.3em] mb-1">Profilo</p>
          <h1 className="text-xl font-light gradient-text truncate">{session?.user?.name}</h1>
          <p className="text-xs text-white/40 truncate">{session?.user?.email}</p>
        </div>
      </div>

      <h2 className="text-lg font-medium mb-5 text-white/80">I tuoi ordini</h2>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="glass h-20 animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="glass p-10 text-center text-white/40 text-sm">
          Non hai ancora ordini associati al tuo profilo.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const isOpen = expanded === o.id;
            const step = STATUS_STEP[o.status];
            return (
              <div key={o.id} className="glass card-glow-border overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : o.id)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div>
                    <p className="text-sm font-medium text-kairo-sakura">{o.code}</p>
                    <p className="text-xs text-white/40 mt-0.5">
                      {new Date(o.createdAt).toLocaleDateString("it-IT")} alle {new Date(o.createdAt).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })} · €{o.total.toFixed(2)}
                    </p>
                  </div>
                  <span className="status-pill text-[11px] px-3 py-1.5 rounded-full">
                    {STATUS_LABELS[o.status]}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 border-t border-white/5 pt-4">
                    {/* Barra di avanzamento stato ordine */}
                    <div className="flex items-center justify-between mb-6 px-1">
                      {Object.entries(STATUS_LABELS).map(([key, label], i) => (
                        <div key={key} className="flex-1 flex flex-col items-center relative">
                          <div
                            className={`w-3 h-3 rounded-full z-10 ${
                              i <= step ? "bg-kairo-sakura shadow-glow" : "bg-white/10"
                            }`}
                          />
                          <p className={`text-[9px] mt-2 uppercase tracking-wide text-center ${
                            i <= step ? "text-kairo-sakura" : "text-white/30"
                          }`}>
                            {label}
                          </p>
                          {i < 3 && (
                            <div
                              className={`absolute top-1.5 left-1/2 w-full h-px ${
                                i < step ? "bg-kairo-sakura" : "bg-white/10"
                              }`}
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2 mb-4">
                      {o.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-xs text-white/60">
                          <span>
                            {item.quantity}x {item.product?.title || "Prodotto"}
                            {item.variantName ? ` (${item.variantName})` : ""}
                          </span>
                          <span>€{(item.unitPrice * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="text-xs text-white/40 space-y-1 pt-3 border-t border-white/5">
                      <p>Subtotale: €{o.subtotal.toFixed(2)} · Spedizione: {o.shippingFee === 0 ? "Gratuita" : `€${o.shippingFee.toFixed(2)}`}</p>
                      {o.trackingCode ? (
                        <p className="text-kairo-sakura">
                          Tracking: {o.trackingCarrier ? `${o.trackingCarrier} — ` : ""}{o.trackingCode}
                        </p>
                      ) : (
                        <p className="text-white/30">Codice di tracking non ancora disponibile.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
