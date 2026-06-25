"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";

export default function CartButton() {
  const pathname = usePathname();
  const { items } = useCart();
  const cartCount = items?.reduce((s, i) => s + i.quantity, 0) || 0;

  // Non mostrarlo nella pagina carrello stessa, per non essere ridondante
  if (pathname === "/cart") return null;

  return (
    <Link
      href="/cart"
      className="fixed top-4 right-4 md:top-5 md:right-6 z-40 glass w-11 h-11 rounded-full hidden md:flex items-center justify-center hover:border-kairo-sakura/40 transition-all"
      aria-label="Carrello"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {cartCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 text-[10px] bg-kairo-sakura text-kairo-black rounded-full w-5 h-5 flex items-center justify-center font-medium">
          {cartCount}
        </span>
      )}
    </Link>
  );
}
