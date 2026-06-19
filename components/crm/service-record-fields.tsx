"use client"

import { Input }    from "@/components/ui/input"
import { Label }    from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

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
  scheduledTime?: string | null
  address?: string | null
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
  const [date, setDate] = useState<Date | undefined>(() => {
    if (defaults?.serviceDate) {
      // Parse YYYY-MM-DD as local date to avoid timezone offset shifts
      const [year, month, day] = defaults.serviceDate.split("-").map(Number)
      return new Date(year, month - 1, day)
    }
    return new Date()
  })

  const [hour, setHour] = useState(() => {
    if (defaults?.scheduledTime) {
      return defaults.scheduledTime.split(":")[0]
    }
    return "12"
  })

  const [minute, setMinute] = useState(() => {
    if (defaults?.scheduledTime) {
      return defaults.scheduledTime.split(":")[1]
    }
    return "00"
  })

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

      {/* Fecha + Hora */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1 flex flex-col justify-end">
          <Label className="text-xs mb-1">Fecha del servicio *</Label>
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full h-8 justify-start text-left font-normal text-xs px-2.5 bg-bg-subtle border-border focus:bg-bg-base",
                    !date && "text-app-muted"
                  )}
                />
              }
            >
              <CalendarIcon className="mr-1.5 h-3.5 w-3.5 text-app-muted" />
              {date ? format(date, "PPP", { locale: es }) : <span>Seleccionar...</span>}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50 bg-bg-base border border-border" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                locale={es}
              />
            </PopoverContent>
          </Popover>
          <input type="hidden" name="serviceDate" value={date ? format(date, "yyyy-MM-dd") : ""} />
        </div>

        <div className="space-y-1 flex flex-col justify-end">
          <Label className="text-xs mb-1">Hora (Cita)</Label>
          <div className="flex items-center gap-1">
            <Select value={hour} onValueChange={(val) => setHour(val ?? "12")}>
              <SelectTrigger className="h-8 text-xs flex-1 bg-bg-subtle border-border">
                <SelectValue placeholder="HH" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }).map((_, i) => {
                  const h = String(i).padStart(2, "0")
                  return <SelectItem key={h} value={h}>{h}</SelectItem>
                })}
              </SelectContent>
            </Select>
            <span className="text-xs font-semibold text-app-muted">:</span>
            <Select value={minute} onValueChange={(val) => setMinute(val ?? "00")}>
              <SelectTrigger className="h-8 text-xs flex-1 bg-bg-subtle border-border">
                <SelectValue placeholder="MM" />
              </SelectTrigger>
              <SelectContent>
                {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <input type="hidden" name="scheduledTime" value={`${hour}:${minute}`} />
        </div>
      </div>

      {/* Dirección */}
      <div className="space-y-1">
        <Label htmlFor="address" className="text-xs">Dirección del servicio</Label>
        <Input
          id="address" name="address"
          defaultValue={defaults?.address ?? ""}
          placeholder="Ej: Av. Principal 123 (vacío para usar dirección del cliente)"
          className="h-8 text-sm"
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
