/** Tiny in-memory token bucket (per process) for login & contact form. */
const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, perMinute: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + 60_000 });
    return true;
  }
  if (b.count >= perMinute) return false;
  b.count += 1;
  return true;
}
