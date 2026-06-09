"use client"

import { useRef, useState } from "react"
import { createClient } from "@/lib/actions/crm"
import { Button }   from "@/components/ui/button"
import { Input }    from "@/components/ui/input"
import { Label }    from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

export function NewClientForm() {
  const [source, setSource] = useState("")
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!source) return
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    fd.set("source", source)
    // redirect() en el server action toma control; no se llega al finally
    await createClient(fd)
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs">Nombre completo *</Label>
          <Input id="name" name="name" required placeholder="Juan Pérez" className="h-8 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-xs">Teléfono *</Label>
          <Input id="phone" name="phone" required placeholder="+1 (809) 000-0000" className="h-8 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs">Correo electrónico</Label>
          <Input id="email" name="email" type="email" placeholder="cliente@email.com" className="h-8 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Origen *</Label>
          <Select value={source} onValueChange={(v) => setSource(v ?? "")}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="landing">Landing page</SelectItem>
              <SelectItem value="phone">Teléfono</SelectItem>
              <SelectItem value="referral">Referido</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="address" className="text-xs">Dirección</Label>
        <Input id="address" name="address" placeholder="Calle, ciudad" className="h-8 text-sm" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes" className="text-xs">Notas</Label>
        <Textarea
          id="notes" name="notes"
          placeholder="Información adicional sobre el cliente..."
          className="text-sm min-h-20 resize-none"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm" disabled={loading || !source}>
          {loading ? "Guardando..." : "Crear cliente"}
        </Button>
        <Button
          type="button" variant="outline" size="sm"
          onClick={() => window.history.back()}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
