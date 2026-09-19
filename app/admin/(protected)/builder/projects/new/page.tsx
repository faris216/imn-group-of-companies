import { ProjectEditor } from "@/components/admin/ProjectEditor";
import { getAdapter } from "@/lib/data";

export const metadata = { title: "New Project" };

export default async function NewProjectPage() {
  const adapter = getAdapter();
  const company = await adapter.getCompanyBySlug("imn-builder");
  if (!company) return null;
  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl text-navy-900">Add Project</h1>
      <ProjectEditor project={null} companyId={company.id} />
    </div>
  );
}
