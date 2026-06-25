"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

function ShopContent() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  const filtered = activeCategory
    ? products.filter((p) => p.category?.slug === activeCategory)
    : products;

  // Raggruppa per categoria (nome categoria come titolo sezione)
  const grouped = filtered.reduce((acc, p) => {
    const key = p.category?.name || "Altro";
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  const activeCategoryName = activeCategory
    ? products.find((p) => p.category?.slug === activeCategory)?.category?.name
    : null;

  return (
    <main className="min-h-screen px-6 md:px-10 py-10 max-w-6xl mx-auto">
      <div className="mb-10">
        <p className="text-[10px] text-kairo-sakura uppercase tracking-[0.3em] mb-1">Collezione</p>
        <h1 className="text-3xl md:text-4xl font-light tracking-tight">
          {activeCategoryName || "Kairo Shop"}
        </h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass h-72 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass p-12 text-center">
          <p className="text-white/40 text-sm">Nessun prodotto disponibile in questa categoria.</p>
        </div>
      ) : activeCategory ? (
        <ProductGrid products={filtered} />
      ) : (
        Object.entries(grouped).map(([categoryName, items]) => (
          <section key={categoryName} className="mb-12">
            <h2 className="text-lg font-medium mb-4 text-white/80">{categoryName}</h2>
            <ProductGrid products={items} />
          </section>
        ))
      )}
    </main>
  );
}

function ProductGrid({ products }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {products.map((p) => (
        <Link
          key={p.id}
          href={`/shop/${p.id}`}
          className="glass overflow-hidden flex flex-col group cursor-pointer"
        >
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
            <span className="text-kairo-sakura font-semibold mt-4">€{p.basePrice.toFixed(2)}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={null}>
      <ShopContent />
    </Suspense>
  );
}
