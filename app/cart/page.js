"use client";

import { useCart } from "@/lib/cart-context";
import Link from "next/link";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, priceForItem, subtotal, shippingFee, total } = useCart();

  return (
    <main className="min-h-screen px-6 py-10 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold glow-text mb-8">Il tuo carrello</h1>

      {items.length === 0 ? (
        <p className="text-white/50">Il carrello è vuoto. <Link href="/shop" className="text-kairo-sakura underline">Vai allo shop</Link></p>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.key} className="glass p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">{item.title}</p>
                  {item.variantName && (
                    <p className="text-xs text-white/50">Variante: {item.variantName}</p>
                  )}
                  <p className="text-kairo-sakura text-sm">€{priceForItem(item).toFixed(2)} / cad.</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.key, parseInt(e.target.value || "1"))}
                    className="w-16 bg-white/5 text-center rounded-lg py-1 sakura-border"
                  />
                  <button onClick={() => removeFromCart(item.key)} className="text-white/40 hover:text-red-400 text-sm">
                    Rimuovi
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="glass p-6 mt-8 space-y-2">
            <div className="flex justify-between text-white/70">
              <span>Subtotale</span>
              <span>€{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white/70">
              <span>Spedizione</span>
              <span>€{shippingFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-white/10">
              <span>Totale</span>
              <span className="text-kairo-sakura">€{total.toFixed(2)}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="block text-center mt-6 bg-kairo-sakura hover:bg-kairo-sakuraDeep text-kairo-black font-semibold py-3 rounded-full"
          >
            Procedi al checkout
          </Link>
        </>
      )}
    </main>
  );
}
