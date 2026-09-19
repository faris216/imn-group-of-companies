import { EnquiryTable } from "@/components/admin/managers";
import { getAdapter } from "@/lib/data";

export const metadata = { title: "Brightstone Enquiries" };

export default async function BrightstoneEnquiriesAdmin() {
  const adapter = getAdapter();
  const company = await adapter.getCompanyBySlug("brightstone");
  if (!company) return null;
  const enquiries = await adapter.listEnquiries({ companyId: company.id, status: "all" });
  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl text-navy-900">Enquiries</h1>
      <EnquiryTable enquiries={enquiries} />
    </div>
  );
}
