import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

const BASE_URL = process.env.BETTER_AUTH_URL!

/**
 * GET /api/ads/callback
 * Recibe el código de autorización de Google, intercambia por tokens y los guarda.
 */
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.redirect(`${BASE_URL}/ads?error=unauthorized`)
  }

  const code  = req.nextUrl.searchParams.get("code")
  const error = req.nextUrl.searchParams.get("error")

  if (error || !code) {
    return NextResponse.redirect(`${BASE_URL}/ads?error=${error ?? "no_code"}`)
  }

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id:     process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri:  `${BASE_URL}/api/ads/callback`,
      grant_type:    "authorization_code",
    }),
  })

  const tokens = await tokenRes.json()

  if (!tokens.access_token || !tokens.refresh_token) {
    console.error("Google Ads token error:", tokens)
    return NextResponse.redirect(`${BASE_URL}/ads?error=token_exchange`)
  }

  await prisma.oAuthToken.upsert({
    where:  { provider: "google-ads" },
    create: {
      provider:     "google-ads",
      accessToken:  tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt:    new Date(Date.now() + (tokens.expires_in ?? 3600) * 1000),
    },
    update: {
      accessToken:  tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt:    new Date(Date.now() + (tokens.expires_in ?? 3600) * 1000),
    },
  })

  return NextResponse.redirect(`${BASE_URL}/ads?connected=1`)
}
