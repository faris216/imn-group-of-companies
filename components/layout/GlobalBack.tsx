"use client";
import { usePathname } from "next/navigation";
import { BackButton } from "@/components/ui/BackButton";

/** Pages that already render their own context-aware back control. */
const OWN_BACK = [/^\/projects\/[^/]+/, /^\/brightstone\/products\/[^/]+/, /^\/indon\/products\/[^/]+/];

/** Site-wide "← Back" pill: visible on every page except the homepage and
 *  detail pages that place their own button on the hero. Fixed under the
 *  header so it never scrolls away — simple and always visible. */
export function GlobalBack() {
  const pathname = usePathname();
  if (!pathname || pathname === "/" || OWN_BACK.some((r) => r.test(pathname))) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[92px] z-[70] sm:top-[96px]">
      <div className="container-wide">
        <div className="pointer-events-auto inline-block">
          <BackButton fallback="/" tone="light" label="Back" />
        </div>
      </div>
    </div>
  );
}
