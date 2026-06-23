"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="glass shadow-glow p-10 md:p-16 max-w-xl w-full"
      >
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight glow-text">
          KAIRO
        </h1>
        <p className="mt-2 text-kairo-sakura uppercase tracking-[0.3em] text-xs md:text-sm">
          Resell Store
        </p>

        <p className="mt-8 text-white/70 text-sm md:text-base">
          Piattaforma premium di e-commerce e gestione aziendale.
        </p>

        {!session ? (
          <button
            onClick={() => signIn("google")}
            className="mt-8 w-full bg-kairo-sakura hover:bg-kairo-sakuraDeep text-kairo-black font-semibold py-3 rounded-full transition-all duration-300"
          >
            Accedi con Google
          </button>
        ) : (
          <div className="mt-8 flex flex-col gap-3">
            <p className="text-sm text-white/70">
              Ciao, {session.user.name} — ruolo:{" "}
              <span className="text-kairo-sakura">{session.user.role}</span>
            </p>
            <Link
              href="/shop"
              className="bg-kairo-sakura hover:bg-kairo-sakuraDeep text-kairo-black font-semibold py-3 rounded-full transition-all duration-300"
            >
              Vai allo Shop
            </Link>
            {["ADMIN", "OWNER", "SUPER_OWNER"].includes(session.user.role) && (
              <Link
                href="/dashboard"
                className="sakura-border text-kairo-sakura py-3 rounded-full hover:bg-white/5 transition-all duration-300"
              >
                Dashboard Admin
              </Link>
            )}
            <button
              onClick={() => signOut()}
              className="text-white/40 text-xs mt-2 hover:text-white/70"
            >
              Esci
            </button>
          </div>
        )}
      </motion.div>
    </main>
  );
}
