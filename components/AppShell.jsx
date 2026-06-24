"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

export default function AppShell({ children }) {
  const pathname = usePathname();
  const showNav = pathname !== "/";

  if (!showNav) return children;

  return (
    <div className="flex">
      <Sidebar />
      <MobileNav />
      <div className="flex-1 md:ml-60">{children}</div>
    </div>
  );
}
