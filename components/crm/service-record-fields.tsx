"use client"

import { Input }    from "@/components/ui/input"
import { Label }    from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

export interface ServiceRecordDefaults {
  type?: string
  status?: string
  paymentStatus?: string
  serviceDate?: string
  equipmentBrand?: string | null
  equipmentModel?: string | null
  amount?: number | null
  followUpDays?: number
  notes?: string | null
}

interface Props {
  type: string
  setType: (v: string) => void
  status: string
  setStatus: (v: string) => void
  payment: string
  setPayment: (v: string) => void
  defaults?: ServiceRecordDefaults
  /** En modo edición el aviso preventivo ya existe y no se recalcula. */
  showFollowUp?: boolean
}

/** Campos compartidos entre el diálogo de crear y editar servicio. */
export function ServiceRecordFields({
  type, setType, status, setStatus, payment, setPayment, defaults, showFollowUp = true,
}: Props) {
  const today = new Date().toISOString().split("T")[0]

  return (
    <>
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
          defaultValue={defaults?.serviceDate ?? today} required className="h-8 text-sm"
        />
      </div>

      {/* Equipo */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor="equipmentBrand" className="text-xs">Marca</Label>
          <Input id="equipmentBrand" name="equipmentBrand" defaultValue={defaults?.equipmentBrand ?? ""} placeholder="Carrier" className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="equipmentModel" className="text-xs">Modelo</Label>
          <Input id="equipmentModel" name="equipmentModel" defaultValue={defaults?.equipmentModel ?? ""} placeholder="38CKC024" className="h-8 text-sm" />
        </div>
      </div>

      {/* Costo + Cobro */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor="amount" className="text-xs">Costo (USD)</Label>
          <Input
            id="amount" name="amount" type="number"
            min={0} step={0.01} placeholder="0.00" defaultValue={defaults?.amount ?? ""} className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Cobro</Label>
          <Select value={payment} onValueChange={(v) => setPayment(v ?? "PAID")}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PAID">Cobrado</SelectItem>
              <SelectItem value="PENDING">Pendiente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Aviso preventivo (solo al crear) */}
      {showFollowUp && (
        <div className="space-y-1">
          <Label htmlFor="followUpDays" className="text-xs">Aviso preventivo (días)</Label>
          <Input
            id="followUpDays" name="followUpDays" type="number"
            defaultValue={defaults?.followUpDays ?? 180} min={1} max={3650} className="h-8 text-sm"
          />
        </div>
      )}

      {/* Notas */}
      <div className="space-y-1">
        <Label htmlFor="notes" className="text-xs">Notas del técnico</Label>
        <Textarea
          id="notes" name="notes" defaultValue={defaults?.notes ?? ""}
          placeholder="Observaciones, estado del equipo..."
          className="text-sm min-h-16 resize-none"
        />
      </div>
    </>
  )
}
