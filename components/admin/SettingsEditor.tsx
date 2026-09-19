"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input, Label, Textarea } from "@/components/ui/fields";
import { ImageUploader } from "./ImageUploader";
import { useToast } from "@/components/ui/Toast";
import { saveSettings } from "@/app/actions/admin";
import type { SiteSettings } from "@/lib/types";

export function SettingsEditor({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [v, setV] = useState({
    site_title: settings.site_title,
    tagline: settings.tagline ?? "",
    address: settings.address ?? "",
    maps_url: settings.maps_url ?? "",
    maps_qr_image_url: settings.maps_qr_image_url,
    website_qr_image_url: settings.website_qr_image_url,
    whatsapp_qr_image_url: settings.whatsapp_qr_image_url,
    footer_note: settings.footer_note ?? "",
    seo_title: settings.seo_title ?? "",
    seo_description: settings.seo_description ?? "",
  });
  const set = (k: keyof typeof v, val: unknown) => setV((s) => ({ ...s, [k]: val }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await saveSettings(v);
          toast(res.ok ? "Settings saved." : res.error, res.ok ? "success" : "error");
          if (res.ok) router.refresh();
        });
      }}
      className="max-w-4xl space-y-6"
    >
      <section className="grid gap-5 rounded-md border border-charcoal-800/8 bg-white p-6 shadow-soft sm:grid-cols-2">
        <h2 className="font-display text-xl text-navy-900 sm:col-span-2">Site identity</h2>
        <div><Label>Site title</Label><Input value={v.site_title} onChange={(e) => set("site_title", e.target.value)} /></div>
        <div><Label>Tagline</Label><Input value={v.tagline} onChange={(e) => set("tagline", e.target.value)} /></div>
        <div className="sm:col-span-2"><Label>Group address</Label><Textarea rows={2} value={v.address} onChange={(e) => set("address", e.target.value)} /></div>
        <div className="sm:col-span-2"><Label>Google Maps URL</Label><Input value={v.maps_url} onChange={(e) => set("maps_url", e.target.value)} /></div>
        <div><Label>Footer note</Label><Input value={v.footer_note} onChange={(e) => set("footer_note", e.target.value)} /></div>
      </section>

      <section className="grid gap-5 rounded-md border border-charcoal-800/8 bg-white p-6 shadow-soft sm:grid-cols-3">
        <h2 className="font-display text-xl text-navy-900 sm:col-span-3">QR codes — kept strictly separate</h2>
        <ImageUploader dir="qr" value={v.maps_qr_image_url} onChange={(u) => set("maps_qr_image_url", u)} label="Google Maps QR" />
        <ImageUploader dir="qr" value={v.website_qr_image_url} onChange={(u) => set("website_qr_image_url", u)} label="Website QR (optional)" />
        <ImageUploader dir="qr" value={v.whatsapp_qr_image_url} onChange={(u) => set("whatsapp_qr_image_url", u)} label="WhatsApp QR (optional)" />
        <p className="text-[11px] text-charcoal-600 sm:col-span-3">The supplied QR (Google Maps) is pre-loaded. Never replace it with a WhatsApp QR — purposes stay separate.</p>
      </section>

      <section className="grid gap-5 rounded-md border border-charcoal-800/8 bg-white p-6 shadow-soft">
        <h2 className="font-display text-xl text-navy-900">SEO defaults</h2>
        <div><Label>Default meta title</Label><Input value={v.seo_title} onChange={(e) => set("seo_title", e.target.value)} /></div>
        <div><Label>Default meta description</Label><Textarea rows={3} value={v.seo_description} onChange={(e) => set("seo_description", e.target.value)} /></div>
      </section>

      <button className="rounded-sm bg-gold-500 px-7 py-3 text-sm font-semibold text-navy-900 shadow-soft hover:bg-gold-400 disabled:opacity-60" disabled={pending}>
        {pending ? "Saving…" : "Save Settings"}
      </button>
    </form>
  );
}
