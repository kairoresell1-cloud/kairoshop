"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminPageShell from "@/components/AdminPageShell";

export default function CreateOrderPage() {
  const router = useRouter();
  const [mode, setMode] = useState(null); // "manual" | "code"
  const [products, setProducts] = useState([]);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [sourceCode, setSourceCode] = useState(null);

  const [items, setItems] = useState([]); // { productId, variantName, quantity, unitPrice }
  const [customer, setCustomer] = useState({
    userEmail: "", customerName: "", customerSurname: "", customerStreet: "",
    customerStreetNumber: "", customerCity: "", customerZip: "", customerPhone: "",
  });
  const [shippingFee, setShippingFee] = useState(7);
  const [total, setTotal] = useState("");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 10));
  const [trackingCode, setTrackingCode] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then(setProducts);
  }, []);

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  async function handleLookupCode(e) {
    e.preventDefault();
    setCodeError("");
    const res = await fetch(`/api/orders/lookup/${code.trim().toUpperCase()}`);
    if (!res.ok) {
      setCodeError("Codice non trovato.");
      return;
    }
    const data = await res.json();
    setSourceCode(data.code);
    setItems(data.items.map((i) => ({
      productId: i.productId, variantName: i.variantName, quantity: i.quantity, unitPrice: i.unitPrice,
    })));
    setShippingFee(data.shippingFee);
    setTotal(data.total);
    if (data.user) setCustomer((c) => ({ ...c, userEmail: data.user.email, customerName: data.user.name || "" }));
    setMode("manual"); // riusa lo stesso form, ora precompilato
  }

  function addItem() {
    if (products.length === 0) return;
    setItems([...items, { productId: products[0].id, variantName: null, quantity: 1, unitPrice: products[0].basePrice }]);
  }

  function updateItem(i, patch) {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    setItems(next);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (items.length === 0) return alert("Aggiungi almeno un prodotto.");
    setSaving(true);
    const res = await fetch("/api/orders/manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...customer,
        orderDate,
        trackingCode: trackingCode || undefined,
        items,
        shippingFee: parseFloat(shippingFee),
        total: total !== "" ? parseFloat(total) : undefined,
        sourceCode: sourceCode || undefined,
      }),
    });
    setSaving(false);
    if (res.ok) {
      const order = await res.json();
      router.push(`/admin/orders/${order.id}`);
    } else {
      alert("Errore nella creazione dell'ordine.");
    }
  }

  if (!mode) {
    return (
      <AdminPageShell title="Crea ordine" description="Scegli come inserire l'ordine.">
        <div className="grid md:grid-cols-2 gap-5 max-w-2xl">
          <button onClick={() => setMode("manual")} className="glass p-8 text-left hover:bg-white/5 transition-all">
            <h3 className="font-medium mb-2">Creazione manuale</h3>
            <p className="text-xs text-white/40">Compila tutto da zero: prodotti, quantità, colore, dati destinatario.</p>
          </button>
          <button onClick={() => setMode("code")} className="glass p-8 text-left hover:bg-white/5 transition-all">
            <h3 className="font-medium mb-2">Tramite codice cliente</h3>
            <p className="text-xs text-white/40">Inserisci il codice (KS-XXXX-XXXX) per popolare l'ordine in automatico.</p>
          </button>
        </div>
      </AdminPageShell>
    );
  }

  if (mode === "code" && !sourceCode) {
    return (
      <AdminPageShell title="Tramite codice cliente">
        <form onSubmit={handleLookupCode} className="glass p-6 max-w-md space-y-3">
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="KS-XXXX-XXXX" className="input" required />
          {codeError && <p className="text-xs text-red-400">{codeError}</p>}
          <button className="bg-kairo-sakura text-kairo-black px-5 py-2.5 rounded-full text-sm font-medium">Cerca codice</button>
          <button type="button" onClick={() => setMode(null)} className="text-xs text-white/40 ml-3">← Indietro</button>
        </form>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell title={sourceCode ? `Ordine da codice ${sourceCode}` : "Creazione manuale"} description="Tutti i campi sono modificabili.">
      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        <div className="glass p-5">
          <h3 className="text-sm font-medium mb-4">Prodotti</h3>
          {items.map((item, i) => {
            const product = products.find((p) => p.id === item.productId);
            return (
              <div key={i} className="flex flex-wrap gap-2 mb-3 items-center">
                <select
                  value={item.productId}
                  onChange={(e) => {
                    const p = products.find((pr) => pr.id === e.target.value);
                    updateItem(i, { productId: e.target.value, unitPrice: p?.basePrice || 0, variantName: null });
                  }}
                  className="input text-xs flex-1 min-w-[160px]"
                >
                  {products.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
                {product?.variants?.length > 0 && (
                  <select value={item.variantName || ""} onChange={(e) => updateItem(i, { variantName: e.target.value || null })} className="input text-xs w-32">
                    <option value="">Nessuna variante</option>
                    {product.variants.map((v) => <option key={v.id} value={v.colorName}>{v.colorName}</option>)}
                  </select>
                )}
                <input type="number" min={1} value={item.quantity} onChange={(e) => updateItem(i, { quantity: parseInt(e.target.value || 1, 10) })} className="input text-xs w-20" />
                <input type="number" step="0.01" value={item.unitPrice} onChange={(e) => updateItem(i, { unitPrice: parseFloat(e.target.value || 0) })} className="input text-xs w-24" placeholder="€ unitario" />
                <button type="button" onClick={() => setItems(items.filter((_, idx) => idx !== i))} className="text-white/40 text-xs px-2">✕</button>
              </div>
            );
          })}
          <button type="button" onClick={addItem} className="text-xs text-kairo-sakura hover:underline">+ Aggiungi prodotto</button>
        </div>

        <div className="glass p-5 space-y-3">
          <h3 className="text-sm font-medium mb-2">Destinatario</h3>
          <input placeholder="Email Google cliente (opzionale, per collegare il profilo)" value={customer.userEmail} onChange={(e) => setCustomer({ ...customer, userEmail: e.target.value })} className="input text-xs" />
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Nome" value={customer.customerName} onChange={(e) => setCustomer({ ...customer, customerName: e.target.value })} className="input text-xs" />
            <input placeholder="Cognome" value={customer.customerSurname} onChange={(e) => setCustomer({ ...customer, customerSurname: e.target.value })} className="input text-xs" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <input placeholder="Via" value={customer.customerStreet} onChange={(e) => setCustomer({ ...customer, customerStreet: e.target.value })} className="input text-xs col-span-2" />
            <input placeholder="N°" value={customer.customerStreetNumber} onChange={(e) => setCustomer({ ...customer, customerStreetNumber: e.target.value })} className="input text-xs" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Città" value={customer.customerCity} onChange={(e) => setCustomer({ ...customer, customerCity: e.target.value })} className="input text-xs" />
            <input placeholder="CAP" value={customer.customerZip} onChange={(e) => setCustomer({ ...customer, customerZip: e.target.value })} className="input text-xs" />
          </div>
          <input placeholder="Telefono" value={customer.customerPhone} onChange={(e) => setCustomer({ ...customer, customerPhone: e.target.value })} className="input text-xs" />
        </div>

        <div className="glass p-5 space-y-3">
          <h3 className="text-sm font-medium mb-2">Spedizione, data e prezzi</h3>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Data ordine"><input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} className="input text-xs" /></Field>
            <Field label="Spedizione (€)"><input type="number" step="0.01" value={shippingFee} onChange={(e) => setShippingFee(e.target.value)} className="input text-xs" /></Field>
            <Field label="Codice tracking"><input value={trackingCode} onChange={(e) => setTrackingCode(e.target.value)} className="input text-xs" /></Field>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-white/10">
            <span className="text-xs text-white/50">Subtotale calcolato: €{subtotal.toFixed(2)}</span>
            <Field label="Totale finale (sovrascrivibile per sconti)">
              <input type="number" step="0.01" placeholder={`€${(subtotal + parseFloat(shippingFee || 0)).toFixed(2)}`} value={total} onChange={(e) => setTotal(e.target.value)} className="input text-xs w-40" />
            </Field>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="bg-kairo-sakura text-kairo-black px-6 py-2.5 rounded-full text-sm font-medium disabled:opacity-50">
            {saving ? "Creazione..." : "Crea ordine"}
          </button>
          <button type="button" onClick={() => router.push("/admin/orders")} className="text-white/40 text-sm">Annulla</button>
        </div>
      </form>
    </AdminPageShell>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] text-white/40 mb-1">{label}</label>
      {children}
    </div>
  );
}
