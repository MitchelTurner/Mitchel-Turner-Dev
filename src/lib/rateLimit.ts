/**
 * Best-effort in-memory sliding window. A single Node process shares one map;
 * it resets on restart and does not coordinate across multiple instances.
 * Pair a per-client limit with a global limit so a spoofed forwarding header
 * cannot multiply the budget without bound.
 */

const buckets = new Map<string, number[]>();
const MAX_KEYS = 4000;

/** True when this key has already used its allowance in the window. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((timestamp) => now - timestamp < windowMs);
  const limited = recent.length >= limit;
  if (!limited) recent.push(now);
  buckets.set(key, recent);

  if (buckets.size > MAX_KEYS) {
    const oldest = buckets.keys().next().value;
    if (oldest !== undefined) buckets.delete(oldest);
  }

  return limited;
}

/**
 * Client address for rate-limit keys.
 * Uses the left-most X-Forwarded-For hop (the original client on typical
 * reverse proxies) and a process-wide ceiling in the callers for spoofing.
 */
export function clientAddress(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 80);
  }
  const real = headers.get("x-real-ip")?.trim();
  return real ? real.slice(0, 80) : "unknown";
}
