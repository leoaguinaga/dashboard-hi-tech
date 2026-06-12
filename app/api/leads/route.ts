import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { SERVICE_BY_LABEL } from "@/lib/services"
import { corsHeaders } from "@/lib/cors"
import { getClientIp, rateLimit, rateLimitHeaders } from "@/lib/rate-limit"

// 5 leads / 10 minutes per IP — leads are human-typed, anything above this is abuse.
const LEADS_LIMIT      = 5
const LEADS_WINDOW_MS  = 10 * 60 * 1000

/** Pre-flight for cross-origin requests from the landing */
export function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status:  204,
    headers: corsHeaders(req, "POST, OPTIONS"),
  })
}

/**
 * POST /api/leads
 * Body (JSON): { name, phone, email?, service, message? }
 * Returns:     { id } on success
 */
export async function POST(req: NextRequest) {
  const cors = corsHeaders(req, "POST, OPTIONS")

  const ip = getClientIp(req)
  const rl = rateLimit({
    key:      `leads:${ip}`,
    limit:    LEADS_LIMIT,
    windowMs: LEADS_WINDOW_MS,
  })
  const rlHeaders = rateLimitHeaders(rl)

  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status:  429,
        headers: {
          ...cors,
          ...rlHeaders,
          "Retry-After": String(rl.retryAfterSec),
        },
      },
    )
  }

  const responseHeaders = { ...cors, ...rlHeaders }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400, headers: responseHeaders }
    )
  }

  const name    = String(body.name    ?? "").trim()
  const phone   = String(body.phone   ?? "").trim()
  const email   = String(body.email   ?? "").trim() || null
  const service = String(body.service ?? "").trim()
  const message = String(body.message ?? "").trim() || null

  if (!name)    return NextResponse.json({ error: "name is required" },    { status: 422, headers: responseHeaders })
  if (!phone)   return NextResponse.json({ error: "phone is required" },   { status: 422, headers: responseHeaders })
  if (!service) return NextResponse.json({ error: "service is required" }, { status: 422, headers: responseHeaders })

  // Accept any known service label; fall back to raw value (future-proof)
  const knownService = SERVICE_BY_LABEL[service] ? service : service

  const lead = await prisma.lead.create({
    data: {
      name,
      phone,
      email,
      service: knownService,
      message,
      source: "landing",
    },
  })

  // Registrar el contacto en el CRM (sin promover a Cliente).
  // Si ya existe un Client con ese teléfono, solo lo vinculamos al lead.
  const existing = await prisma.client.findFirst({ where: { phone } })
  if (existing) {
    if (!existing.leadId) {
      await prisma.client.update({
        where: { id: existing.id },
        data:  { leadId: lead.id },
      })
    }
  } else {
    await prisma.client.create({
      data: {
        name,
        phone,
        email,
        source:   "landing",
        category: "CONTACT",
        leadId:   lead.id,
      },
    })
  }

  return NextResponse.json({ id: lead.id }, { status: 201, headers: responseHeaders })
}
