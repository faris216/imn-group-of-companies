import Image from "next/image";
import Link from "next/link";
import { Splash } from "@/components/home/Splash";
import { DivisionCard } from "@/components/home/DivisionCard";
import { ProjectCard } from "@/components/builder/ProjectCard";
import { ProductCard } from "@/components/indon/ProductCard";
import { JewelleryCard } from "@/components/brightstone/JewelleryCard";
import { SectionHeading } from "@/components/brand/SectionHeading";
import { Reveal } from "@/components/brand/Reveal";
import { SparkleEffect } from "@/components/brand/SparkleEffect";
import { Button } from "@/components/ui/Button";
import { getAdapter } from "@/lib/data";
import { waUrl, genericEnquiryMessage } from "@/lib/whatsapp";

export const revalidate = 60;

export default async function HomePage() {
  const adapter = getAdapter();
  const [companies, settings] = await Promise.all([adapter.listCompanies(), adapter.getSettings()]);
  const builder = companies.find((c) => c.slug === "imn-builder");
  const indon = companies.find((c) => c.slug === "indon-mart");
  const bright = companies.find((c) => c.slug === "brightstone");

  const [hero, divisions, stat, builderIntro, indonIntro, brightIntro, about, mission, vision] = await Promise.all([
    adapter.getContent<{ eyebrow?: string; title: string; tagline: string; cta_primary: string; cta_secondary: string }>("home_hero"),
    adapter.getContent<{ title: string; subtitle: string }>("home_divisions"),
    adapter.getContent<{ value: string; label: string }>("builder_stat"),
    adapter.getContent<string>("builder_intro"),
    adapter.getContent<string>("indon_intro"),
    adapter.getContent<string>("brightstone_intro"),
    adapter.getContent<string>("about"),
    adapter.getContent<string>("mission"),
    adapter.getContent<string>("vision"),
  ]);

  // Home trios must always show exactly three cards: featured first, then
  // newest published items as backfill (so freshly added products appear too).
  const takeThree = <T extends { id: string }>(featured: T[], pool: T[]) => {
    const ids = new Set(featured.map((x) => x.id));
    const out = [...featured];
    for (const x of pool) {
      if (out.length >= 3) break;
      if (!ids.has(x.id)) { out.push(x); ids.add(x.id); }
    }
    return out.slice(0, 3);
  };
  const [featProjects, featIndon, featBright] = await Promise.all([
    builder ? adapter.listProjects(builder.id, { publishedOnly: true, featured: true }) : Promise.resolve([]),
    indon ? adapter.listProducts(indon.id, { publishedOnly: true, featured: true, limit: 3 }) : Promise.resolve([]),
    bright ? adapter.listProducts(bright.id, { publishedOnly: true, featured: true, limit: 3 }) : Promise.resolve([]),
  ]);
  const [poolProjects, poolIndon, poolBright] = await Promise.all([
    featProjects.length >= 3 ? Promise.resolve([]) : builder ? adapter.listProjects(builder.id, { publishedOnly: true }) : Promise.resolve([]),
    featIndon.length >= 3 ? Promise.resolve([]) : indon ? adapter.listProducts(indon.id, { publishedOnly: true, limit: 12 }) : Promise.resolve([]),
    featBright.length >= 3 ? Promise.resolve([]) : bright ? adapter.listProducts(bright.id, { publishedOnly: true, limit: 12 }) : Promise.resolve([]),
  ]);
  const projects = takeThree(featProjects, poolProjects);
  const indonProducts = takeThree(featIndon, poolIndon);
  const brightProducts = takeThree(featBright, poolBright);
  const gallery = await adapter.listGallery({ publishedOnly: true, limit: 6 });
  const indonWa = indon ? await adapter.listWhatsApp(indon.id, { activeOnly: true }) : [];

  return (
    <>
      <Splash />

      {/* 1 — HERO */}
      <section className="relative isolate flex min-h-[92svh] items-end overflow-hidden bg-navy-950">
        <Image src="/assets/builder/project-01.jpg" alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-60" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-950/95 via-navy-950/70 to-navy-950/25" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-44 bg-gradient-to-t from-navy-950 to-transparent" aria-hidden="true" />
        <div className="container-editorial w-full pb-16 pt-40 lg:pb-24">
          <Reveal>
            <p className="mb-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.42em] text-gold-400">
              <span className="h-px w-10 bg-gold-400/70" aria-hidden="true" />
              {hero?.eyebrow ?? "Building · Food Essential Goods · Silver & Gemstones"}
            </p>
            <h1 className="max-w-4xl font-display text-4xl leading-[1.08] text-ivory-50 sm:text-5xl lg:text-6xl">
              {hero?.title ?? "IMN Group of Companies"}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-ivory-100/85 sm:text-lg">
              {hero?.tagline ?? "Three enterprises, one promise — quality, trust and care in everything we build, pack and present."}
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Button href="/companies" variant="gold" size="lg">{hero?.cta_primary ?? "Explore Our Companies"}</Button>
              <Button href="/contact" variant="outline" size="lg" className="border-ivory-50/40 text-ivory-50 hover:bg-ivory-50/10">
                {hero?.cta_secondary ?? "Contact Us"}
              </Button>
            </div>
          </Reveal>
          <Reveal delay={0.15} className="mt-12">
            <div className="glass inline-flex flex-wrap items-center gap-x-8 gap-y-4 rounded-sm px-6 py-4 sm:gap-x-10 sm:px-8 sm:py-5">
              <div>
                <p className="font-display text-2xl text-gold-300 sm:text-3xl">{stat?.value ?? "70+"}</p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-ivory-100/70">{stat?.label ?? "Successful Projects"}</p>
              </div>
              <div className="h-9 w-px bg-white/15" aria-hidden="true" />
              <div>
                <p className="font-display text-2xl text-gold-300 sm:text-3xl">3</p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-ivory-100/70">Divisions</p>
              </div>
              <div className="h-9 w-px bg-white/15" aria-hidden="true" />
              <div>
                <p className="font-display text-2xl text-gold-300 sm:text-3xl">2</p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-ivory-100/70">Regions · Tamil Nadu & Puducherry</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2 — THREE DIVISIONS */}
      <section className="bg-ivory-50 py-20 lg:py-28">
        <div className="container-editorial">
          <SectionHeading eyebrow="The Group" title={divisions?.title ?? "Our Companies"} subtitle={divisions?.subtitle} />
          <div className="mt-12 grid gap-6 md:grid-cols-3 lg:gap-8">
            {companies.map((c, i) => (
              <DivisionCard
                key={c.id}
                company={c}
                index={i}
                href={c.slug === "imn-builder" ? "/builder" : c.slug === "indon-mart" ? "/indon" : "/brightstone"}
                cta={c.slug === "imn-builder" ? "View Projects" : c.slug === "indon-mart" ? "Browse Products" : "View Collections"}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 3 — BUILDER HIGHLIGHT */}
      {builder ? (
        <section className="bg-navy-950 py-20 text-ivory-50 lg:py-28">
          <div className="container-editorial grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal className="img-frame img-veil relative aspect-[4/3] rounded-sm shadow-lift order-2 lg:order-1">
              <Image src="/assets/builder/project-02.jpg" alt="IMN Builder — completed residential project at dusk" fill sizes="(max-width: 1024px) 100vw, 50vw" />
            </Reveal>
            <div className="order-1 lg:order-2">
              <SectionHeading tone="light" eyebrow="Division 01 — IMN Builder" title="Spaces built with intention" subtitle={builderIntro ?? undefined} />
              <Reveal delay={0.1}>
                <div className="mt-9 flex items-end gap-10">
                  <div>
                    <p className="font-display text-6xl font-semibold text-gold-400 lg:text-7xl">{stat?.value ?? "70+"}</p>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-ivory-200/70">{stat?.label ?? "Successful Projects"}</p>
                  </div>
                  <div className="h-16 w-px bg-white/15" aria-hidden="true" />
                  <ul className="space-y-1.5 text-sm text-ivory-100/85">
                    <li>Residential Building</li>
                    <li>Commercial Building</li>
                    <li className="text-ivory-200/60">Tamil Nadu · Puducherry</li>
                  </ul>
                </div>
                <div className="mt-9 flex flex-wrap gap-4">
                  <Button href="/projects" variant="gold">View Projects</Button>
                  <Button href="/builder" variant="outline" className="border-ivory-50/30 text-ivory-50 hover:bg-ivory-50/10">About IMN Builder</Button>
                </div>
              </Reveal>
            </div>
          </div>
          {projects.length > 0 ? (
            <div className="container-editorial mt-16 grid gap-6 sm:grid-cols-2">
              {projects.slice(0, 2).map((p, i) => (
                <ProjectCard key={p.id} project={p} index={i} />
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {/* 4 — INDON HIGHLIGHT */}
      {indon ? (
        <section className="bg-ivory-100 py-20 lg:py-28">
          <div className="container-editorial">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading eyebrow="Division 02 — INDON Mart" title="Everyday essentials, honestly packed" subtitle={indonIntro ?? undefined} />
              <Reveal delay={0.15}><Button href="/indon/products" variant="red">Browse Catalogue</Button></Reveal>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {indonProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} waPhone={indonWa[0]?.phone_number ?? null} index={i} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* 5 — BRIGHTSTONE HIGHLIGHT */}
      {bright ? (
        <section className="relative overflow-hidden bg-charcoal-950 py-20 lg:py-28">
          <div className="pointer-events-none absolute -right-40 top-0 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(217,192,138,0.14),transparent_65%)]" aria-hidden="true" />
          <div className="container-editorial">
            <SectionHeading tone="light" eyebrow="Division 03 — Brightstone" title="Silver & gemstones, presented as craft" subtitle={brightIntro ?? undefined} />
            <div className="relative mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <SparkleEffect seed={5} />
              {brightProducts.map((p, i) => (
                <JewelleryCard key={p.id} product={p} index={i} />
              ))}
            </div>
            <Reveal delay={0.1} className="mt-10">
              <Button href="/brightstone" variant="gold">Enter the Showroom</Button>
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* 6 — GALLERY PREVIEW */}
      <section className="bg-ivory-50 py-20 lg:py-28">
        <div className="container-editorial">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow="Gallery" title="Moments from across the group" />
            <Reveal delay={0.1}><Button href="/gallery" variant="outline">Full Gallery</Button></Reveal>
          </div>
          <div className="mt-12 columns-1 gap-5 sm:columns-2 lg:columns-3">
            {gallery.items.map((g) => (
              <div key={g.id} className="img-frame img-veil mb-5 break-inside-avoid rounded-sm shadow-soft">
                <Image src={g.image_url} alt={g.title ?? "IMN gallery"} width={900} height={700} loading="lazy" sizes="(max-width: 640px) 100vw, 33vw" className="w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7 — ABOUT PREVIEW */}
      <section className="bg-navy-900 py-20 text-ivory-50 lg:py-28">
        <div className="container-editorial grid gap-12 lg:grid-cols-3">
          <SectionHeading tone="light" eyebrow="About IMN" title="One group, one standard of care" className="lg:col-span-1" />
          <Reveal delay={0.1} className="lg:col-span-2">
            <p className="whitespace-pre-line text-base leading-relaxed text-ivory-100/85">{about}</p>
            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              <div className="border-l border-gold-500/50 pl-5">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-400">Mission</h3>
                <p className="mt-3 text-sm leading-relaxed text-ivory-100/80">{mission}</p>
              </div>
              <div className="border-l border-gold-500/50 pl-5">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-400">Vision</h3>
                <p className="mt-3 text-sm leading-relaxed text-ivory-100/80">{vision}</p>
              </div>
            </div>
            <div className="mt-10">
              <Button href="/about" variant="gold">Read Our Story</Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 8 — CONTACT CTA */}
      <section className="relative isolate overflow-hidden bg-navy-950 py-20 lg:py-24">
        <Image src="/assets/builder/project-01.jpg" alt="" fill sizes="100vw" className="-z-10 object-cover opacity-20" />
        <div className="container-editorial text-center">
          <Reveal>
            <h2 className="mx-auto max-w-3xl font-display text-3xl leading-tight text-ivory-50 sm:text-4xl lg:text-5xl">
              Let&apos;s build something dependable together.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-ivory-100/80">
              {settings.address ?? "Reach any of our three divisions — we respond with care."}
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Button href="/contact" variant="gold" size="lg">Contact Us</Button>
              {indonWa[0] ? (
                <Button href={waUrl(indonWa[0].phone_number, genericEnquiryMessage("INDON Mart products"))} external variant="whatsapp" size="lg">
                  WhatsApp INDON
                </Button>
              ) : null}
            </div>
            <p className="mt-8 text-xs uppercase tracking-[0.3em] text-ivory-200/50">
              <Link href="/companies" className="underline decoration-gold-500/40 underline-offset-4 hover:text-gold-300">IMN Builder · INDON Mart · Brightstone</Link>
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
