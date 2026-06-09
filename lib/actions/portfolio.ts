"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

/* ─── helpers ───────────────────────────────────────────────────────────── */

function parseTags(raw: string | null): string {
  if (!raw) return "[]"
  const arr = raw.split(",").map((t) => t.trim()).filter(Boolean)
  return JSON.stringify(arr)
}

function parseServiceDate(raw: string | null): Date {
  // Input is "YYYY-MM" from <input type="month">. Anchor to mid-month UTC noon
  // to avoid timezone drift either way.
  if (!raw) return new Date()
  return new Date(`${raw}-15T12:00:00`)
}

function readFields(fd: FormData) {
  const title         = (fd.get("title")       as string).trim()
  const description   = (fd.get("description") as string).trim()
  const serviceType   = fd.get("serviceType") as string
  const city          = ((fd.get("city")        as string) ?? "").trim()
  const neighborhood  = ((fd.get("neighborhood") as string) ?? "").trim() || null
  const serviceDate   = parseServiceDate(fd.get("serviceDate") as string)
  const images        = (fd.get("images") as string) || "[]"
  const tags          = parseTags(fd.get("tags") as string)
  const published     = fd.get("published") === "true"

  // Optional review — only stored when text + author are both provided
  const reviewAuthorRaw = ((fd.get("reviewAuthor") as string) ?? "").trim()
  const reviewTextRaw   = ((fd.get("reviewText")   as string) ?? "").trim()
  const hasReview = reviewAuthorRaw.length > 0 && reviewTextRaw.length > 0

  const reviewRatingRaw = fd.get("reviewRating") as string | null
  const rating = reviewRatingRaw ? parseInt(reviewRatingRaw, 10) : 5

  const clientIdRaw        = (fd.get("clientId")        as string | null)?.trim() || null
  const serviceRecordIdRaw = (fd.get("serviceRecordId") as string | null)?.trim() || null

  return {
    title, description, serviceType, city, neighborhood, serviceDate,
    images, tags, published,
    reviewAuthor:    hasReview ? reviewAuthorRaw    : null,
    reviewText:      hasReview ? reviewTextRaw      : null,
    reviewRating:    hasReview ? Math.min(5, Math.max(1, rating)) : null,
    clientId:        clientIdRaw,
    serviceRecordId: serviceRecordIdRaw,
  }
}

/* ─── CRUD ──────────────────────────────────────────────────────────────── */

export async function createProject(formData: FormData) {
  const data = readFields(formData)
  await prisma.project.create({ data })

  revalidatePath("/portfolio")
  revalidatePath("/api/portfolio")
  redirect("/portfolio")
}

export async function updateProject(id: string, formData: FormData) {
  const data = readFields(formData)
  await prisma.project.update({
    where: { id },
    data:  { ...data, updatedAt: new Date() },
  })

  revalidatePath("/portfolio")
  revalidatePath(`/portfolio/${id}/edit`)
  revalidatePath("/api/portfolio")
  redirect("/portfolio")
}

export async function togglePublished(id: string, published: boolean) {
  await prisma.project.update({ where: { id }, data: { published } })
  revalidatePath("/portfolio")
  revalidatePath("/api/portfolio")
}

export async function deleteProject(id: string) {
  await prisma.project.delete({ where: { id } })
  revalidatePath("/portfolio")
  revalidatePath("/api/portfolio")
}
