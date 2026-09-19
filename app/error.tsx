"use client";
import { useEffect } from "react";
import { ImnLogo } from "@/components/brand/ImnLogo";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Server-side logging only — never expose stack traces to visitors (§63).
    console.error("IMN page error", error.digest ?? error.message);
  }, [error]);
  return (
    <section className="flex min-h-[80svh] flex-col items-center justify-center bg-navy-950 px-6 text-center">
      <div className="rounded-md bg-white/95 p-3">
        <ImnLogo width={120} />
      </div>
      <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.4em] text-gold-400">Something went wrong</p>
      <h1 className="mt-3 font-display text-4xl text-ivory-50">We&apos;re looking into it</h1>
      <p className="mt-4 max-w-md text-sm text-ivory-100/70">Our team has been notified. Please try again — or reach us directly on WhatsApp or email.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <button onClick={reset} className="rounded-sm bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-900 transition-colors hover:bg-gold-400">Try Again</button>
        <a href="/contact" className="rounded-sm border border-ivory-50/30 px-6 py-3 text-sm font-semibold text-ivory-50 transition-colors hover:bg-ivory-50/10">Contact Us</a>
      </div>
    </section>
  );
}
