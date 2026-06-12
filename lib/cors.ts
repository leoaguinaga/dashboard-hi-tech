/**
 * Allowed origins for the public API endpoints consumed by the Astro landing.
 *
 * Override via the ALLOWED_ORIGINS env var (comma-separated). The defaults
 * cover the dashboard at localhost:3000, Astro's dev server at localhost:4321,
 * and the production landing.
 */
const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:4321",
  "https://hitechhvac.com",
  "https://www.hitechhvac.com",
]

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean)

const allowList = ALLOWED_ORIGINS.length > 0 ? ALLOWED_ORIGINS : DEFAULT_ALLOWED_ORIGINS

export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false
  return allowList.includes(origin)
}

export function corsHeaders(req: Request, methods: string): Record<string, string> {
  const origin = req.headers.get("origin")
  const headers: Record<string, string> = {
    "Vary":                         "Origin",
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age":       "86400",
  }
  if (isOriginAllowed(origin)) {
    headers["Access-Control-Allow-Origin"] = origin as string
  }
  return headers
}
