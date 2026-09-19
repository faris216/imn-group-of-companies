"use client";
import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { uploadImage } from "@/app/actions/upload";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

/** Admin image upload with preview, replace & validation feedback (§56). */
export function ImageUploader({ dir, value, onChange, label = "Image", aspect = "aspect-square" }: {
  dir: string; value: string | null; onChange: (url: string | null) => void; label?: string; aspect?: string;
}) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const [drag, setDrag] = useState(false);

  function handleFile(file: File | undefined | null) {
    if (!file) return;
    const fd = new FormData();
    fd.set("file", file);
    fd.set("dir", dir);
    start(async () => {
      const res = await uploadImage(fd);
      if (res.ok && res.data) {
        onChange(res.data.url);
        toast("Image uploaded.");
      } else toast(res.ok ? "Upload returned no file." : res.error, "error");
    });
  }

  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-charcoal-700">{label}</p>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files?.[0]); }}
        className={cn("relative flex items-center justify-center overflow-hidden rounded-sm border-2 border-dashed transition-colors", aspect, drag ? "border-navy-600 bg-navy-700/6" : "border-charcoal-800/20 bg-white")}
      >
        {value ? (
          <>
            <Image src={value} alt="Upload preview" fill sizes="320px" className="object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 bg-charcoal-950/60 p-2 backdrop-blur-sm">
              <button type="button" onClick={() => inputRef.current?.click()} className="rounded-sm bg-ivory-50/90 px-3 py-1.5 text-[11px] font-semibold text-charcoal-800 hover:bg-white">Replace</button>
              <button type="button" onClick={() => onChange(null)} className="rounded-sm bg-red-700/90 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-red-600">Remove</button>
            </div>
          </>
        ) : (
          <button type="button" onClick={() => inputRef.current?.click()} className="flex flex-col items-center gap-2 p-6 text-charcoal-600 hover:text-navy-700">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M12 16V4m0 0l-4 4m4-4l4 4" /><path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" /></svg>
            <span className="text-xs font-semibold">{pending ? "Uploading…" : "Click or drop an image"}</span>
            <span className="text-[10px] text-charcoal-600/70">PNG · JPEG · WebP · AVIF — max 8 MB</span>
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/avif" className="sr-only" aria-label={`Upload ${label}`} onChange={(e) => handleFile(e.target.files?.[0])} />
    </div>
  );
}
