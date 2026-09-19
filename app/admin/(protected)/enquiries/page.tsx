import { EnquiryTable } from "@/components/admin/managers";
import { getAdapter } from "@/lib/data";

export const metadata = { title: "Enquiries" };

export default async function AdminEnquiriesPage() {
  const adapter = getAdapter();
  const enquiries = await adapter.listEnquiries({ status: "all" });
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-navy-900">Enquiries</h1>
        <p className="mt-1.5 text-sm text-charcoal-600">Messages from the public contact form — mark them contacted or closed as you progress.</p>
      </div>
      <EnquiryTable enquiries={enquiries} />
    </div>
  );
}
