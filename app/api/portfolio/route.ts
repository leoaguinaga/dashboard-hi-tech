import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { corsHeaders } from "@/lib/cors"
import { getClientIp, rateLimit, rateLimitHeaders } from "@/lib/rate-limit"

// 60 reads / minute per IP — generous for normal browsing, blocks scrapers.
const PORTFOLIO_LIMIT     = 60
const PORTFOLIO_WINDOW_MS = 60 * 1000

/** Pre-flight for cross-origin requests from the landing */
export function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status:  204,
    headers: corsHeaders(req, "GET, OPTIONS"),
  })
}

/**
 * GET /api/portfolio
 * Endpoint público consumido por la landing (Astro).
 *
 * Forma del proyecto en respuesta — coincide 1:1 con lo que renderiza
 * landing/src/sections/portfolio/Projects.tsx:
 *
 *   {
 *     id, title, serviceType,
 *     city, neighborhood?, date,         // "May 2025"
 *     description, cover, photos[],
 *     review?: { author, rating, text }
 *   }
 *
 * Query params:
 *   published=true  → solo proyectos publicados
 *
 * CORS restringido a la landing (ver lib/cors.ts).
 */
export async function GET(req: NextRequest) {
  const cors = corsHeaders(req, "GET, OPTIONS")

  const ip = getClientIp(req)
  const rl = rateLimit({
    key:      `portfolio:${ip}`,
    limit:    PORTFOLIO_LIMIT,
    windowMs: PORTFOLIO_WINDOW_MS,
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

  // This is a public endpoint — always return only published projects.
  // Drafts are never exposed here; the dashboard reads Prisma directly.
  const projects = await prisma.project.findMany({
    where:   { published: true },
    orderBy: [{ order: "asc" }, { serviceDate: "desc" }],
  })

  const data = projects.map((p) => {
    const photos = JSON.parse(p.images || "[]") as string[]
    const tags   = JSON.parse(p.tags   || "[]") as string[]

    const review =
      p.reviewAuthor && p.reviewText
        ? {
            author: p.reviewAuthor,
            rating: p.reviewRating ?? 5,
            text:   p.reviewText,
          }
        : undefined

    return {
      id:           p.id,
      title:        p.title,
      serviceType:  p.serviceType,
      city:         p.city,
      neighborhood: p.neighborhood ?? undefined,
      date:         format(new Date(p.serviceDate), "MMMM yyyy"),
      description:  p.description,
      cover:        photos[0] ?? "",
      photos,
      review,
      // Auxiliares (no usados por la landing actual)
      tags,
      published:    p.published,
      order:        p.order,
      createdAt:    p.createdAt,
    }
  })

  return NextResponse.json(
    { projects: data },
    {
      headers: {
        ...cors,
        ...rlHeaders,
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    },
  )
}
