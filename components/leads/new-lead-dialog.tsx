"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createLeadManual } from "@/lib/actions/leads"
import { SERVICE_LABELS } from "@/lib/services"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Plus, X } from "lucide-react"

export function NewLeadDialog() {
  const [open, setOpen] = useState(false)
  const [service, setService] = useState("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set("service", service)

    startTransition(async () => {
      await createLeadManual(fd)
      setOpen(false)
      setService("")
      router.refresh()
    })
  }

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-3.5 w-3.5 mr-1.5" />
        Agregar lead
      </Button>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={() => setOpen(false)}
      />

      {/* Dialog */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md rounded-xl border border-border bg-bg-base shadow-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Nuevo lead manual</h2>
          <button onClick={() => setOpen(false)} className="text-app-muted hover:text-app-primary">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="lead-name" className="text-xs">Nombre *</Label>
              <Input id="lead-name" name="name" required className="h-8 text-sm" placeholder="John Smith" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lead-phone" className="text-xs">Teléfono *</Label>
              <Input id="lead-phone" name="phone" required className="h-8 text-sm" placeholder="(415) 555-0100" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="lead-email" className="text-xs">Email</Label>
              <Input id="lead-email" name="email" type="email" className="h-8 text-sm" placeholder="you@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lead-city" className="text-xs">Ciudad</Label>
              <Input id="lead-city" name="city" className="h-8 text-sm" placeholder="Miami" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Servicio *</Label>
            <Select value={service} onValueChange={(v) => setService(v ?? "")} required>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Seleccionar servicio..." />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_LABELS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lead-message" className="text-xs">Mensaje</Label>
            <Textarea id="lead-message" name="message" className="text-sm min-h-16 resize-none" placeholder="Notas sobre el lead..." />
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="submit" size="sm" disabled={isPending || !service}>
              {isPending ? "Guardando..." : "Crear lead"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
