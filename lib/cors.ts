const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean)

export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false
  return ALLOWED_ORIGINS.includes(origin)
}

export function corsHeaders(req: Request, methods: string): Record<string, string> {
  const origin = req.headers.get("origin")
  const headers: Record<string, string> = {
    "Vary": "Origin",
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  }
  if (isOriginAllowed(origin)) {
    headers["Access-Control-Allow-Origin"] = origin as string
  }
  return headers
}
