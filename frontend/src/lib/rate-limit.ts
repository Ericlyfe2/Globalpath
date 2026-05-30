// In-memory sliding-window rate limiter for Next route handlers that call paid
// AI services. Protects against unauthenticated cost-drain / abuse.
//
// Scope: single-instance only (`next start`). Each server instance keeps its own
// counters, so behind a multi-instance deployment this under-counts — back it
// with Redis (INCR + EXPIRE) if you scale horizontally.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Returns ok=false once `limit` hits occur inside `windowMs` for a given key.
 * retryAfter is seconds until the window resets (for the Retry-After header).
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; retryAfter: number } {
  const now = Date.now();

  // Opportunistic prune so the map can't grow without bound under churn.
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) if (now >= b.resetAt) buckets.delete(k);
  }

  const b = buckets.get(key);
  if (!b || now >= b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  if (b.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((b.resetAt - now) / 1000) };
  }
  b.count++;
  return { ok: true, retryAfter: 0 };
}

/** Best-effort client IP from proxy headers; falls back to a shared bucket. */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/** 429 JSON response with a Retry-After header. */
export function tooMany(retryAfter: number): Response {
  return Response.json(
    { error: "Rate limit exceeded. Slow down and try again shortly." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}
