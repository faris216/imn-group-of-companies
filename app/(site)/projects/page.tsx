import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/brand/PageHero";
import { ProjectCard } from "@/components/builder/ProjectCard";
import { EmptyState } from "@/components/ui/states";
import { getAdapter } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { ProjectType } from "@/lib/types";

export const metadata: Metadata = { title: "Projects", description: "IMN Builder project portfolio — residential and commercial buildings across Tamil Nadu and Puducherry." };
export const revalidate = 60;

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const adapter = getAdapter();
  const company = await adapter.getCompanyBySlug("imn-builder");
  if (!company) return null;
  const all = await adapter.listProjects(company.id, { publishedOnly: true });
  const filter: ProjectType | null = type === "residential" || type === "commercial" ? type : null;
  const projects = filter ? all.filter((p) => p.project_type === filter) : all;
  const hasResidential = all.some((p) => p.project_type === "residential");
  const hasCommercial = all.some((p) => p.project_type === "commercial");

  const filters: Array<{ key: string; label: string; show: boolean }> = [
    { key: "", label: "All", show: true },
    { key: "residential", label: "Residential", show: hasResidential },
    { key: "commercial", label: "Commercial", show: hasCommercial },
  ];

  return (
    <>
      <PageHero eyebrow="IMN Builder" title="Project Portfolio" subtitle="70+ successful projects across Tamil Nadu and Puducherry — a selection of completed works is shown below." image="/assets/builder/project-01.jpg" />
      <section className="bg-ivory-50 py-16 lg:py-24">
        <div className="container-editorial">
          <div className="glass-light sticky top-20 z-30 mb-10 inline-flex flex-wrap gap-1 rounded-full p-1.5" role="group" aria-label="Filter projects by type">
            {filters.filter((f) => f.show).map((f) => (
              <Link
                key={f.key}
                href={f.key ? `/projects?type=${f.key}` : "/projects"}
                aria-current={filter === (f.key || null) ? "true" : undefined}
                className={cn(
                  "rounded-full px-5 py-2 text-[12px] font-semibold uppercase tracking-[0.16em] transition-colors",
                  (filter ?? "") === f.key ? "bg-navy-700 text-ivory-50" : "text-charcoal-700 hover:bg-navy-700/8",
                )}
              >
                {f.label}
              </Link>
            ))}
          </div>
          {projects.length === 0 ? (
            <EmptyState title="No projects in this category yet" body="New completed works are added here as they are handed over." />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p, i) => (
                <ProjectCard key={p.id} project={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
