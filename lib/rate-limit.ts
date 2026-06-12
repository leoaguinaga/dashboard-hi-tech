/**
 * In-memory fixed-window rate limiter, keyed per identifier (typically IP +
 * route). Lightweight protection against bursty/abusive clients on the public
 * landing-facing endpoints.
 *
 * Note: this state lives in the Node process. Behind multiple replicas the
 * effective limit is per-replica. For the current single-node hosting this is
 * enough; swap for Redis/Upstash if we horizontally scale.
 */

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()
const MAX_ENTRIES = 10_000

function prune(now: number) {
  if (buckets.size < MAX_ENTRIES) return
  for (const [k, v] of buckets) {
    if (v.resetAt <= now) buckets.delete(k)
  }
}

export type RateLimitResult = {
  ok: boolean
  limit: number
  remaining: number
  resetAt: number
  retryAfterSec: number
}

export function rateLimit(opts: {
  key: string
  limit: number
  windowMs: number
}): RateLimitResult {
  const now = Date.now()
  const b = buckets.get(opts.key)

  if (!b || b.resetAt <= now) {
    prune(now)
    const resetAt = now + opts.windowMs
    buckets.set(opts.key, { count: 1, resetAt })
    return {
      ok:            true,
      limit:         opts.limit,
      remaining:     opts.limit - 1,
      resetAt,
      retryAfterSec: Math.ceil(opts.windowMs / 1000),
    }
  }

  if (b.count >= opts.limit) {
    return {
      ok:            false,
      limit:         opts.limit,
      remaining:     0,
      resetAt:       b.resetAt,
      retryAfterSec: Math.max(1, Math.ceil((b.resetAt - now) / 1000)),
    }
  }

  b.count += 1
  return {
    ok:            true,
    limit:         opts.limit,
    remaining:     opts.limit - b.count,
    resetAt:       b.resetAt,
    retryAfterSec: Math.max(1, Math.ceil((b.resetAt - now) / 1000)),
  }
}

export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for")
  if (fwd) return fwd.split(",")[0]!.trim()
  return req.headers.get("x-real-ip") ?? "unknown"
}

export function rateLimitHeaders(r: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit":     String(r.limit),
    "X-RateLimit-Remaining": String(r.remaining),
    "X-RateLimit-Reset":     String(Math.floor(r.resetAt / 1000)),
  }
}
