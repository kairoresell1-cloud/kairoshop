"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen px-6 md:px-10 py-10 max-w-6xl mx-auto">
      <div className="mb-10">
        <p className="text-[10px] text-kairo-sakura uppercase tracking-[0.3em] mb-1">Collezione</p>
        <h1 className="text-3xl md:text-4xl font-light tracking-tight">Kairo Shop</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass h-72 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="glass p-12 text-center">
          <p className="text-white/40 text-sm">Nessun prodotto disponibile al momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => (
            <div key={p.id} className="glass overflow-hidden flex flex-col group">
              <div className="h-44 bg-white/5 overflow-hidden relative">
                {p.images?.[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                {p.badge && (
                  <span className="absolute top-3 left-3 text-[9px] uppercase tracking-wider bg-kairo-black/70 text-kairo-sakura px-2 py-1 rounded-full border border-kairo-sakura/20">
                    {p.badge}
                  </span>
                )}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-medium text-sm">{p.title}</h3>
                <p className="text-white/40 text-xs mt-1 flex-1 line-clamp-2">{p.description}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-kairo-sakura font-semibold">€{p.basePrice.toFixed(2)}</span>
                  <button
                    onClick={() => addToCart(p, 1)}
                    className="text-xs bg-white/10 hover:bg-kairo-sakura hover:text-kairo-black px-4 py-2 rounded-full transition-all duration-300"
                  >
                    + Carrello
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
