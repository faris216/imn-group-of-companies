"use client";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * Cinematic splash (§16): dark premium field → logo illumination → elegant exit.
 * Shown once per session; skipped entirely under prefers-reduced-motion.
 */
export function Splash() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"show" | "exit" | "done">("show");

  useEffect(() => {
    if (reduce) { setPhase("done"); return; }
    if (sessionStorage.getItem("imn-splash-seen")) { setPhase("done"); return; }
    sessionStorage.setItem("imn-splash-seen", "1");
    const t1 = setTimeout(() => setPhase("exit"), 1500);
    const t2 = setTimeout(() => setPhase("done"), 2150);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [reduce]);

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-950"
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === "exit" ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 0.61, 0.36, 1] }}
          aria-hidden="true"
        >
          <div className="splash-halo absolute h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(201,162,39,0.28),transparent_65%)]" />
          <div className="splash-logo relative rounded-md bg-white/95 px-10 py-8 shadow-[0_0_80px_rgba(201,162,39,0.25)]">
            <Image src="/assets/brand/imn-logo.png" alt="" width={277} height={112} style={{ width: 210, height: 85 }} priority />
          </div>
          <p className="absolute bottom-10 text-[10px] uppercase tracking-[0.5em] text-ivory-200/50">Group of Companies</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
