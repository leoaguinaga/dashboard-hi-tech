"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { createServiceRecord } from "@/lib/actions/crm"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Button }   from "@/components/ui/button"
import { Input }    from "@/components/ui/input"
import { Label }    from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"

export function AddServiceRecordDialog({ clientId }: { clientId: string }) {
  const [open,    setOpen]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [type,    setType]    = useState("")
  const [status,  setStatus]  = useState("COMPLETED")
  const formRef               = useRef<HTMLFormElement>(null)
  const router                = useRouter()

  const today = new Date().toISOString().split("T")[0]

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!type) return
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    fd.set("clientId", clientId)
    fd.set("type",     type)
    fd.set("status",   status)
    try {
      await createServiceRecord(fd)
      setOpen(false)
      formRef.current?.reset()
      setType("")
      setStatus("COMPLETED")
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <Plus className="h-3.5 w-3.5 mr-1.5" />
        Agregar servicio
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Registrar servicio</DialogTitle>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-3 pt-1">
          {/* Tipo + Estado */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Tipo *</Label>
              <Select value={type} onValueChange={(v) => setType(v ?? "")} required>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INSTALLATION">Instalación</SelectItem>
                  <SelectItem value="MAINTENANCE">Mantenimiento</SelectItem>
                  <SelectItem value="REPAIR">Reparación</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Estado</Label>
              <Select value={status} onValueChange={(v) => setStatus(v ?? "COMPLETED")}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pendiente</SelectItem>
                  <SelectItem value="IN_PROGRESS">En progreso</SelectItem>
                  <SelectItem value="COMPLETED">Completado</SelectItem>
                  <SelectItem value="CANCELLED">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fecha */}
          <div className="space-y-1">
            <Label htmlFor="serviceDate" className="text-xs">Fecha del servicio *</Label>
            <Input
              id="serviceDate" name="serviceDate" type="date"
              defaultValue={today} required className="h-8 text-sm"
            />
          </div>

          {/* Equipo */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="equipmentBrand" className="text-xs">Marca</Label>
              <Input id="equipmentBrand" name="equipmentBrand" placeholder="Carrier" className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="equipmentModel" className="text-xs">Modelo</Label>
              <Input id="equipmentModel" name="equipmentModel" placeholder="38CKC024" className="h-8 text-sm" />
            </div>
          </div>

          {/* Costo + Follow-up */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="amount" className="text-xs">Costo (USD)</Label>
              <Input
                id="amount" name="amount" type="number"
                min={0} step={0.01} placeholder="0.00" className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="followUpDays" className="text-xs">Aviso preventivo (días)</Label>
              <Input
                id="followUpDays" name="followUpDays" type="number"
                defaultValue={180} min={1} max={3650} className="h-8 text-sm"
              />
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-1">
            <Label htmlFor="notes" className="text-xs">Notas del técnico</Label>
            <Textarea
              id="notes" name="notes"
              placeholder="Observaciones, estado del equipo..."
              className="text-sm min-h-16 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={loading || !type}>
              {loading ? "Guardando..." : "Registrar servicio"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
