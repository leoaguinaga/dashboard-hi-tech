import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"

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
 * CORS habilitado para que la landing pueda consumirlo desde otro dominio.
 */
export async function GET(_req: NextRequest) {
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
        "Access-Control-Allow-Origin":  "*",
        "Access-Control-Allow-Methods": "GET",
        "Cache-Control":                "public, s-maxage=60, stale-while-revalidate=300",
      },
    },
  )
}
