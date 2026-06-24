"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";

const STAFF_ROLES = ["ADMIN", "OWNER", "SUPER_OWNER"];

export default function MobileNav() {
  const { data: session } = useSession();
  const { items } = useCart();
  const [open, setOpen] = useState(false);
  const isStaff = STAFF_ROLES.includes(session?.user?.role);
  const cartCount = items?.reduce((s, i) => s + i.quantity, 0) || 0;

  return (
    <div className="md:hidden">
      <div className="fixed top-0 left-0 right-0 z-30 glass border-b border-kairo-sakura/10 flex items-center justify-between px-4 py-3">
        <Link href="/shop" className="text-lg font-light tracking-tight">
          KAIRO
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative text-sm text-white/70">
            Carrello
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 text-[9px] bg-kairo-sakura text-kairo-black rounded-full px-1.5">
                {cartCount}
              </span>
            )}
          </Link>
          <button onClick={() => setOpen(!open)} className="text-white/70 text-sm">
            ☰
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed top-12 left-0 right-0 z-30 glass border-b border-kairo-sakura/10 px-4 py-4 space-y-2">
          <Link href="/shop" className="block text-sm text-white/70 py-1">Shop</Link>
          {isStaff && (
            <>
              <Link href="/dashboard" className="block text-sm text-white/70 py-1">Dashboard</Link>
              <Link href="/admin/products" className="block text-sm text-white/70 py-1">Prodotti</Link>
              <Link href="/admin/orders" className="block text-sm text-white/70 py-1">Ordini</Link>
            </>
          )}
          {session && (
            <button onClick={() => signOut()} className="block text-sm text-white/40 py-1">
              Esci
            </button>
          )}
        </div>
      )}
      <div className="h-12" />
    </div>
  );
}
