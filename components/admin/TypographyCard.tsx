"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Label, Select } from "@/components/ui/fields";
import { useToast } from "@/components/ui/Toast";
import { saveTypography } from "@/app/actions/admin";

/** Word-style paragraph alignment switch (Admin → Settings). */
export function TypographyCard({ initial }: { initial: "justify" | "left" }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [align, setAlign] = useState<"justify" | "left">(initial);
  return (
    <section className="max-w-4xl rounded-md border border-charcoal-800/8 bg-white p-6 shadow-soft">
      <h2 className="font-display text-xl text-navy-900">Typography</h2>
      <p className="mt-1.5 text-sm text-charcoal-600">
        How paragraph text aligns across the public website. “Justified” spreads lines edge-to-edge like Ctrl+J in Microsoft Word.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            const res = await saveTypography({ paragraph_align: align });
            toast(res.ok ? "Paragraph alignment saved." : res.error, res.ok ? "success" : "error");
            if (res.ok) router.refresh();
          });
        }}
        className="mt-5 flex flex-wrap items-end gap-4"
      >
        <div className="w-64">
          <Label>Paragraph alignment</Label>
          <Select value={align} onChange={(e) => setAlign(e.target.value as "justify" | "left")}>
            <option value="justify">Justified (Word Ctrl+J)</option>
            <option value="left">Left aligned</option>
          </Select>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-sm bg-navy-800 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-navy-700 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save"}
        </button>
      </form>
    </section>
  );
}
