"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminPageShell from "@/components/AdminPageShell";

const STATUSES = ["DA_PREPARARE", "PREPARATO", "SPEDITO", "CONSEGNATO"];
const STATUS_LABELS = {
  DA_PREPARARE: "Da preparare",
  PREPARATO: "Preparato",
  SPEDITO: "Spedito",
  CONSEGNATO: "Consegnato",
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  function load() {
    fetch(`/api/orders/${id}`).then((r) => r.json()).then((data) => {
      setOrder(data);
      setForm({
        status: data.status,
        customerName: data.customerName || "",
        customerSurname: data.customerSurname || "",
        customerStreet: data.customerStreet || "",
        customerStreetNumber: data.customerStreetNumber || "",
        customerCity: data.customerCity || "",
        customerZip: data.customerZip || "",
        customerPhone: data.customerPhone || "",
        trackingCarrier: data.trackingCarrier || "",
        trackingCode: data.trackingCode || "",
        subtotal: data.subtotal,
        shippingFee: data.shippingFee,
        total: data.total,
      });
    });
  }
  useEffect(load, [id]);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        subtotal: parseFloat(form.subtotal),
        shippingFee: parseFloat(form.shippingFee),
        total: parseFloat(form.total),
      }),
    });
    setSaving(false);
    load();
  }

  async function handleDelete() {
    if (!confirm("Eliminare definitivamente questo ordine? Le statistiche del cliente verranno ricalcolate.")) return;
    await fetch(`/api/orders/${id}`, { method: "DELETE" });
    router.push("/admin/orders");
  }

  if (!order || !form) {
    return (
      <AdminPageShell title="Ordine">
        <div className="glass h-40 animate-pulse" />
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell title={order.code} description={`Ordine creato il ${new Date(order.createdAt).toLocaleDateString("it-IT")}`}>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass p-5">
          <h3 className="text-sm font-medium mb-4">Prodotti ordinati</h3>
          <div className="space-y-2 text-xs">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-white/60">
                <span>{item.quantity}x {item.product?.title || "Prodotto rimosso"} {item.variantName ? `(${item.variantName})` : ""}</span>
                <span>€{(item.unitPrice * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-5 space-y-3">
          <h3 className="text-sm font-medium mb-2">Stato & Tracking</h3>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input text-xs">
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Corriere" value={form.trackingCarrier} onChange={(e) => setForm({ ...form, trackingCarrier: e.target.value })} className="input text-xs" />
            <input placeholder="Codice tracking" value={form.trackingCode} onChange={(e) => setForm({ ...form, trackingCode: e.target.value })} className="input text-xs" />
          </div>
        </div>

        <div className="glass p-5 space-y-3">
          <h3 className="text-sm font-medium mb-2">Dati destinatario</h3>
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Nome" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="input text-xs" />
            <input placeholder="Cognome" value={form.customerSurname} onChange={(e) => setForm({ ...form, customerSurname: e.target.value })} className="input text-xs" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <input placeholder="Via" value={form.customerStreet} onChange={(e) => setForm({ ...form, customerStreet: e.target.value })} className="input text-xs col-span-2" />
            <input placeholder="N°" value={form.customerStreetNumber} onChange={(e) => setForm({ ...form, customerStreetNumber: e.target.value })} className="input text-xs" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Città" value={form.customerCity} onChange={(e) => setForm({ ...form, customerCity: e.target.value })} className="input text-xs" />
            <input placeholder="CAP" value={form.customerZip} onChange={(e) => setForm({ ...form, customerZip: e.target.value })} className="input text-xs" />
          </div>
          <input placeholder="Telefono" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} className="input text-xs" />
        </div>

        <div className="glass p-5 space-y-3">
          <h3 className="text-sm font-medium mb-2">Prezzi (modificabili — sconti confidenziali)</h3>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Subtotale">
              <input type="number" step="0.01" value={form.subtotal} onChange={(e) => setForm({ ...form, subtotal: e.target.value })} className="input text-xs" />
            </Field>
            <Field label="Spedizione">
              <input type="number" step="0.01" value={form.shippingFee} onChange={(e) => setForm({ ...form, shippingFee: e.target.value })} className="input text-xs" />
            </Field>
            <Field label="Totale">
              <input type="number" step="0.01" value={form.total} onChange={(e) => setForm({ ...form, total: e.target.value })} className="input text-xs font-semibold" />
            </Field>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button onClick={handleSave} disabled={saving} className="bg-kairo-sakura text-kairo-black px-6 py-2.5 rounded-full text-sm font-medium disabled:opacity-50">
          {saving ? "Salvataggio..." : "Salva modifiche"}
        </button>
        <button onClick={handleDelete} className="text-red-400 text-sm px-4">
          Elimina ordine
        </button>
      </div>
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
