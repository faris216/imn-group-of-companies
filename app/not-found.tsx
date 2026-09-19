import Link from "next/link";
import { ImnLogo } from "@/components/brand/ImnLogo";

export default function NotFound() {
  return (
    <section className="flex min-h-[80svh] flex-col items-center justify-center bg-navy-950 px-6 text-center">
      <div className="rounded-md bg-white/95 p-3">
        <ImnLogo width={120} />
      </div>
      <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.4em] text-gold-400">Error 404</p>
      <h1 className="mt-3 font-display text-4xl text-ivory-50 sm:text-5xl">This page doesn&apos;t exist</h1>
      <p className="mt-4 max-w-md text-sm text-ivory-100/70">The link may be outdated, or the content may have been unpublished. Let&apos;s get you back to familiar ground.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link href="/" className="rounded-sm bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-900 transition-colors hover:bg-gold-400">Back to Home</Link>
        <Link href="/contact" className="rounded-sm border border-ivory-50/30 px-6 py-3 text-sm font-semibold text-ivory-50 transition-colors hover:bg-ivory-50/10">Contact Us</Link>
      </div>
    </section>
  );
}
