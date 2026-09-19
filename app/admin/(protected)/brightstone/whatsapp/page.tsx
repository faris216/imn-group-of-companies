import { WhatsAppManager } from "@/components/admin/managers";
import { getAdapter } from "@/lib/data";

export const metadata = { title: "Brightstone WhatsApp" };

export default async function BrightstoneWhatsAppAdmin() {
  const adapter = getAdapter();
  const company = await adapter.getCompanyBySlug("brightstone");
  if (!company) return null;
  const numbers = await adapter.listWhatsApp(company.id);
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-navy-900">WhatsApp / Phone</h1>
        <p className="mt-1.5 text-sm text-charcoal-600">Receives “Enquire Now” messages for Brightstone pieces.</p>
      </div>
      <WhatsAppManager companyId={company.id} numbers={numbers} />
    </div>
  );
}
