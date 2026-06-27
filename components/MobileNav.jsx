"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";

const STAFF_ROLES = ["ADMIN", "OWNER", "SUPER_OWNER"];

export default function MobileNav() {
  const { data: session } = useSession();
  const { items } = useCart();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isStaff = STAFF_ROLES.includes(session?.user?.role);
  const isOwnerPlus = ["OWNER", "SUPER_OWNER"].includes(session?.user?.role);
  const cartCount = items?.reduce((s, i) => s + i.quantity, 0) || 0;

  // Chiude il menu automaticamente quando si cambia pagina
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="md:hidden">
      {/* Barra superiore fissa, a tutta larghezza, sfondo solido (niente blur
          che su alcuni browser mobile genera artefatti visivi) */}
      <header className="fixed top-0 inset-x-0 z-50 h-14 bg-[#0c0c0e] border-b border-white/10 flex items-center justify-between px-4">
        <Link href="/shop" className="flex items-center gap-2 min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.png" alt="" className="w-7 h-7 object-contain flex-shrink-0" />
          <span className="text-base font-light tracking-tight truncate">KAIRO</span>
        </Link>

        <div className="flex items-center gap-1 flex-shrink-0">
          <Link
            href="/cart"
            className="relative w-10 h-10 flex items-center justify-center rounded-full active:bg-white/10"
            aria-label="Carrello"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute top-0.5 right-0.5 text-[9px] bg-kairo-sakura text-kairo-black rounded-full w-4 h-4 flex items-center justify-center font-medium">
                {cartCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => setOpen((v) => !v)}
            className="w-10 h-10 flex items-center justify-center rounded-full active:bg-white/10"
            aria-label="Menu"
          >
            <div className="w-5 flex flex-col gap-1.5 items-end">
              <span className={`block h-[1.5px] bg-white transition-all ${open ? "w-5 translate-y-[3px] rotate-45" : "w-5"}`} />
              <span className={`block h-[1.5px] bg-white transition-all ${open ? "opacity-0" : "w-3.5"}`} />
              <span className={`block h-[1.5px] bg-white transition-all ${open ? "w-5 -translate-y-[3px] -rotate-45" : "w-5"}`} />
            </div>
          </button>
        </div>
      </header>

      {/* Sfondo scuro dietro al menu, tocco per chiudere */}
      {open && (
        <button
          aria-label="Chiudi menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 top-14 z-40 bg-black/50"
        />
      )}

      {/* Pannello menu a tendina, a tutta larghezza, tap target larghi */}
      <nav
        className={`fixed top-14 inset-x-0 z-50 bg-[#0c0c0e] border-b border-white/10 overflow-hidden transition-all duration-300 ${
          open ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="py-2">
          <MobileLink href="/shop" label="Catalogo" />
          <MobileLink href="/profile" label="Il mio profilo" />

          {isStaff && (
            <>
              <p className="px-5 pt-4 pb-1 text-[10px] text-white/30 uppercase tracking-[0.25em]">Staff</p>
              <MobileLink href="/dashboard" label="Dashboard" />
              <MobileLink href="/admin/products" label="Prodotti" />
              <MobileLink href="/admin/orders" label="Ordini" />
              <MobileLink href="/admin/inventory" label="Magazzino" />
              <MobileLink href="/admin/customers" label="Clienti (CRM)" />
              <MobileLink href="/admin/promotions" label="Promo & Coupon" />
              {isOwnerPlus && (
                <>
                  <MobileLink href="/admin/suppliers" label="Fornitori" />
                  <MobileLink href="/admin/team" label="Team & Permessi" />
                </>
              )}
              <MobileLink href="/admin/audit-log" label="Audit Log" />
            </>
          )}

          {session && (
            <button
              onClick={() => signOut()}
              className="w-full text-left px-5 py-3.5 text-sm text-white/40 active:bg-white/5"
            >
              Esci
            </button>
          )}
        </div>
      </nav>

      {/* Spaziatore per non far stare il contenuto sotto la barra fissa */}
      <div className="h-14" />
    </div>
  );
}

function MobileLink({ href, label }) {
  return (
    <Link
      href={href}
      className="block px-5 py-3.5 text-sm text-white/80 active:bg-white/5 border-b border-white/[0.03]"
    >
      {label}
    </Link>
  );
}
