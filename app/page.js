"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/shop");
    }
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-kairo-sakura/30 border-t-kairo-sakura rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 35%, rgba(255,183,197,0.10), transparent 60%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass shadow-glow p-10 md:p-16 max-w-md w-full relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex justify-center mb-2"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.png"
            alt="Kairo Shop"
            className="w-28 h-28 object-contain drop-shadow-[0_0_25px_rgba(255,183,197,0.45)]"
          />
        </motion.div>

        <p className="text-[10px] text-white/30 uppercase tracking-[0.4em] mb-1">
          Premium Resell Platform
        </p>
        <h1 className="text-4xl md:text-5xl font-light tracking-tight glow-text">
          KAIRO
        </h1>
        <p className="mt-1 text-kairo-sakura uppercase tracking-[0.35em] text-[11px]">
          Resell Store
        </p>

        <div className="w-10 h-px bg-kairo-sakura/30 mx-auto my-8" />

        <button
          onClick={() => signIn("google")}
          className="w-full flex items-center justify-center gap-3 bg-white text-kairo-black font-medium py-3.5 rounded-full transition-all duration-300 hover:bg-kairo-sakura hover:shadow-glow"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.12-.84 2.07-1.8 2.7v2.26h2.92c1.71-1.57 2.68-3.88 2.68-6.6z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.16l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33C2.44 15.98 5.48 18 9 18z"/>
            <path fill="#FBBC05" d="M3.97 10.74A5.4 5.4 0 0 1 3.69 9c0-.6.1-1.2.28-1.74V4.93H.96A8.97 8.97 0 0 0 0 9c0 1.45.35 2.83.96 4.07l3.01-2.33z"/>
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.93l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/>
          </svg>
          Accedi con Google
        </button>
      </motion.div>

      <p className="mt-8 text-white/20 text-[10px] tracking-widest uppercase relative z-10">
        Kairo Shop © 2026
      </p>
    </main>
  );
}
