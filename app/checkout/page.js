"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";

export default function CheckoutPage() {
  const { items, priceForItem, shippingFee, total } = useCart();
  const [code, setCode] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleGenerateCode() {
    setLoading(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({
          productId: i.productId,
          variantName: i.variantName,
          quantity: i.quantity,
          unitPrice: priceForItem(i),
        })),
        shippingFee,
      }),
    });
    const data = await res.json();
    setCode(data.code);
    setLoading(false);

    try {
      await navigator.clipboard.writeText(data.code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-10 max-w-md text-center">
      <h1 className="text-3xl font-bold glow-text mb-8">Checkout</h1>

      {!code ? (
        <div className="glass p-8">
          <p className="text-white/70 mb-6">
            Totale ordine: <span className="text-kairo-sakura font-bold">€{total.toFixed(2)}</span>
          </p>
          <p className="text-white/50 text-sm mb-6">
            Genera il tuo codice ordine. Copialo e invialo per finalizzare
            l'acquisto — nessun pagamento viene elaborato su questa pagina.
          </p>
          <button
            onClick={handleGenerateCode}
            disabled={loading || items.length === 0}
            className="w-full bg-kairo-sakura hover:bg-kairo-sakuraDeep text-kairo-black font-semibold py-3 rounded-full disabled:opacity-50"
          >
            {loading ? "Generazione..." : "Genera codice ordine"}
          </button>
        </div>
      ) : (
        <div className="glass p-8">
          <p className="text-white/60 mb-2">Il tuo codice ordine:</p>
          <p className="text-2xl font-bold text-kairo-sakura tracking-widest">{code}</p>
          <p className="text-xs text-white/40 mt-3">
            {copied ? "Copiato negli appunti ✅" : "Copia manualmente il codice qui sopra"}
          </p>
        </div>
      )}
    </main>
  );
}
