import { getAdapter } from "@/lib/data";
import { TextContentForm, WhyContentForm, HeroContentForm } from "@/components/admin/ContentEditors";

export const metadata = { title: "Group Content" };

export default async function GroupContentAdmin() {
  const adapter = getAdapter();
  const [about, ourStory, missionText, visionText, why, hero] = await Promise.all([
    adapter.getContent<string>("about"),
    adapter.getContent<string>("our_story"),
    adapter.getContent<string>("mission"),
    adapter.getContent<string>("vision"),
    adapter.getContent<Array<{ title: string; body: string }>>("why_imn"),
    adapter.getContent<{ title: string; tagline: string; cta_primary: string; cta_secondary: string }>("home_hero"),
  ]);
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-navy-900">Group Content</h1>
        <p className="mt-1.5 text-sm text-charcoal-600">About, story, mission, vision and homepage wording — draft text until the client confirms.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <TextContentForm k="about" title="About IMN" label="About paragraph(s)" initial={about} />
        <TextContentForm k="our_story" title="Our Story" label="Story paragraph(s)" initial={ourStory} />
        <TextContentForm k="mission" title="Mission" label="Mission statement" initial={missionText} />
        <TextContentForm k="vision" title="Vision" label="Vision statement" initial={visionText} />
        <WhyContentForm initial={why} />
        <HeroContentForm initial={hero} />
      </div>
    </div>
  );
}
