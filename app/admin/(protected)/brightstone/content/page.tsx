import { getAdapter } from "@/lib/data";
import { TextContentForm, SeoContentForm } from "@/components/admin/ContentEditors";

export const metadata = { title: "Brightstone Content" };

export default async function BrightstoneContentAdmin() {
  const adapter = getAdapter();
  const [intro, seo] = await Promise.all([
    adapter.getContent<string>("brightstone_intro"),
    adapter.getContent<{ title: string; description: string }>("brightstone_seo"),
  ]);
  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl text-navy-900">Brightstone Content & SEO</h1>
      <div className="grid gap-6 xl:grid-cols-2">
        <TextContentForm k="brightstone_intro" title="Showroom introduction" label="Introduction paragraph" initial={intro} />
        <SeoContentForm slug="brightstone" initial={seo} />
      </div>
    </div>
  );
}
