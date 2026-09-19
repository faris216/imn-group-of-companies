"use client";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { GalleryItem } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";

/** Premium masonry gallery with keyboard-navigable lightbox (§28). */
export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [active, setActive] = useState<number | null>(null);

  const move = useCallback((dir: 1 | -1) => {
    setActive((a) => (a === null ? a : (a + dir + items.length) % items.length));
  }, [items.length]);

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") move(1);
      if (e.key === "ArrowLeft") move(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, move]);

  return (
    <>
      <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [column-fill:_balance]">
        {items.map((item, i) => (
          <button
            key={item.id}
            onClick={() => setActive(i)}
            className="group mb-5 block w-full break-inside-avoid overflow-hidden rounded-sm text-left shadow-soft transition-shadow duration-500 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
            aria-label={`Open image: ${item.title ?? "gallery image"}`}
          >
            <span className="img-frame img-veil relative block">
              <Image
                src={item.image_url}
                alt={item.title ?? item.description ?? "IMN gallery image"}
                width={900}
                height={i % 3 === 0 ? 1100 : i % 3 === 1 ? 700 : 900}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                loading="lazy"
                className="w-full"
              />
              {item.category === "Concepts" ? (
                <span className="absolute left-3 top-3 z-[2] rounded-full border border-gold-300/50 bg-navy-950/75 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.24em] text-gold-300 backdrop-blur-md">
                  Concept
                </span>
              ) : null}
              <span className="absolute inset-x-0 bottom-0 z-[2] translate-y-2 p-4 opacity-0 transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100">
                <span className="block font-display text-base text-ivory-50">{item.title}</span>
                <span className="mt-0.5 block text-[10px] uppercase tracking-[0.24em] text-gold-300">{item.company?.name}</span>
              </span>
            </span>
          </button>
        ))}
      </div>

      <Modal open={active !== null} onClose={() => setActive(null)} wide>
        {active !== null && items[active] ? (
          <figure>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm bg-charcoal-950 sm:aspect-[16/10]">
              <Image src={items[active]!.image_url} alt={items[active]!.title ?? "Gallery image"} fill sizes="100vw" className="object-contain" />
            </div>
            <figcaption className="mt-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-display text-lg text-navy-900">{items[active]!.title}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-charcoal-600">{items[active]!.company?.name}</p>
                {items[active]!.category === "Concepts" ? (
                  <p className="mt-1 text-xs italic text-charcoal-600">Design concept — illustrative study, not a completed client project.</p>
                ) : null}
              </div>
              <div className="flex gap-2">
                <button onClick={() => move(-1)} aria-label="Previous image" className="rounded-sm border border-charcoal-800/20 p-2.5 transition-colors hover:bg-charcoal-800/5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <button onClick={() => move(1)} aria-label="Next image" className="rounded-sm border border-charcoal-800/20 p-2.5 transition-colors hover:bg-charcoal-800/5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
                </button>
              </div>
            </figcaption>
          </figure>
        ) : null}
      </Modal>
    </>
  );
}
