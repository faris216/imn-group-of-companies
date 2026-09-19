import type { Metadata } from "next";
import { PageHero } from "@/components/brand/PageHero";
import { SectionHeading } from "@/components/brand/SectionHeading";
import { DivisionCard } from "@/components/home/DivisionCard";
import { getAdapter } from "@/lib/data";

export const metadata: Metadata = { title: "Our Companies", description: "IMN Builder, INDON Mart and Brightstone Silver & Gemstones — the three divisions of IMN Group of Companies." };
export const revalidate = 60;

export default async function CompaniesPage() {
  const adapter = getAdapter();
  const companies = await adapter.listCompanies();
  return (
    <>
      <PageHero eyebrow="Our Companies" title="Three divisions, one promise" subtitle="Each company keeps its own character — architectural, everyday, or precious — while sharing the group's single standard of quality, trust and care." />
      <section className="bg-ivory-50 py-20 lg:py-28">
        <div className="container-editorial">
          <SectionHeading eyebrow="The Group" title="IMN Builder · INDON Mart · Brightstone" />
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
    </>
  );
}
