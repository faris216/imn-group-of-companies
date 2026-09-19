import Link from "next/link";
import { ImnLogo } from "@/components/brand/ImnLogo";
import { WhatsAppIcon } from "@/components/brand/WhatsAppButton";
import { getAdapter } from "@/lib/data";
import { waUrl, genericEnquiryMessage } from "@/lib/whatsapp";

export async function Footer() {
  const adapter = getAdapter();
  const [settings, companies] = await Promise.all([adapter.getSettings(), adapter.listCompanies()]);
  const indon = companies.find((c) => c.slug === "indon-mart");
  const wa = indon ? await adapter.listWhatsApp(indon.id, { activeOnly: true }) : [];
  const waHref = wa[0] ? waUrl(wa[0].phone_number, genericEnquiryMessage("IMN Group of Companies")) : null;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy-950 text-ivory-100">
      <div className="container-editorial grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4 lg:py-20">
        <div>
          <div className="inline-block rounded-sm bg-white/95 p-2.5">
            <ImnLogo width={124} />
          </div>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-ivory-200/70">
            {settings.tagline ?? "Builders · Essentials · Silver & Gemstones — one group, one standard of care."}
          </p>
        </div>

        <nav aria-label="Footer — companies">
          <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-400">Our Companies</h2>
          <ul className="space-y-2.5 text-sm">
            <li><Link className="transition-colors hover:text-gold-300" href="/builder">IMN Builder</Link></li>
            <li><Link className="transition-colors hover:text-gold-300" href="/indon">INDON Mart</Link></li>
            <li><Link className="transition-colors hover:text-gold-300" href="/brightstone">Brightstone Silver &amp; Gemstones</Link></li>
          </ul>
        </nav>

        <nav aria-label="Footer — quick links">
          <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-400">Quick Links</h2>
          <ul className="space-y-2.5 text-sm">
            <li><Link className="transition-colors hover:text-gold-300" href="/about">About</Link></li>
            <li><Link className="transition-colors hover:text-gold-300" href="/projects">Projects</Link></li>
            <li><Link className="transition-colors hover:text-gold-300" href="/indon/products">INDON Products</Link></li>
            <li><Link className="transition-colors hover:text-gold-300" href="/gallery">Gallery</Link></li>
            <li><Link className="transition-colors hover:text-gold-300" href="/contact">Contact</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-400">Reach Us</h2>
          <ul className="space-y-2.5 text-sm text-ivory-200/80">
            {settings.address ? <li>{settings.address}</li> : null}
            {settings.maps_url ? (
              <li>
                <a className="underline decoration-gold-500/50 underline-offset-4 transition-colors hover:text-gold-300" href={settings.maps_url} target="_blank" rel="noopener noreferrer">
                  Google Maps
                </a>
              </li>
            ) : null}
            {waHref ? (
              <li>
                <a className="inline-flex items-center gap-2 transition-colors hover:text-gold-300" href={waHref} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon className="h-3.5 w-3.5" /> WhatsApp
                </a>
              </li>
            ) : null}
            {Object.entries(settings.social_json ?? {}).map(([k, v]) => (
              <li key={k}>
                <a className="transition-colors hover:text-gold-300" href={v} target="_blank" rel="noopener noreferrer">{k}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/8">
        <div className="container-editorial flex flex-col items-center justify-between gap-3 py-6 text-xs text-ivory-200/55 sm:flex-row">
          <p>© {year} IMN Group of Companies. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            {settings.footer_note ? <p>{settings.footer_note}</p> : <p>IMN Builder · INDON Mart · Brightstone Silver &amp; Gemstones</p>}
            <Link href="/admin" className="rounded-sm border border-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ivory-200/70 transition-colors hover:border-gold-400/60 hover:text-gold-300">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
