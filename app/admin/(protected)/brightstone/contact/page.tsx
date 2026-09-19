import { ContactEditor } from "@/components/admin/managers";
import { getAdapter } from "@/lib/data";

export const metadata = { title: "Brightstone Contact" };

export default async function BrightstoneContactAdmin() {
  const adapter = getAdapter();
  const company = await adapter.getCompanyBySlug("brightstone");
  if (!company) return null;
  const contact = await adapter.getContact(company.id);
  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl text-navy-900">Brightstone Contact</h1>
      <ContactEditor companyId={company.id} contact={contact} />
    </div>
  );
}
