"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";
import Link from "next/link";

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts);
  }, []);

  return (
    <main className="min-h-screen px-6 py-10 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold glow-text">Shop</h1>
        <Link href="/cart" className="sakura-border px-5 py-2 rounded-full text-kairo-sakura hover:bg-white/5">
          Carrello
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-white/50">Nessun prodotto ancora disponibile.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((p) => (
            <div key={p.id} className="glass p-5 flex flex-col">
              <div className="h-40 bg-white/5 rounded-xl mb-4 overflow-hidden">
                {p.images?.[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                )}
              </div>
              {p.badge && (
                <span className="text-xs text-kairo-sakura mb-1">{p.badge}</span>
              )}
              <h3 className="font-semibold">{p.title}</h3>
              <p className="text-white/50 text-sm flex-1 line-clamp-2">{p.description}</p>
              <div className="flex justify-between items-center mt-4">
                <span className="text-kairo-sakura font-bold">€{p.basePrice.toFixed(2)}</span>
                <button
                  onClick={() => addToCart(p, 1)}
                  className="bg-kairo-sakura text-kairo-black px-4 py-2 rounded-full text-sm font-semibold hover:bg-kairo-sakuraDeep"
                >
                  Aggiungi al carrello
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
