import { BackButton } from "@/components/ui/BackButton";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/brand/PageHero";
import { Reveal } from "@/components/brand/Reveal";
import { Button } from "@/components/ui/Button";
import { getAdapter } from "@/lib/data";
import { waUrl, genericEnquiryMessage } from "@/lib/whatsapp";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const adapter = getAdapter();
  const project = await adapter.getProjectBySlug(slug);
  if (!project) return { title: "Project not found" };
  return { title: project.name, description: project.description?.slice(0, 160) ?? undefined };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const adapter = getAdapter();
  const project = await adapter.getProjectBySlug(slug);
  if (!project) notFound();
  const company = await adapter.getCompanyBySlug("imn-builder");
  const wa = company ? await adapter.listWhatsApp(company.id, { activeOnly: true }) : [];
  const contact = company ? await adapter.getContact(company.id) : null;
  const waPhone = wa[0]?.phone_number ?? contact?.phone ?? null;
  const images = project.images?.length ? project.images : project.main_image_url ? [{ id: "main", image_url: project.main_image_url, alt_text: project.name }] : [];

  return (
    <>
      <PageHero image={project.main_image_url} eyebrow={project.project_type === "residential" ? "Residential Project" : "Commercial Project"} title={project.name} subtitle={project.location ?? undefined} tall>
        <BackButton fallback="/projects" tone="dark" />
      </PageHero>

      <section className="bg-ivory-50 py-16 lg:py-24">
        <div className="container-editorial grid gap-14 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <h2 className="font-display text-2xl text-navy-900">About this project</h2>
            <div className="mt-4 h-px w-16 bg-gradient-to-r from-gold-500 to-transparent" aria-hidden="true" />
            <p className="mt-6 whitespace-pre-line leading-relaxed text-charcoal-700">{project.description}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <dl className="glass-light space-y-5 rounded-md p-7">
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-600">Location</dt>
                <dd className="mt-1 text-sm text-charcoal-800">{project.location ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-600">Project type</dt>
                <dd className="mt-1 text-sm capitalize text-charcoal-800">{project.project_type}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-600">Status</dt>
                <dd className="mt-1 text-sm text-charcoal-800">Completed</dd>
              </div>
              <div className="border-t border-charcoal-800/10 pt-5">
                <Button href="/contact" variant="primary" className="w-full">Enquire About a Project</Button>
                {waPhone ? (
                  <Button href={waUrl(waPhone, genericEnquiryMessage(`the project “${project.name}”`))} external variant="whatsapp" className="mt-3 w-full">
                    WhatsApp IMN Builder
                  </Button>
                ) : null}
              </div>
            </dl>
          </Reveal>
        </div>
      </section>

      {images.length > 0 ? (
        <section className="bg-ivory-100 py-16 lg:py-24">
          <div className="container-editorial">
            <h2 className="font-display text-2xl text-navy-900">Project gallery</h2>
            <div className="mt-8 columns-1 gap-5 sm:columns-2">
              {images.map((img) => (
                <div key={img.id} className="img-frame img-veil mb-5 break-inside-avoid rounded-sm shadow-soft">
                  <Image src={img.image_url} alt={img.alt_text ?? project.name} width={1200} height={900} loading="lazy" sizes="(max-width:640px) 100vw, 50vw" className="w-full" />
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm">
              <Link href="/projects" className="text-navy-700 underline decoration-gold-500/50 underline-offset-4 hover:text-navy-600">← Back to all projects</Link>
            </p>
          </div>
        </section>
      ) : null}
    </>
  );
}
