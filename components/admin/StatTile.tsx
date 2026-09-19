import Link from "next/link";

export function StatTile({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="glass-light group block rounded-md px-6 py-5 transition-all hover:-translate-y-0.5 hover:shadow-lift">
      <p className="font-display text-4xl font-semibold text-navy-800 transition-colors group-hover:text-navy-600">{value}</p>
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal-600">{label}</p>
    </Link>
  );
}
