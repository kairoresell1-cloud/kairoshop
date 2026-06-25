"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import CartButton from "./CartButton";

export default function AppShell({ children }) {
  const pathname = usePathname();
  const showNav = pathname !== "/";

  if (!showNav) return children;

  return (
    <div className="flex">
      <Suspense fallback={null}>
        <Sidebar />
      </Suspense>
      <MobileNav />
      <CartButton />
      <div className="flex-1 md:ml-60">{children}</div>
    </div>
  );
}
