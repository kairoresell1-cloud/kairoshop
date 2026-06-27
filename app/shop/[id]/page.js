"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((products) => {
        const found = products.find((p) => p.id === id);
        setProduct(found || null);
        if (found?.variants?.length > 0) setSelectedVariant(found.variants[0]);
      });
  }, [id]);

  if (!product) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-kairo-sakura/30 border-t-kairo-sakura rounded-full animate-spin" />
      </main>
    );
  }

  const maxStock = selectedVariant ? selectedVariant.stock : product.stock;

  function handleAddToCart() {
    addToCart(product, quantity, selectedVariant?.colorName || null);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <main className="min-h-screen px-4 md:px-10 py-6 md:py-10 max-w-5xl">
      <button onClick={() => router.back()} className="text-xs text-white/40 hover:text-white/70 mb-6">
        ← Torna al catalogo
      </button>

      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <div className="glass card-glow-border h-64 md:h-96 overflow-hidden mb-3">
            {product.images?.[activeImage] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.images[activeImage]} alt={product.title} className="w-full h-full object-cover" />
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border transition-all ${
                    activeImage === i ? "border-kairo-sakura" : "border-white/10 opacity-50"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.badge && (
            <span className="text-[10px] uppercase tracking-wider text-kairo-sakura border border-kairo-sakura/20 px-2 py-1 rounded-full">
              {product.badge}
            </span>
          )}
          <h1 className="text-xl md:text-3xl font-light mt-3">{product.title}</h1>
          <p className="text-white/50 text-sm mt-4 leading-relaxed">{product.description}</p>

          <p className="text-kairo-sakura text-2xl font-semibold mt-6">€{product.basePrice.toFixed(2)}</p>

          {product.bulkPrices?.length > 0 && (
            <div className="mt-3 text-xs text-white/40 space-y-0.5">
              {product.bulkPrices.map((b) => (
                <p key={b.id}>{b.minQty}+ pezzi → €{b.price.toFixed(2)} cad.</p>
              ))}
            </div>
          )}

          {product.variants?.length > 0 && (
            <div className="mt-6">
              <p className="text-xs text-white/50 mb-2">Colore</p>
              <div className="flex gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs border transition-all ${
                      selectedVariant?.id === v.id
                        ? "border-kairo-sakura text-kairo-sakura"
                        : "border-white/10 text-white/50"
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full" style={{ background: v.colorHex }} />
                    {v.colorName}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <p className="text-xs text-white/50 mb-2">Quantità</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20">−</button>
              <span className="w-8 text-center">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(maxStock || 99, quantity + 1))} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20">+</button>
              <span className="text-xs text-white/30">{maxStock} disponibili</span>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={maxStock === 0}
            className="w-full mt-8 btn-primary py-3.5 disabled:opacity-40"
          >
            {maxStock === 0 ? "Esaurito" : added ? "Aggiunto ✓" : "Aggiungi al carrello"}
          </button>
        </div>
      </div>
    </main>
  );
}
