"use client";

import { useEffect, useState } from "react";
import AdminPageShell from "@/components/AdminPageShell";

const BADGES = ["", "New", "Bestseller", "Offerta", "Premium", "Limited"];

export default function ProductsAdminPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null); // null = list, "new" o product object
  const [saving, setSaving] = useState(false);

  function load() {
    fetch("/api/products").then((r) => r.json()).then(setProducts);
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
  }

  useEffect(load, []);

  async function handleDelete(id) {
    if (!confirm("Eliminare questo prodotto?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <AdminPageShell title="Prodotti" description="Catalogo, varianti colore, prezzi bulk.">
      {!editing ? (
        <>
          <div className="flex justify-end mb-5">
            <button
              onClick={() => setEditing("new")}
              className="text-xs bg-kairo-sakura text-kairo-black px-5 py-2.5 rounded-full font-medium hover:bg-kairo-sakuraDeep"
            >
              + Nuovo prodotto
            </button>
          </div>

          {products.length === 0 ? (
            <div className="glass p-10 text-center text-white/40 text-sm">Nessun prodotto ancora.</div>
          ) : (
            <div className="space-y-2">
              {products.map((p) => (
                <div key={p.id} className="glass p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
                      {p.images?.[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.title}</p>
                      <p className="text-xs text-white/40">
                        {p.category?.name} · Stock {p.stock} · €{p.basePrice.toFixed(2)} {p.isDigital && "· 📦 Digitale"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => setEditing(p)} className="text-xs text-kairo-sakura hover:underline">
                      Modifica
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="text-xs text-white/40 hover:text-red-400">
                      Elimina
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <ProductForm
          product={editing === "new" ? null : editing}
          categories={categories}
          saving={saving}
          setSaving={setSaving}
          onCancel={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </AdminPageShell>
  );
}

function ProductForm({ product, categories, saving, setSaving, onCancel, onSaved }) {
  const [form, setForm] = useState({
    title: product?.title || "",
    description: product?.description || "",
    images: product?.images?.join(", ") || "",
    basePrice: product?.basePrice ?? "",
    stock: product?.stock ?? 0,
    isDigital: product?.isDigital ?? false,
    tags: product?.tags?.join(", ") || "",
    badge: product?.badge || "",
    categoryId: product?.categoryId || categories[0]?.id || "",
  });
  const [variants, setVariants] = useState(
    product?.variants?.map((v) => ({ colorName: v.colorName, colorHex: v.colorHex, stock: v.stock })) || []
  );
  const [bulkPrices, setBulkPrices] = useState(
    product?.bulkPrices?.map((b) => ({ minQty: b.minQty, price: b.price })) || []
  );
  const [newCategory, setNewCategory] = useState("");

  async function handleAddCategory() {
    if (!newCategory.trim()) return;
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategory }),
    });
    const cat = await res.json();
    categories.push(cat);
    setForm((f) => ({ ...f, categoryId: cat.id }));
    setNewCategory("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      basePrice: parseFloat(form.basePrice),
      stock: parseInt(form.stock, 10),
      isDigital: form.isDigital,
      images: form.images.split(",").map((s) => s.trim()).filter(Boolean),
      tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
      badge: form.badge || null,
      variants: variants.filter((v) => v.colorName).map((v) => ({ ...v, stock: parseInt(v.stock || 0, 10) })),
      bulkPrices: bulkPrices
        .filter((b) => b.minQty && b.price)
        .map((b) => ({ minQty: parseInt(b.minQty, 10), price: parseFloat(b.price) })),
    };

    const url = product ? `/api/products/${product.id}` : "/api/products";
    const method = product ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    onSaved();
  }

  return (
    <form onSubmit={handleSubmit} className="glass p-6 space-y-5 max-w-2xl">
      <Field label="Titolo">
        <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" />
      </Field>
      <Field label="Descrizione">
        <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input min-h-[80px]" />
      </Field>
      <Field label="Immagini (URL separati da virgola)">
        <input value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} className="input" placeholder="https://..., https://..." />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Prezzo base (€)">
          <input required type="number" step="0.01" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} className="input" />
        </Field>
        <Field label="Stock totale">
          <input required type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input" />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer">
        <input
          type="checkbox"
          checked={form.isDigital}
          onChange={(e) => setForm({ ...form, isDigital: e.target.checked })}
          className="accent-kairo-sakura"
        />
        Prodotto digitale (nessuna spedizione fisica)
      </label>

      <Field label="Categoria">
        <div className="flex gap-2">
          <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="input flex-1">
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 mt-2">
          <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Nuova categoria..." className="input flex-1 text-xs" />
          <button type="button" onClick={handleAddCategory} className="text-xs px-3 rounded-lg bg-white/10 hover:bg-white/20">+</button>
        </div>
      </Field>

      <Field label="Badge">
        <select value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} className="input">
          {BADGES.map((b) => <option key={b} value={b}>{b || "Nessuno"}</option>)}
        </select>
      </Field>

      <Field label="Tag (separati da virgola)">
        <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="input" />
      </Field>

      <div>
        <p className="text-xs text-white/50 mb-2">Varianti colore (opzionale)</p>
        {variants.map((v, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input placeholder="Nome colore" value={v.colorName} onChange={(e) => {
              const next = [...variants]; next[i].colorName = e.target.value; setVariants(next);
            }} className="input flex-1 text-xs" />
            <input type="color" value={v.colorHex || "#ffb7c5"} onChange={(e) => {
              const next = [...variants]; next[i].colorHex = e.target.value; setVariants(next);
            }} className="w-10 h-9 rounded-lg bg-transparent" />
            <input type="number" placeholder="Stock" value={v.stock} onChange={(e) => {
              const next = [...variants]; next[i].stock = e.target.value; setVariants(next);
            }} className="input w-24 text-xs" />
            <button type="button" onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} className="text-white/40 text-xs px-2">✕</button>
          </div>
        ))}
        <button type="button" onClick={() => setVariants([...variants, { colorName: "", colorHex: "#ffb7c5", stock: 0 }])} className="text-xs text-kairo-sakura hover:underline">
          + Aggiungi variante
        </button>
      </div>

      <div>
        <p className="text-xs text-white/50 mb-2">Sconti quantità (bulk pricing)</p>
        {bulkPrices.map((b, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input type="number" placeholder="Quantità minima" value={b.minQty} onChange={(e) => {
              const next = [...bulkPrices]; next[i].minQty = e.target.value; setBulkPrices(next);
            }} className="input flex-1 text-xs" />
            <input type="number" step="0.01" placeholder="Prezzo (€)" value={b.price} onChange={(e) => {
              const next = [...bulkPrices]; next[i].price = e.target.value; setBulkPrices(next);
            }} className="input flex-1 text-xs" />
            <button type="button" onClick={() => setBulkPrices(bulkPrices.filter((_, idx) => idx !== i))} className="text-white/40 text-xs px-2">✕</button>
          </div>
        ))}
        <button type="button" onClick={() => setBulkPrices([...bulkPrices, { minQty: "", price: "" }])} className="text-xs text-kairo-sakura hover:underline">
          + Aggiungi sconto quantità
        </button>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="bg-kairo-sakura text-kairo-black px-6 py-2.5 rounded-full text-sm font-medium disabled:opacity-50">
          {saving ? "Salvataggio..." : "Salva prodotto"}
        </button>
        <button type="button" onClick={onCancel} className="text-white/50 text-sm">Annulla</button>
      </div>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs text-white/50 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
