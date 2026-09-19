import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/brand/PageHero";
import { SectionHeading } from "@/components/brand/SectionHeading";
import { Reveal } from "@/components/brand/Reveal";
import { ContactForm } from "@/components/contact/ContactForm";
import { WhatsAppButton } from "@/components/brand/WhatsAppButton";
import { getAdapter } from "@/lib/data";
import { directionsUrl, mapsEmbedUrl } from "@/lib/utils";
import { genericEnquiryMessage, waUrl } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Contact", description: "Contact IMN Builder, INDON Mart or Brightstone — email, phone, WhatsApp, Google Maps and enquiries." };
export const revalidate = 60;

export default async function ContactPage() {
  const adapter = getAdapter();
  const [companies, settings] = await Promise.all([adapter.listCompanies(), adapter.getSettings()]);
  const rows = await Promise.all(
    companies.map(async (c) => ({
      company: c,
      contact: await adapter.getContact(c.id),
      whatsapp: await adapter.listWhatsApp(c.id, { activeOnly: true }),
    })),
  );
  const embed = mapsEmbedUrl(settings.maps_url, settings.address);
  const directions = directionsUrl(settings.maps_url, settings.address);

  return (
    <>
      <PageHero eyebrow="Contact" title="Talk to the right division, directly" subtitle="Every enquiry reaches the team that can actually help — builder, mart or showroom." />

      <section className="bg-ivory-50 py-16 lg:py-24">
        <div className="container-editorial grid gap-6 lg:grid-cols-3">
          {rows.map(({ company, contact, whatsapp }, i) => (
            <Reveal key={company.id} delay={i * 0.08}>
              <article className="glass-light flex h-full flex-col rounded-md p-7">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold-600">Division 0{i + 1}</p>
                <h2 className="mt-2 font-display text-2xl text-navy-900">{company.name}</h2>
                <ul className="mt-5 space-y-3 text-sm text-charcoal-700">
                  {contact?.email ? (
                    <li>
                      <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-charcoal-600">Email</span>
                      <a className="underline decoration-gold-500/40 underline-offset-4 hover:text-navy-700" href={`mailto:${contact.email}`}>{contact.email}</a>
                    </li>
                  ) : null}
                  {contact?.phone ? (
                    <li>
                      <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-charcoal-600">Phone</span>
                      <a className="hover:text-navy-700" href={`tel:${contact.phone.replace(/\s/g, "")}`}>{contact.phone}</a>
                    </li>
                  ) : null}
                  {whatsapp.length > 0 ? (
                    <li>
                      <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-charcoal-600">WhatsApp</span>
                      {whatsapp.map((w) => (
                        <span key={w.id} className="block">{w.phone_number}{w.label ? <span className="text-charcoal-600/70"> — {w.label}</span> : null}</span>
                      ))}
                    </li>
                  ) : null}
                  {contact?.address ? (
                    <li>
                      <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-charcoal-600">Address</span>
                      {contact.address}
                    </li>
                  ) : null}
                </ul>
                <div className="mt-auto flex flex-wrap gap-2.5 pt-6">
                  {whatsapp[0] ? (
                    <WhatsAppButton href={waUrl(whatsapp[0].phone_number, genericEnquiryMessage(company.name))} size="sm">WhatsApp</WhatsAppButton>
                  ) : null}
                  {contact?.email ? (
                    <a href={`mailto:${contact.email}`} className="inline-flex items-center rounded-sm border border-navy-700/25 px-3.5 py-2 text-xs font-medium text-navy-700 transition-colors hover:bg-navy-700/5">Email</a>
                  ) : null}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-ivory-100 py-16 lg:py-24">
        <div className="container-editorial grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Write to us" title="Send an enquiry" subtitle="We store every enquiry securely and respond in person." />
            <div className="mt-8">
              <ContactForm companies={companies} />
            </div>
          </div>
          <div>
            <SectionHeading eyebrow="Find us" title="Google Maps & QR" />
            <div className="mt-8 overflow-hidden rounded-md border border-charcoal-800/10 shadow-soft">
              {embed ? (
                <iframe title="IMN Group of Companies on Google Maps" src={embed} className="h-[320px] w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              ) : (
                <div className="flex h-[320px] items-center justify-center bg-ivory-200 text-sm text-charcoal-600">Map will appear once an address is configured.</div>
              )}
            </div>
            <div className="glass-light mt-6 flex items-center gap-6 rounded-md p-6">
              {settings.maps_qr_image_url ? (
                <Image src={settings.maps_qr_image_url} alt="QR code linking to IMN on Google Maps" width={132} height={132} className="rounded-sm bg-white p-2" />
              ) : null}
              <div>
                <h3 className="font-display text-xl text-navy-900">Scan for Google Maps</h3>
                <p className="mt-1.5 text-sm text-charcoal-600">{settings.address ?? "Address to be configured."}</p>
                {directions ? (
                  <a href={directions} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-navy-700 underline decoration-gold-500/50 underline-offset-4 hover:text-navy-600">
                    Get Directions
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9" /></svg>
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
