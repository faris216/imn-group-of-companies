import { ProjectTable } from "@/components/admin/ProjectTable";
import { getAdapter } from "@/lib/data";

export const metadata = { title: "Builder Projects" };

export default async function BuilderProjectsAdmin() {
  const adapter = getAdapter();
  const company = await adapter.getCompanyBySlug("imn-builder");
  if (!company) return null;
  const projects = await adapter.listProjects(company.id, {});
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-navy-900">Projects</h1>
        <p className="mt-1.5 text-sm text-charcoal-600">Create, publish, feature, reorder and archive completed projects.</p>
      </div>
      <ProjectTable projects={projects} />
    </div>
  );
}
