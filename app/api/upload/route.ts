import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { uploadFile } from "@/lib/r2"

const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES  = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

export async function POST(req: NextRequest) {
  // Auth — solo ADMIN puede subir imágenes
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session)                        return NextResponse.json({ error: "No autenticado" },    { status: 401 })
  if (session.user.role !== "ADMIN")   return NextResponse.json({ error: "Sin permisos" },      { status: 403 })

  const formData = await req.formData()
  const file = formData.get("file") as File | null

  if (!file)                           return NextResponse.json({ error: "Sin archivo" },       { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type))
                                       return NextResponse.json({ error: "Formato no válido. Usa JPG, PNG o WebP." }, { status: 400 })
  if (file.size > MAX_SIZE_BYTES)      return NextResponse.json({ error: "Imagen muy grande. Máximo 5 MB." }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const url    = await uploadFile(buffer, file.name, file.type)

  return NextResponse.json({ url })
}
