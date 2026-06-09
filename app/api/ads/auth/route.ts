import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

/**
 * GET /api/ads/auth
 * Inicia el flujo OAuth2 con Google Ads.
 * Solo ADMIN puede conectar una cuenta.
 */
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session)                      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Sin permisos" },   { status: 403 })

  const clientId     = process.env.GOOGLE_CLIENT_ID
  const redirectUri  = `${process.env.BETTER_AUTH_URL}/api/ads/callback`

  if (!clientId) {
    return NextResponse.redirect(new URL("/ads?error=missing_credentials", process.env.BETTER_AUTH_URL!))
  }

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: "code",
    scope:         "https://www.googleapis.com/auth/adwords",
    access_type:   "offline",
    prompt:        "consent",
  })

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  )
}
