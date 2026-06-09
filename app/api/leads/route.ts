import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { SERVICE_BY_LABEL } from "@/lib/services"

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

/** Pre-flight for cross-origin requests from the landing */
export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

/**
 * POST /api/leads
 * Body (JSON): { name, phone, email?, service, message? }
 * Returns:     { id } on success
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400, headers: CORS }
    )
  }

  const name    = String(body.name    ?? "").trim()
  const phone   = String(body.phone   ?? "").trim()
  const email   = String(body.email   ?? "").trim() || null
  const service = String(body.service ?? "").trim()
  const message = String(body.message ?? "").trim() || null

  if (!name)    return NextResponse.json({ error: "name is required" },    { status: 422, headers: CORS })
  if (!phone)   return NextResponse.json({ error: "phone is required" },   { status: 422, headers: CORS })
  if (!service) return NextResponse.json({ error: "service is required" }, { status: 422, headers: CORS })

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

  return NextResponse.json({ id: lead.id }, { status: 201, headers: CORS })
}
