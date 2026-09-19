import Link from "next/link";
import type { ReactNode, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "gold" | "red" | "dark" | "outline" | "ghost" | "whatsapp";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-all duration-300 rounded-sm select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-navy-700 text-ivory-50 hover:bg-navy-600 shadow-soft hover:shadow-lift",
  gold: "bg-gold-500 text-navy-900 hover:bg-gold-400 shadow-soft hover:shadow-lift",
  red: "bg-red-700 text-white hover:bg-red-600 shadow-soft hover:shadow-lift",
  dark: "bg-charcoal-900 text-ivory-50 hover:bg-charcoal-800 shadow-soft",
  outline: "border border-navy-700/30 text-navy-700 hover:border-navy-700 hover:bg-navy-700/5",
  ghost: "text-navy-700 hover:bg-navy-700/5",
  whatsapp: "bg-[#128C4B] text-white hover:bg-[#0f7a41] shadow-soft hover:shadow-lift",
};
const sizes: Record<Size, string> = {
  sm: "text-xs px-3.5 py-2",
  md: "text-sm px-5 py-2.5",
  lg: "text-base px-7 py-3.5",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant; size?: Size; href?: string; external?: boolean; children: ReactNode;
}

export function Button({ variant = "primary", size = "md", href, external, className, children, ...rest }: Props) {
  const cls = cn(base, variants[variant], sizes[size], className);
  if (href) {
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
