"use client";
import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Input, Label, Textarea } from "@/components/ui/fields";
import { useToast } from "@/components/ui/Toast";
import { saveContent } from "@/app/actions/admin";

function Shell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-md border border-charcoal-800/8 bg-white p-6 shadow-soft">
      <h2 className="mb-5 font-display text-xl text-navy-900">{title}</h2>
      {children}
    </section>
  );
}

function SaveButton({ pending }: { pending: boolean }) {
  return (
    <button type="submit" disabled={pending} className="mt-5 rounded-sm bg-navy-700 px-6 py-2.5 text-sm font-semibold text-ivory-50 hover:bg-navy-600 disabled:opacity-60">
      {pending ? "Saving…" : "Save"}
    </button>
  );
}

export function TextContentForm({ k, title, label, initial, companyId = null, multiline = true }: {
  k: string; title: string; label: string; initial: string | null; companyId?: string | null; multiline?: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [value, setValue] = useState(initial ?? "");
  return (
    <Shell title={title}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            const res = await saveContent(k, value, companyId);
            toast(res.ok ? (res.message ?? "Content saved.") : res.error, res.ok ? "success" : "error");
            if (res.ok) router.refresh();
          });
        }}
      >
        <Label htmlFor={`c-${k}`}>{label}</Label>
        {multiline ? (
          <Textarea id={`c-${k}`} rows={6} value={value} onChange={(e) => setValue(e.target.value)} />
        ) : (
          <Input id={`c-${k}`} value={value} onChange={(e) => setValue(e.target.value)} />
        )}
        <SaveButton pending={pending} />
      </form>
    </Shell>
  );
}

export function StatContentForm({ initial }: { initial: { value: string; label: string } | null }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [value, setValue] = useState(initial?.value ?? "70+");
  const [label, setLabel] = useState(initial?.label ?? "Successful Projects");
  return (
    <Shell title="Builder statistic">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            const res = await saveContent("builder_stat", { value, label }, null);
            toast(res.ok ? "Statistic saved." : res.error, res.ok ? "success" : "error");
            if (res.ok) router.refresh();
          });
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <div>
          <Label>Value</Label>
          <Input value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
        <div>
          <Label>Label</Label>
          <Input value={label} onChange={(e) => setLabel(e.target.value)} />
        </div>
        <div className="sm:col-span-2"><SaveButton pending={pending} /></div>
      </form>
      <p className="mt-3 text-[11px] text-charcoal-600">Only use figures confirmed by the client (currently: 70+ Successful Projects).</p>
    </Shell>
  );
}

export function HeroContentForm({ initial }: { initial: { eyebrow?: string; title?: string; tagline?: string; cta_primary?: string; cta_secondary?: string } | null }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [v, setV] = useState({
    eyebrow: initial?.eyebrow ?? "IMN",
    title: initial?.title ?? "IMN",
    tagline: initial?.tagline ?? "",
    cta_primary: initial?.cta_primary ?? "Explore Our Companies",
    cta_secondary: initial?.cta_secondary ?? "Contact Us",
  });
  return (
    <Shell title="Homepage hero">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            const res = await saveContent("home_hero", v, null);
            toast(res.ok ? "Hero saved." : res.error, res.ok ? "success" : "error");
            if (res.ok) router.refresh();
          });
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        {(["title", "tagline", "cta_primary", "cta_secondary"] as const).map((key) => (
          <div key={key} className={key === "tagline" ? "sm:col-span-2" : ""}>
            <Label>{key.replace("_", " ")}</Label>
            <Input value={v[key] ?? ""} onChange={(e) => setV((s) => ({ ...s, [key]: e.target.value }))} />
          </div>
        ))}
        <div className="sm:col-span-2"><SaveButton pending={pending} /></div>
      </form>
    </Shell>
  );
}

/** List editor — one "Title :: Body" per line. Used for Why-IMN, services, etc. */
export function LinesContentForm({ k, title, initial }: { k: string; title: string; initial: Array<{ title: string; body: string }> | null }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [text, setText] = useState((initial ?? []).map((w) => `${w.title} :: ${w.body}`).join("\n"));
  return (
    <Shell title={title}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const items = text.split("\n").filter((l) => l.includes("::")).map((l) => {
            const [t, b] = l.split("::");
            return { title: (t ?? "").trim(), body: (b ?? "").trim() };
          });
          start(async () => {
            const res = await saveContent(k, items, null);
            toast(res.ok ? "Saved." : res.error, res.ok ? "success" : "error");
            if (res.ok) router.refresh();
          });
        }}
      >
        <Textarea rows={6} value={text} onChange={(e) => setText(e.target.value)} />
        <SaveButton pending={pending} />
      </form>
    </Shell>
  );
}

export function WhyContentForm({ initial }: { initial: Array<{ title: string; body: string }> | null }) {
  return <LinesContentForm k="why_imn" title="Why IMN (one per line: Title :: Body)" initial={initial} />;
}

export function SeoContentForm({ slug, initial }: { slug: string; initial: { title: string; description: string } | null }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [v, setV] = useState({ title: initial?.title ?? "", description: initial?.description ?? "" });
  return (
    <Shell title="Search engine preview (SEO)">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            const res = await saveContent(`${slug}_seo`, v, null);
            toast(res.ok ? "SEO saved." : res.error, res.ok ? "success" : "error");
            if (res.ok) router.refresh();
          });
        }}
        className="grid gap-4"
      >
        <div>
          <Label>Meta title</Label>
          <Input value={v.title} onChange={(e) => setV((s) => ({ ...s, title: e.target.value }))} placeholder="Leave empty for default" />
        </div>
        <div>
          <Label>Meta description</Label>
          <Textarea rows={3} value={v.description} onChange={(e) => setV((s) => ({ ...s, description: e.target.value }))} placeholder="150–160 characters recommended" />
        </div>
        <div><SaveButton pending={pending} /></div>
      </form>
    </Shell>
  );
}
