/**
 * lib/r2.ts
 *
 * Upload utility con doble modo:
 *  - DEV / sin credenciales: guarda en public/uploads/ y devuelve URL relativa.
 *  - PROD / con credenciales R2: sube a Cloudflare R2 y devuelve URL pública.
 */

import { randomUUID } from "crypto"

const hasR2 = !!(
  process.env.R2_ACCOUNT_ID &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_BUCKET_NAME &&
  process.env.R2_PUBLIC_URL
)

export async function uploadFile(
  buffer: Buffer,
  originalName: string,
  contentType: string,
): Promise<string> {
  const ext = originalName.split(".").pop()?.toLowerCase() ?? "jpg"
  const key = `portfolio/${randomUUID()}.${ext}`

  if (hasR2) {
    // ── R2 path ──────────────────────────────────────────────────────────
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3")

    const client = new S3Client({
      region:   "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId:     process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    })

    await client.send(
      new PutObjectCommand({
        Bucket:      process.env.R2_BUCKET_NAME!,
        Key:         key,
        Body:        buffer,
        ContentType: contentType,
      }),
    )

    return `${process.env.R2_PUBLIC_URL}/${key}`
  }

  // ── Local fallback ────────────────────────────────────────────────────
  const { writeFile, mkdir } = await import("fs/promises")
  const { join } = await import("path")

  const uploadsDir = join(process.cwd(), "public", "uploads")
  await mkdir(uploadsDir, { recursive: true })

  const filename = key.replace("portfolio/", "")
  await writeFile(join(uploadsDir, filename), buffer)

  return `/uploads/${filename}`
}
