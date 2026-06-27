"use client";

import { useSession } from "next-auth/react";

const STAFF_ROLES = ["ADMIN", "OWNER", "SUPER_OWNER"];

export default function AdminPageShell({ title, description, requireOwner = false, children }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-kairo-sakura/30 border-t-kairo-sakura rounded-full animate-spin" />
      </main>
    );
  }

  const role = session?.user?.role;
  const allowed = requireOwner
    ? ["OWNER", "SUPER_OWNER"].includes(role)
    : STAFF_ROLES.includes(role);

  if (!allowed) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="glass p-8 text-center max-w-sm">
          <p className="text-white/70 text-sm">Accesso riservato allo staff Kairo.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 md:px-10 py-10 max-w-5xl">
      <p className="text-[10px] text-kairo-sakura uppercase tracking-[0.3em] mb-1">Staff</p>
      <h1 className="text-3xl font-light tracking-tight mb-2">{title}</h1>
      {description && <p className="text-white/40 text-sm mb-8">{description}</p>}
      {children || (
        <div className="glass p-10 text-center">
          <p className="text-white/40 text-sm">Modulo in costruzione — disponibile in una prossima fase.</p>
        </div>
      )}
    </main>
  );
}
