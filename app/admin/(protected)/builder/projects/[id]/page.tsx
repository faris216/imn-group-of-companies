import { notFound } from "next/navigation";
import { ProjectEditor } from "@/components/admin/ProjectEditor";
import { getAdapter } from "@/lib/data";

export const metadata = { title: "Edit Project" };

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const adapter = getAdapter();
  const companies = await adapter.listCompanies();
  const builder = companies.find((c) => c.slug === "imn-builder");
  const projects = builder ? await adapter.listProjects(builder.id, {}) : [];
  const project = projects.find((p) => p.id === id) ?? null;
  if (!project || !builder) notFound();
  const withImages = { ...project, images: project.images ?? [] };
  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl text-navy-900">Edit Project</h1>
      <ProjectEditor project={withImages} companyId={builder.id} />
    </div>
  );
}
