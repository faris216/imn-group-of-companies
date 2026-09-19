import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} aria-hidden="true" />;
}

export function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[4/5] w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/3" />
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-sm border border-dashed border-charcoal-800/20 bg-ivory-100/60 px-8 py-16 text-center">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="mb-4 text-charcoal-600/50" aria-hidden="true">
        <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" /><path d="M3 8l9 5 9-5" /><path d="M12 13v8" />
      </svg>
      <h3 className="font-display text-xl text-charcoal-800">{title}</h3>
      {body ? <p className="mt-2 max-w-md text-sm text-charcoal-600">{body}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", body, action }: { title?: string; body?: string; action?: ReactNode }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center rounded-sm border border-red-700/25 bg-red-700/5 px-8 py-16 text-center">
      <h3 className="font-display text-xl text-charcoal-800">{title}</h3>
      {body ? <p className="mt-2 max-w-md text-sm text-charcoal-600">{body}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
