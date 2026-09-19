import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/brand/PageHero";
import { SectionHeading } from "@/components/brand/SectionHeading";
import { Reveal } from "@/components/brand/Reveal";
import { Button } from "@/components/ui/Button";
import { getAdapter } from "@/lib/data";

export const metadata: Metadata = {
  title: "About",
  description: "IMN Group of Companies — our story, mission and vision across IMN Builder, INDON Mart and Brightstone Silver & Gemstones.",
};
export const revalidate = 60;

export default async function AboutPage() {
  const adapter = getAdapter();
  const [about, story, mission, vision, why, stat, companies] = await Promise.all([
    adapter.getContent<string>("about"),
    adapter.getContent<string>("our_story"),
    adapter.getContent<string>("mission"),
    adapter.getContent<string>("vision"),
    adapter.getContent<Array<{ title: string; body: string }>>("why_imn"),
    adapter.getContent<{ value: string; label: string }>("builder_stat"),
    adapter.listCompanies(),
  ]);

  return (
    <>
      <PageHero eyebrow="About the Group" title="Quality, trust and excellence — across every venture" subtitle={undefined} image="/assets/builder/project-02.jpg" />

      <section className="bg-ivory-50 py-20 lg:py-28">
        <div className="container-editorial grid gap-14 lg:grid-cols-5">
          <SectionHeading eyebrow="About IMN" title="A group built on care and consistency" className="lg:col-span-2" />
          <Reveal delay={0.1} className="lg:col-span-3">
            <p className="whitespace-pre-line text-lg leading-relaxed text-charcoal-700">{about}</p>
          </Reveal>
        </div>
      </section>

      <section className="bg-ivory-100 py-20 lg:py-28">
        <div className="container-editorial grid gap-14 lg:grid-cols-2">
          <Reveal>
            <h2 className="font-display text-3xl text-navy-900">Our Story</h2>
            <div className="mt-5 h-px w-16 bg-gradient-to-r from-gold-500 to-transparent" aria-hidden="true" />
            <p className="mt-6 whitespace-pre-line leading-relaxed text-charcoal-700">{story}</p>
          </Reveal>
          <Reveal delay={0.12} className="img-frame img-veil relative min-h-[320px] rounded-sm shadow-lift">
            <Image src="/assets/builder/project-01.jpg" alt="IMN Builder — completed residential project" fill sizes="(max-width: 1024px) 100vw, 50vw" />
          </Reveal>
        </div>
      </section>

      <section className="bg-navy-950 py-20 text-ivory-50 lg:py-28">
        <div className="container-editorial grid gap-10 lg:grid-cols-2">
          <Reveal className="border-l border-gold-500/50 pl-6">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.34em] text-gold-400">Our Mission</h2>
            <p className="mt-5 font-display text-2xl leading-snug text-ivory-100">{mission}</p>
          </Reveal>
          <Reveal delay={0.1} className="border-l border-gold-500/50 pl-6">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.34em] text-gold-400">Our Vision</h2>
            <p className="mt-5 font-display text-2xl leading-snug text-ivory-100">{vision}</p>
          </Reveal>
        </div>
      </section>

      <section className="bg-ivory-50 py-20 lg:py-28">
        <div className="container-editorial">
          <SectionHeading eyebrow="The Divisions" title="Three companies, one family of standards" />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {companies.map((c, i) => (
              <Reveal key={c.id} delay={i * 0.08}>
                <article className="h-full rounded-sm border border-charcoal-800/8 bg-white p-7 shadow-soft">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold-600">Division 0{i + 1}</p>
                  <h3 className="mt-2 font-display text-2xl text-navy-900">{c.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-charcoal-600">{c.short_description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ivory-100 py-20 lg:py-28">
        <div className="container-editorial grid gap-12 lg:grid-cols-2">
          <SectionHeading eyebrow="Why IMN" title="What holds the group together" />
          <div className="space-y-8">
            {(why ?? []).map((w, i) => (
              <Reveal key={w.title} delay={i * 0.08} className="flex gap-5">
                <span className="font-display text-3xl text-gold-500">0{i + 1}</span>
                <div>
                  <h3 className="font-display text-xl text-navy-900">{w.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-charcoal-600">{w.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <div className="container-editorial mt-16">
          <Reveal className="glass-dark flex flex-col items-center justify-between gap-6 rounded-md bg-navy-900 px-8 py-10 sm:flex-row">
            <div className="text-center sm:text-left">
              <p className="font-display text-5xl font-semibold text-gold-400">{stat?.value ?? "70+"}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-ivory-200/70">{stat?.label ?? "Successful Projects"}</p>
            </div>
            <p className="max-w-md text-sm text-ivory-100/80">Across Tamil Nadu and Puducherry, IMN Builder turns plans into places people are proud to live and work in.</p>
            <Button href="/contact" variant="gold">Talk to Us</Button>
          </Reveal>
        </div>
      </section>
    </>
  );
}
