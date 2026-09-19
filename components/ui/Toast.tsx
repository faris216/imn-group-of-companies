"use client";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ToastItem { id: number; message: string; tone: "success" | "error" | "info"; }
interface Ctx { toast: (message: string, tone?: ToastItem["tone"]) => void; }

const ToastCtx = createContext<Ctx>({ toast: () => {} });
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const toast = useCallback((message: string, tone: ToastItem["tone"] = "success") => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 4200);
  }, []);
  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[120] flex w-[min(92vw,380px)] flex-col gap-2" role="status" aria-live="polite">
        {items.map((t) => (
          <div
            key={t.id}
            className={cn(
              "glass-dark pointer-events-auto flex items-start gap-3 rounded-sm px-4 py-3 text-sm text-ivory-50 shadow-lift",
              t.tone === "success" && "border-l-2 border-l-[#37c47a]",
              t.tone === "error" && "border-l-2 border-l-red-600",
              t.tone === "info" && "border-l-2 border-l-gold-400",
            )}
          >
            <span className="mt-0.5 shrink-0" aria-hidden="true">
              {t.tone === "error" ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.5v.5" /></svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#37c47a" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
              )}
            </span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
