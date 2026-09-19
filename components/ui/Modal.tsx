"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  wide?: boolean;
  labelledBy?: string;
}

/** Accessible dialog: focus trap, Esc to close, scroll lock, aria wiring. */
export function Modal({ open, onClose, title, children, wide, labelledBy }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    const focusables = () =>
      Array.from(ref.current?.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') ?? []);
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const f = focusables();
        if (f.length === 0) return;
        const first = f[0]!, last = f[f.length - 1]!;
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-8">
      <div className="absolute inset-0 bg-charcoal-950/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        aria-labelledby={labelledBy}
        className={cn("glass-light relative max-h-[88vh] w-full overflow-y-auto rounded-md p-6 sm:p-8", wide ? "max-w-4xl" : "max-w-lg")}
      >
        {title ? (
          <div className="mb-5 flex items-start justify-between gap-4">
            <h2 className="font-display text-2xl text-navy-900">{title}</h2>
            <button onClick={onClose} aria-label="Close dialog" className="rounded-sm p-1.5 text-charcoal-600 transition-colors hover:bg-charcoal-800/8 hover:text-charcoal-900">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, body, confirmLabel = "Confirm", danger }: {
  open: boolean; onClose: () => void; onConfirm: () => void; title: string; body?: string; confirmLabel?: string; danger?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-charcoal-600">{body}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button onClick={onClose} className="rounded-sm border border-charcoal-800/20 px-4 py-2 text-sm text-charcoal-700 transition-colors hover:bg-charcoal-800/5">Cancel</button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          className={cn("rounded-sm px-4 py-2 text-sm font-medium text-white transition-colors", danger ? "bg-red-700 hover:bg-red-600" : "bg-navy-700 hover:bg-navy-600")}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
