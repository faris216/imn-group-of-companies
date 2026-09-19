import { ContactEditor } from "@/components/admin/managers";
import { getAdapter } from "@/lib/data";

export const metadata = { title: "Builder Contact" };

export default async function BuilderContactAdmin() {
  const adapter = getAdapter();
  const company = await adapter.getCompanyBySlug("imn-builder");
  if (!company) return null;
  const contact = await adapter.getContact(company.id);
  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl text-navy-900">Builder Contact</h1>
      <ContactEditor companyId={company.id} contact={contact} />
    </div>
  );
}
