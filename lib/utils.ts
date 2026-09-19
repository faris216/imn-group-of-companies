import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** "70104 44471" | "+91 70104 44471" -> "917010444471" (wa.me needs country code, digits only) */
export function whatsappDigits(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`; // India default until client supplies other codes
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return digits;
}

export function formatINR(value: number | null | undefined): string {
  if (value === null || value === undefined) return "Price on request";
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export function uid(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function parseCoordsFromMapsUrl(url: string): string | null {
  const m = url.match(/@(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/);
  return m ? `${m[1]},${m[2]}` : null;
}

/** Embeddable Google Maps iframe src derived from stored maps_url or address. */
export function mapsEmbedUrl(mapsUrl: string | null, address: string | null): string | null {
  const coords = mapsUrl ? parseCoordsFromMapsUrl(mapsUrl) : null;
  const q = coords ?? (address ? address : null);
  if (!q) return null;
  return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=16&output=embed`;
}

export function directionsUrl(mapsUrl: string | null, address: string | null): string | null {
  if (mapsUrl) return mapsUrl;
  const coords = address ? null : null;
  void coords;
  return address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : null;
}
