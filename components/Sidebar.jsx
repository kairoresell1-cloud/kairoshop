"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";

const STAFF_ROLES = ["ADMIN", "OWNER", "SUPER_OWNER"];

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { items } = useCart();
  const isStaff = STAFF_ROLES.includes(session?.user?.role);
  const cartCount = items?.reduce((s, i) => s + i.quantity, 0) || 0;

  const isActive = (href) =>
    pathname === href || (href !== "/shop" && pathname.startsWith(href));

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 glass border-r border-kairo-sakura/10 flex flex-col z-20 hidden md:flex">
      <div className="px-6 py-7">
        <Link href="/shop" className="block">
          <h1 className="text-xl font-light tracking-tight">KAIRO</h1>
          <p className="text-[9px] text-kairo-sakura uppercase tracking-[0.3em] mt-0.5">
            Shop
          </p>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <NavLink href="/shop" label="Shop" active={isActive("/shop")} />
        <NavLink
          href="/cart"
          label="Carrello"
          active={isActive("/cart")}
          badge={cartCount > 0 ? cartCount : null}
        />

        {isStaff && (
          <>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.25em] px-3 mt-6 mb-2">
              Staff
            </p>
            <NavLink href="/dashboard" label="Dashboard" active={isActive("/dashboard")} />
            <NavLink href="/admin/products" label="Prodotti" active={isActive("/admin/products")} />
            <NavLink href="/admin/orders" label="Ordini" active={isActive("/admin/orders")} />
            <NavLink href="/admin/inventory" label="Magazzino" active={isActive("/admin/inventory")} />
            <NavLink href="/admin/customers" label="Clienti (CRM)" active={isActive("/admin/customers")} />
            <NavLink href="/admin/promotions" label="Promo & Coupon" active={isActive("/admin/promotions")} />
            {["OWNER", "SUPER_OWNER"].includes(session?.user?.role) && (
              <>
                <NavLink href="/admin/suppliers" label="Fornitori" active={isActive("/admin/suppliers")} />
                <NavLink href="/admin/team" label="Team & Permessi" active={isActive("/admin/team")} />
              </>
            )}
            <NavLink href="/admin/audit-log" label="Audit Log" active={isActive("/admin/audit-log")} />
          </>
        )}
      </nav>

      {session && (
        <div className="px-4 py-5 border-t border-white/5">
          <p className="text-xs text-white/60 truncate">{session.user.name}</p>
          <p className="text-[10px] text-kairo-sakura uppercase tracking-wider">
            {session.user.role}
          </p>
          <button
            onClick={() => signOut()}
            className="mt-3 text-[11px] text-white/30 hover:text-white/60 transition-colors"
          >
            Esci
          </button>
        </div>
      )}
    </aside>
  );
}

function NavLink({ href, label, active, badge }) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
        active
          ? "bg-kairo-sakura/15 text-kairo-sakura"
          : "text-white/50 hover:text-white/90 hover:bg-white/5"
      }`}
    >
      <span>{label}</span>
      {badge && (
        <span className="text-[10px] bg-kairo-sakura text-kairo-black rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
          {badge}
        </span>
      )}
    </Link>
  );
}
