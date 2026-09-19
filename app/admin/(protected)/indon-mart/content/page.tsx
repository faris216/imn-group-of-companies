import { getAdapter } from "@/lib/data";
import { TextContentForm, SeoContentForm } from "@/components/admin/ContentEditors";

export const metadata = { title: "INDON Content" };

export default async function IndonContentAdmin() {
  const adapter = getAdapter();
  const [intro, seo] = await Promise.all([
    adapter.getContent<string>("indon_intro"),
    adapter.getContent<{ title: string; description: string }>("indon-mart_seo"),
  ]);
  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl text-navy-900">INDON Content & SEO</h1>
      <div className="grid gap-6 xl:grid-cols-2">
        <TextContentForm k="indon_intro" title="Brand introduction" label="Introduction paragraph" initial={intro} />
        <SeoContentForm slug="indon-mart" initial={seo} />
      </div>
    </div>
  );
}
