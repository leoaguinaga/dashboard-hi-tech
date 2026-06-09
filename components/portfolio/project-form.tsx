"use client"

import { useRef, useState } from "react"
import { createProject, updateProject } from "@/lib/actions/portfolio"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { ImagePlus, X, Loader2, Upload, Star } from "lucide-react"

export type ProjectData = {
  id: string
  title: string
  description: string
  serviceType: string
  city: string
  neighborhood: string | null
  serviceDate: string | Date
  images: string[]
  tags: string[]
  reviewAuthor: string | null
  reviewRating: number | null
  reviewText: string | null
  published: boolean
  clientId: string | null
  serviceRecordId?: string | null
}

export type ClientOption = {
  id:    string
  name:  string
  phone: string
}

export type ProjectPrefill = {
  clientId?:        string
  serviceRecordId?: string
  serviceDate?:     Date | string
  city?:            string
}

const MAX_FILE_SIZE = 5 * 1024 * 1024

const SERVICE_OPTIONS = [
  "AC Services",
  "Heating Services",
  "Duct Cleaning",
  "Smart Thermostat",
  "Preventive Maintenance",
  "Emergency Support",
]

interface PendingFile {
  file: File
  preview: string
}

function toMonthInputValue(d: string | Date | undefined): string {
  if (!d) return ""
  const date = typeof d === "string" ? new Date(d) : d
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  return `${y}-${m}`
}

export function ProjectForm({
  project,
  clients = [],
  prefill,
}: {
  project?: ProjectData
  clients?: ClientOption[]
  prefill?: ProjectPrefill
}) {
  const [serviceType, setServiceType] = useState(project?.serviceType ?? "")
  const [published,   setPublished]   = useState(project?.published ?? false)
  const [clientId,    setClientId]    = useState(
    project?.clientId ?? prefill?.clientId ?? ""
  )

  const [savedImages, setSavedImages] = useState<string[]>(project?.images ?? [])
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])

  // Review toggle
  const [hasReview, setHasReview] = useState(!!project?.reviewText)
  const [reviewRating, setReviewRating] = useState<number>(project?.reviewRating ?? 5)

  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const formRef = useRef<HTMLFormElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /* ── image selection ────────────────────────────────────────── */

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setError("")
    const files = Array.from(e.target.files ?? [])

    const valid: PendingFile[] = []
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`"${file.name}" supera los 5 MB.`)
        continue
      }
      if (!file.type.startsWith("image/")) {
        setError(`"${file.name}" no es una imagen válida.`)
        continue
      }
      valid.push({ file, preview: URL.createObjectURL(file) })
    }

    setPendingFiles((prev) => [...prev, ...valid])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function removeSaved(url: string) {
    setSavedImages((prev) => prev.filter((u) => u !== url))
  }

  function removePending(index: number) {
    setPendingFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  /* ── upload pending files ───────────────────────────────────── */

  async function uploadPending(): Promise<string[]> {
    const urls: string[] = []
    for (const { file } of pendingFiles) {
      const fd = new FormData()
      fd.set("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? "Error al subir imagen")
      }
      const { url } = await res.json()
      urls.push(url)
    }
    return urls
  }

  /* ── submit ─────────────────────────────────────────────────── */

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!serviceType) { setError("Selecciona el tipo de servicio."); return }
    if (savedImages.length === 0 && pendingFiles.length === 0) {
      setError("Agrega al menos una imagen.")
      return
    }

    setError("")
    setLoading(true)

    const formEl = e.currentTarget

    try {
      setUploading(true)
      const newUrls = await uploadPending()
      setUploading(false)

      const allImages = [...savedImages, ...newUrls]
      const fd = new FormData(formEl ?? formRef.current ?? undefined)
      fd.set("images",          JSON.stringify(allImages))
      fd.set("serviceType",     serviceType)
      fd.set("published",       String(published))
      fd.set("reviewRating",    String(reviewRating))
      fd.set("clientId",        clientId)
      fd.set("serviceRecordId", project?.serviceRecordId ?? prefill?.serviceRecordId ?? "")

      // If the review toggle is off, drop those fields so the server stores null
      if (!hasReview) {
        fd.set("reviewAuthor", "")
        fd.set("reviewText", "")
      }

      if (project) {
        await updateProject(project.id, fd)
      } else {
        await createProject(fd)
      }
    } catch (err: unknown) {
      setUploading(false)
      setLoading(false)
      setError(err instanceof Error ? err.message : "Error inesperado")
    }
  }

  const totalImages = savedImages.length + pendingFiles.length
  const isSubmitting = loading || uploading

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      {error && (
        <div className="rounded-md bg-danger/10 border border-danger/20 px-3 py-2 text-xs text-danger">
          {error}
        </div>
      )}

      {/* ── Sección: información básica ── */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="title" className="text-xs">Título del proyecto *</Label>
          <Input
            id="title" name="title" required
            defaultValue={project?.title}
            placeholder="Central AC Full Replacement"
            className="h-8 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-xs">Descripción *</Label>
          <Textarea
            id="description" name="description" required
            defaultValue={project?.description}
            placeholder="Descripción visible en la landing page..."
            className="text-sm min-h-24 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Tipo de servicio *</Label>
            <Select value={serviceType} onValueChange={(v) => setServiceType(v ?? "")}>
              <SelectTrigger className="h-8 text-sm w-full" >
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-app-muted">
              Coincide con los filtros de la landing.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="serviceDate" className="text-xs">Mes del servicio *</Label>
            <Input
              id="serviceDate" name="serviceDate" type="month" required
              defaultValue={toMonthInputValue(project?.serviceDate ?? prefill?.serviceDate)}
              className="h-8 text-sm"
            />
          </div>
        </div>
      </div>

      {/* ── Sección: ubicación ── */}
      <div className="space-y-4 rounded-lg border border-border bg-bg-subtle p-4">
        <p className="text-xs font-semibold text-app-primary">Ubicación</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="city" className="text-xs">Ciudad *</Label>
            <Input
              id="city" name="city" required
              defaultValue={project?.city ?? prefill?.city}
              placeholder="Oakland"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="neighborhood" className="text-xs">Barrio (opcional)</Label>
            <Input
              id="neighborhood" name="neighborhood"
              defaultValue={project?.neighborhood ?? ""}
              placeholder="Rockridge"
              className="h-8 text-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Tags (separados por coma)</Label>
          <Input
            name="tags"
            defaultValue={project?.tags.join(", ")}
            placeholder="Residential, Carrier, Zone control"
            className="h-8 text-sm"
          />
          <p className="text-[10px] text-app-muted">Uso interno — no se muestran en la landing.</p>
        </div>
      </div>

      {/* ── Sección: cliente vinculado ── */}
      {clients.length > 0 && (
        <div className="space-y-1.5">
          <Label className="text-xs">
            Cliente vinculado
            <span className="ml-1.5 font-normal text-app-muted">(opcional)</span>
          </Label>
          <Select value={clientId} onValueChange={(v) => setClientId(v === "__none__" ? "" : (v ?? ""))}>
            <SelectTrigger className="h-8 text-sm w-full">
              <SelectValue placeholder="Sin cliente asignado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Sin cliente asignado</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} · {c.phone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[10px] text-app-muted">
            Vincula este proyecto al cliente para tener trazabilidad del flujo lead → trabajo.
          </p>
        </div>
      )}

      {/* ── Sección: imágenes ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">
            Imágenes *
            <span className="ml-1.5 text-app-muted font-normal">
              ({totalImages} seleccionada{totalImages !== 1 ? "s" : ""}) · JPG, PNG, WebP · máx 5 MB · la primera es la portada
            </span>
          </Label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-app-primary hover:bg-bg-muted transition-colors"
          >
            <ImagePlus className="h-3.5 w-3.5" />
            Agregar imágenes
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {totalImages === 0 ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-10 text-app-muted hover:border-brand-primary hover:text-brand-primary transition-colors"
          >
            <Upload className="h-8 w-8" />
            <span className="text-xs font-medium">Haz clic para seleccionar imágenes</span>
            <span className="text-[10px]">JPG · PNG · WebP · máx. 5 MB por imagen</span>
          </button>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {savedImages.map((url, i) => (
              <div key={url} className="relative group aspect-square rounded-md overflow-hidden border border-border bg-bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                {i === 0 && (
                  <div className="absolute top-1 left-1 bg-brand-primary text-white text-[9px] font-medium px-1.5 py-0.5 rounded">
                    Portada
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeSaved(url)}
                  className="absolute top-1 right-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            {pendingFiles.map(({ preview }, idx) => (
              <div key={idx} className="relative group aspect-square rounded-md overflow-hidden border-2 border-dashed border-brand-primary/40 bg-brand-light/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="" className="h-full w-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-brand-primary/80 py-0.5 text-center text-[9px] text-white font-medium">
                  Por subir
                </div>
                <button
                  type="button"
                  onClick={() => removePending(idx)}
                  className="absolute top-1 right-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex aspect-square flex-col items-center justify-center rounded-md border-2 border-dashed border-border text-app-muted hover:border-brand-primary hover:text-brand-primary transition-colors"
            >
              <ImagePlus className="h-5 w-5" />
              <span className="text-[10px] mt-1">Agregar</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Sección: reseña ── */}
      <div className="space-y-3 rounded-lg border border-border bg-bg-subtle p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-app-primary">Reseña del cliente (opcional)</p>
            <p className="text-[10px] text-app-muted">Si la activas, se muestra en la landing junto al proyecto.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={hasReview}
            onClick={() => setHasReview((v) => !v)}
            className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${hasReview ? "bg-brand-primary" : "bg-border"
              }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 translate-y-0.5 rounded-full bg-white shadow transition-transform ${hasReview ? "translate-x-4" : "translate-x-0.5"
                }`}
            />
          </button>
        </div>

        {hasReview && (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="reviewAuthor" className="text-xs">Autor *</Label>
                <Input
                  id="reviewAuthor" name="reviewAuthor"
                  defaultValue={project?.reviewAuthor ?? ""}
                  placeholder="Carlos R."
                  className="h-8 text-sm"
                  required={hasReview}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Calificación</Label>
                <div className="flex items-center gap-1 h-8">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setReviewRating(n)}
                      className="p-0.5"
                      aria-label={`${n} estrellas`}
                    >
                      <Star
                        className={`h-5 w-5 transition-colors ${n <= reviewRating
                          ? "fill-warning text-warning"
                          : "text-app-muted/40"
                          }`}
                      />
                    </button>
                  ))}
                  <span className="ml-1.5 text-xs text-app-muted">{reviewRating}/5</span>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reviewText" className="text-xs">Texto de la reseña *</Label>
              <Textarea
                id="reviewText" name="reviewText"
                defaultValue={project?.reviewText ?? ""}
                placeholder="The Hi-Tech team was in and out in one day..."
                className="text-sm min-h-20 resize-none"
                required={hasReview}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Sección: publicación ── */}
      <div className="flex items-center gap-3 rounded-md border border-border p-3 bg-bg-subtle">
        <button
          type="button"
          role="switch"
          aria-checked={published}
          onClick={() => setPublished((p) => !p)}
          className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${published ? "bg-brand-primary" : "bg-border"
            }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 translate-y-0.5 rounded-full bg-white shadow transition-transform ${published ? "translate-x-4" : "translate-x-0.5"
              }`}
          />
        </button>
        <div>
          <p className="text-xs font-medium text-app-primary">
            {published ? "Publicado" : "Borrador"}
          </p>
          <p className="text-[10px] text-app-muted">
            {published
              ? "Visible en la landing page"
              : "Solo visible en el dashboard"}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {uploading ? (
            <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Subiendo imágenes...</>
          ) : loading ? (
            <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Guardando...</>
          ) : (
            project ? "Guardar cambios" : "Crear proyecto"
          )}
        </Button>
        <Button
          type="button" variant="outline" size="sm"
          disabled={isSubmitting}
          onClick={() => window.history.back()}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
