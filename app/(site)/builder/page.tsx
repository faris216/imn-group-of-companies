import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/brand/PageHero";
import { SectionHeading } from "@/components/brand/SectionHeading";
import { Reveal } from "@/components/brand/Reveal";
import { ProjectCard } from "@/components/builder/ProjectCard";
import { Button } from "@/components/ui/Button";
import { getAdapter } from "@/lib/data";
import { waUrl, genericEnquiryMessage } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "IMN Builder",
  description: "IMN Builder — residential and commercial building construction across Tamil Nadu and Puducherry. 70+ successful projects.",
};
export const revalidate = 60;

const DEFAULT_SERVICES = [
  { title: "Residential Building", body: "Homes planned around light, ventilation and family life — from foundation to handover." },
  { title: "Commercial Building", body: "Shops, offices and commercial spaces built for durability, compliance and daily business." },
];

export default async function BuilderPage() {
  const adapter = getAdapter();
  const company = await adapter.getCompanyBySlug("imn-builder");
  if (!company) return null;
  const [stat, intro, projects, gallery, contact, wa, services] = await Promise.all([
    adapter.getContent<{ value: string; label: string }>("builder_stat"),
    adapter.getContent<string>("builder_intro"),
    adapter.listProjects(company.id, { publishedOnly: true }),
    adapter.listGallery({ companyId: company.id, publishedOnly: true, limit: 24 }),
    adapter.getContact(company.id),
    adapter.listWhatsApp(company.id, { activeOnly: true }),
    adapter.getContent<Array<{ title: string; body: string }>>("builder_services"),
  ]);
  const serviceList = services?.length ? services : DEFAULT_SERVICES;
  const waPhone = wa[0]?.phone_number ?? contact?.phone ?? null;

  // Split the builder gallery: "Concepts" feed the design-studies section,
  // everything else stays in the site-to-handover masonry.
  const concepts = gallery.items.filter((g) => g.category === "Concepts");
  const siteGallery = gallery.items.filter((g) => g.category !== "Concepts").slice(0, 6);

  const featured = projects[0] ?? null;
  const restProjects = projects.slice(1, 4);

  return (
    <>
      <PageHero image={company.hero_image_url} eyebrow="Division 01" title="IMN Builder" subtitle={company.short_description ?? undefined} tall>
        <div className="flex flex-wrap gap-4">
          <Button href="/projects" variant="gold">View Projects</Button>
          {waPhone ? <Button href={waUrl(waPhone, genericEnquiryMessage("a building project"))} external variant="whatsapp">Enquire on WhatsApp</Button> : null}
        </div>
      </PageHero>

      <section className="bg-ivory-50 py-20 lg:py-28">
        <div className="container-editorial grid gap-14 lg:grid-cols-5">
          <SectionHeading eyebrow="The Builder" title="Thoughtfully engineered, cleanly executed" className="lg:col-span-2" />
          <Reveal delay={0.1} className="lg:col-span-3">
            <p className="text-lg leading-relaxed text-charcoal-700">{intro ?? company.description}</p>
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              <div>
                <p className="font-display text-5xl font-semibold text-navy-700">{stat?.value ?? "70+"}</p>
                <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.26em] text-charcoal-600">{stat?.label ?? "Successful Projects"}</p>
              </div>
              <div>
                <p className="font-display text-5xl font-semibold text-navy-700">2</p>
                <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.26em] text-charcoal-600">Regions Served</p>
              </div>
              <div>
                <p className="font-display text-5xl font-semibold text-navy-700">2</p>
                <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.26em] text-charcoal-600">Building Services</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-navy-950 py-20 text-ivory-50 lg:py-28">
        <div className="container-editorial">
          <SectionHeading tone="light" eyebrow="Services" title="Construction of buildings" />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {serviceList.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.1}>
                <article className="glass h-full rounded-sm p-8">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold-400">Service 0{i + 1}</p>
                  <h3 className="mt-3 font-display text-2xl">{s.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ivory-100/80">{s.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.15} className="mt-10 flex flex-wrap gap-3 text-sm text-ivory-100/80">
            <span className="rounded-full border border-white/15 px-4 py-1.5">Tamil Nadu</span>
            <span className="rounded-full border border-white/15 px-4 py-1.5">Puducherry</span>
          </Reveal>
        </div>
      </section>

      {/* ── Selected Works — featured lead project + supporting cards ── */}
      <section className="bg-ivory-100 py-20 lg:py-28">
        <div className="container-editorial">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow="Project Showcase" title="Selected completed works" />
            <Reveal delay={0.1}><Button href="/projects" variant="outline">All Projects</Button></Reveal>
          </div>

          {featured ? (
            <Reveal className="mt-12">
              <Link href={`/projects/${featured.slug}`} className="group block">
                <article className="img-frame img-veil relative aspect-[4/3] overflow-hidden rounded-sm shadow-soft transition-shadow duration-500 group-hover:shadow-lift sm:aspect-[16/9]">
                  {featured.main_image_url ? (
                    <Image
                      src={featured.main_image_url}
                      alt={`${featured.name} — ${featured.location ?? "project"} view`}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 100vw"
                      className="transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                  ) : null}
                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-gold-400 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-navy-950">Featured</span>
                    <span className="rounded-full bg-navy-950/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-300 backdrop-blur-md">
                      {featured.project_type === "residential" ? "Residential" : "Commercial"}
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/85 via-navy-950/35 to-transparent p-6 pt-16 lg:p-8 lg:pt-20">
                    <h3 className="font-display text-2xl leading-snug text-ivory-50 lg:text-3xl">{featured.name}</h3>
                    <p className="mt-1.5 text-xs uppercase tracking-[0.2em] text-gold-300/90">{featured.location}</p>
                    {featured.description ? (
                      <p className="mt-3 hidden max-w-2xl text-sm leading-relaxed text-ivory-100/85 lg:block">{featured.description}</p>
                    ) : null}
                  </div>
                </article>
              </Link>
            </Reveal>
          ) : null}

          {restProjects.length > 0 ? (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {restProjects.map((p, i) => (
                <ProjectCard key={p.id} project={p} index={i} />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* ── Design Concepts & Visual Studies — asymmetric editorial grid ── */}
      {concepts.length > 0 ? (
        <section className="bg-navy-950 py-20 text-ivory-50 lg:py-28">
          <div className="container-editorial">
            <SectionHeading tone="light" eyebrow="The Studio" title="Design concepts & visual studies" />
            <Reveal delay={0.08}>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ivory-100/70">
                Explorations from our drawing board — massing, light and material studies that shape how an IMN building could feel.
              </p>
            </Reveal>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {concepts.map((c, i) => (
                <Reveal
                  key={c.id}
                  delay={(i % 3) * 0.08}
                  className={i === 0 ? "h-full sm:col-span-2 lg:col-span-2 lg:row-span-2" : "h-full"}
                >
                  <figure
                    className={`img-frame img-veil group relative h-full overflow-hidden rounded-sm shadow-soft ${
                      i === 0 ? "aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:min-h-[520px]" : "aspect-[4/3]"
                    }`}
                  >
                    <Image
                      src={c.image_url}
                      alt={c.title ?? "IMN Builder design concept"}
                      fill
                      loading="lazy"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                      className="transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                    <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-navy-950/85 to-transparent p-4 pt-10">
                      <span className="text-xs uppercase tracking-[0.18em] text-ivory-100/90">{c.title}</span>
                      <span className="shrink-0 rounded-full border border-gold-300/50 bg-navy-950/70 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.24em] text-gold-300 backdrop-blur-md">
                        Concept
                      </span>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.12}>
              <p className="mt-8 text-xs italic leading-relaxed text-ivory-100/55">
                * Design concepts and visual studies by the IMN Builder studio — illustrative works, not completed client projects.
              </p>
            </Reveal>
          </div>
        </section>
      ) : null}

      {siteGallery.length > 0 ? (
        <section className="bg-ivory-50 py-20 lg:py-28">
          <div className="container-editorial">
            <SectionHeading eyebrow="Gallery" title="From site to handover" />
            <div className="mt-12 columns-1 gap-5 sm:columns-2 lg:columns-3">
              {siteGallery.map((g) => (
                <div key={g.id} className="img-frame img-veil mb-5 break-inside-avoid rounded-sm shadow-soft">
                  <Image src={g.image_url} alt={g.title ?? "IMN Builder gallery"} width={900} height={700} loading="lazy" sizes="(max-width:640px) 100vw, 33vw" className="w-full" />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-navy-900 py-16 text-center text-ivory-50 lg:py-20">
        <div className="container-editorial">
          <Reveal>
            <h2 className="font-display text-3xl sm:text-4xl">Planning a building?</h2>
            <p className="mx-auto mt-4 max-w-xl text-ivory-100/80">Tell us about your site and your vision — IMN Builder will respond with honest guidance.</p>
            <div className="mt-8 flex justify-center gap-4">
              <Button href="/contact" variant="gold" size="lg">Contact IMN Builder</Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
