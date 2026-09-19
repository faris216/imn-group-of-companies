import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The authoritative IMN logo — supplied artwork, never redrawn or recolored.
 * Only responsive sizing is applied (spec Rule 1).
 */
export function ImnLogo({ width = 132, className, priority }: { width?: number; className?: string; priority?: boolean }) {
  const h = Math.round((width * 112) / 277);
  return (
    <Image
      src="/assets/brand/imn-logo.png"
      alt="IMN Group of Companies"
      width={277}
      height={112}
      style={{ width, height: h }}
      priority={priority}
      className={cn("h-auto w-auto", className)}
    />
  );
}
