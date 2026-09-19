import { SettingsEditor } from "@/components/admin/SettingsEditor";
import { TypographyCard } from "@/components/admin/TypographyCard";
import { getAdapter } from "@/lib/data";

export const metadata = { title: "Global Settings" };

export default async function AdminSettingsPage() {
  const adapter = getAdapter();
  const [settings, typo] = await Promise.all([
    adapter.getSettings(),
    adapter.getContent<{ paragraph_align?: string }>("typography"),
  ]);
  const align = typo?.paragraph_align === "left" ? "left" : "justify";
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-navy-900">Global Settings</h1>
        <p className="mt-1.5 text-sm text-charcoal-600">Logo, identity, address, Maps, QR codes, footer and SEO defaults.</p>
      </div>
      <SettingsEditor settings={settings} />
      <TypographyCard initial={align} />
    </div>
  );
}
