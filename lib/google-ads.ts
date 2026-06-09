/**
 * lib/google-ads.ts
 * Google Ads REST API v19 — cliente con auto-refresh de token.
 */

import { prisma } from "@/lib/prisma"

const API_BASE = "https://googleads.googleapis.com/v19"

/* ─── Token management ──────────────────────────────────────────────────── */

export async function getConnection() {
  return prisma.oAuthToken.findUnique({ where: { provider: "google-ads" } })
}

export async function isConnected() {
  const token = await getConnection()
  return !!token
}

/** Returns a valid access token, refreshing if expired. */
export async function getAccessToken(): Promise<string> {
  const token = await getConnection()
  if (!token) throw new Error("Google Ads no está conectado.")

  const isExpired = new Date(token.expiresAt) <= new Date(Date.now() + 60_000)

  if (!isExpired) return token.accessToken

  // Refresh
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type:    "refresh_token",
      refresh_token: token.refreshToken,
      client_id:     process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  })

  const data = await res.json()
  if (!data.access_token) {
    throw new Error("No se pudo refrescar el token de Google Ads.")
  }

  await prisma.oAuthToken.update({
    where: { provider: "google-ads" },
    data: {
      accessToken: data.access_token,
      expiresAt:   new Date(Date.now() + (data.expires_in ?? 3600) * 1000),
    },
  })

  return data.access_token
}

/* ─── Sync ──────────────────────────────────────────────────────────────── */

export type SyncResult = {
  campaigns: number
  metrics:   number
  errors:    string[]
}

export async function syncCampaigns(days = 30): Promise<SyncResult> {
  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID?.replace(/-/g, "")
  if (!customerId) throw new Error("GOOGLE_ADS_CUSTOMER_ID no configurado.")

  const devToken    = process.env.GOOGLE_ADS_DEVELOPER_TOKEN
  if (!devToken)    throw new Error("GOOGLE_ADS_DEVELOPER_TOKEN no configurado.")

  const accessToken = await getAccessToken()

  const query = `
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      segments.date
    FROM campaign
    WHERE segments.date DURING LAST_${days}_DAYS
    ORDER BY segments.date DESC
    LIMIT 10000
  `

  const res = await fetch(`${API_BASE}/customers/${customerId}/googleAds:search`, {
    method: "POST",
    headers: {
      Authorization:     `Bearer ${accessToken}`,
      "developer-token": devToken,
      "Content-Type":    "application/json",
    },
    body: JSON.stringify({ query }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error?.message ?? `Error API ${res.status}`)
  }

  const { results = [] } = await res.json()
  const errors: string[]  = []
  let campaignCount = 0
  let metricCount   = 0

  for (const row of results) {
    try {
      const camp = await prisma.adCampaign.upsert({
        where:  { googleCampaignId: String(row.campaign.id) },
        create: { googleCampaignId: String(row.campaign.id), name: row.campaign.name, status: row.campaign.status },
        update: { name: row.campaign.name, status: row.campaign.status, updatedAt: new Date() },
      })
      campaignCount++

      const date = new Date(row.segments.date + "T12:00:00")
      await prisma.adMetric.upsert({
        where:  { campaignId_date: { campaignId: camp.id, date } },
        create: {
          campaignId:  camp.id,
          date,
          impressions: Number(row.metrics.impressions  ?? 0),
          clicks:      Number(row.metrics.clicks       ?? 0),
          costMicros:  Number(row.metrics.costMicros   ?? 0),
          conversions: Number(row.metrics.conversions  ?? 0),
        },
        update: {
          impressions: Number(row.metrics.impressions  ?? 0),
          clicks:      Number(row.metrics.clicks       ?? 0),
          costMicros:  Number(row.metrics.costMicros   ?? 0),
          conversions: Number(row.metrics.conversions  ?? 0),
        },
      })
      metricCount++
    } catch (e: unknown) {
      errors.push(e instanceof Error ? e.message : String(e))
    }
  }

  return { campaigns: campaignCount, metrics: metricCount, errors }
}
