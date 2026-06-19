"use client"

import React from "react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { PaymentStatusToggle } from "@/components/crm/payment-status-toggle"
import { ReminderActions } from "@/components/crm/reminder-actions"
import { ServiceRecordActions } from "@/components/crm/service-record-actions"
import { Wrench, Bell, Plus, Phone, MapPin, User, FileText, Clock } from "lucide-react"

// Types matching page query
interface ClientInfo {
  id: string
  name: string
  phone: string
  city?: string | null
  address?: string | null
}

interface ServiceRecordItem {
  id: string
  clientId: string
  type: string
  status: string
  serviceDate: Date | string
  equipmentBrand: string | null
  equipmentModel: string | null
  notes: string | null
  amount: number | null
  paymentStatus: string
  client: ClientInfo
  scheduledTime?: string | null
  address?: string | null
}

interface ReminderItem {
  id: string
  clientId: string
  serviceRecordId: string | null
  dueDate: Date | string
  message: string
  status: string
  client: ClientInfo
  serviceRecord?: {
    type: string
    equipmentBrand: string | null
    equipmentModel: string | null
  } | null
}

interface Props {
  selectedDate: string // YYYY-MM-DD
  services: ServiceRecordItem[]
  reminders: ReminderItem[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateActivity: () => void
}

const TYPE_LABELS: Record<string, string> = {
  INSTALLATION: "Instalación",
  MAINTENANCE: "Mantenimiento",
  REPAIR: "Reparación",
}

const TYPE_BADGES: Record<string, string> = {
  INSTALLATION: "bg-brand-light text-brand-primary border-brand-primary/10",
  MAINTENANCE: "bg-violet-50 text-violet-700 border-violet-200",
  REPAIR: "bg-orange-50 text-orange-700 border-orange-200",
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  IN_PROGRESS: "En progreso",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
}

const STATUS_BADGES: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-success/10 text-success border-success/20",
  CANCELLED: "bg-danger/10 text-danger border-danger/20",
}

const REMINDER_STATUS_BADGES: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  DONE: "bg-success/10 text-success border-success/20",
  DISMISSED: "bg-bg-muted text-app-muted border-border",
}

const REMINDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  DONE: "Completado",
  DISMISSED: "Descartado",
}

export function DayDetailSheet({
  selectedDate,
  services,
  reminders,
  open,
  onOpenChange,
  onCreateActivity,
}: Props) {
  let formattedTitle = ""
  try {
    if (selectedDate) {
      // Parse YYYY-MM-DD as local date to prevent offset shifts
      const [year, month, day] = selectedDate.split("-").map(Number)
      const dateObj = new Date(year, month - 1, day)
      formattedTitle = format(dateObj, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es })
      // Capitalize first letter of day
      formattedTitle = formattedTitle.charAt(0).toUpperCase() + formattedTitle.slice(1)
    }
  } catch {
    formattedTitle = selectedDate
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[90vw] sm:max-w-md flex flex-col h-full bg-bg-base border-l border-border p-0 shadow-lg">
        {/* Header */}
        <SheetHeader className="p-4 border-b border-border bg-bg-subtle flex flex-col gap-1.5">
          <p className="text-[10px] uppercase font-bold tracking-wider text-brand-primary">Detalle del día</p>
          <SheetTitle className="text-sm font-semibold text-app-primary">{formattedTitle}</SheetTitle>
          <div className="flex items-center gap-1.5 mt-2">
            <Button
              size="sm"
              onClick={onCreateActivity}
              className="h-7 text-xs font-medium bg-brand-primary hover:bg-brand-dark text-white px-2.5 rounded-md"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Agendar actividad
            </Button>
          </div>
        </SheetHeader>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Services Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 pb-1 border-b border-border">
              <Wrench className="h-4 w-4 text-brand-primary" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-app-primary">
                Servicios ({services.length})
              </h3>
            </div>

            {services.length === 0 ? (
              <p className="text-xs text-app-muted/80 italic py-2">No hay servicios registrados para este día.</p>
            ) : (
              <div className="space-y-3">
                {services.map((sr) => (
                  <div
                    key={sr.id}
                    className="border border-border rounded-lg bg-bg-subtle hover:bg-bg-base transition-colors p-3 space-y-2.5 relative group"
                  >
                    {/* Floating edit/delete actions */}
                    <div className="absolute top-2 right-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      <ServiceRecordActions
                        record={{
                          id: sr.id,
                          type: sr.type,
                          status: sr.status,
                          paymentStatus: sr.paymentStatus,
                          serviceDate: sr.serviceDate,
                          equipmentBrand: sr.equipmentBrand,
                          equipmentModel: sr.equipmentModel,
                          amount: sr.amount,
                          notes: sr.notes,
                          scheduledTime: sr.scheduledTime,
                          address: sr.address,
                        }}
                      />
                    </div>

                    {/* Client info */}
                    <div className="space-y-0.5 pr-12">
                      <Link
                        href={`/crm/clientes/${sr.client.id}`}
                        onClick={() => onOpenChange(false)}
                        className="text-xs font-semibold text-app-primary hover:text-brand-primary flex items-center gap-1"
                      >
                        <User className="h-3 w-3 shrink-0 text-app-muted" />
                        {sr.client.name}
                      </Link>
                      <div className="flex flex-wrap gap-x-2 text-[10px] text-app-muted">
                        <span className="flex items-center gap-0.5">
                          <Phone className="h-2.5 w-2.5" />
                          {sr.client.phone}
                        </span>
                        {sr.client.city && (
                          <span className="flex items-center gap-0.5">
                            <MapPin className="h-2.5 w-2.5" />
                            {sr.client.city}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Service Type & Status Badges */}
                    <div className="flex flex-wrap gap-1.5">
                      <span className={`inline-flex items-center border rounded px-1.5 py-0.5 text-[10px] font-medium ${TYPE_BADGES[sr.type] || "bg-bg-muted text-app-muted"}`}>
                        {TYPE_LABELS[sr.type] || sr.type}
                      </span>
                      <span className={`inline-flex items-center border rounded px-1.5 py-0.5 text-[10px] font-medium ${STATUS_BADGES[sr.status] || "bg-bg-muted text-app-muted"}`}>
                        {STATUS_LABELS[sr.status] || sr.status}
                      </span>
                    </div>

                    {/* Lugar y Hora del Servicio */}
                    <div className="text-[11px] space-y-1 bg-bg-base border border-border p-2 rounded-md">
                      <div className="flex items-center gap-1.5 text-app-primary">
                        <Clock className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                        <span className="font-semibold">{sr.scheduledTime || "Hora no programada"}</span>
                      </div>
                      <div className="flex items-start gap-1.5 text-app-muted">
                        <MapPin className="h-3.5 w-3.5 text-brand-primary shrink-0 mt-0.5" />
                        <span className="truncate">{sr.address || sr.client.address || "Dirección no especificada"}</span>
                      </div>
                    </div>

                    {/* Equipment Details */}
                    {(sr.equipmentBrand || sr.equipmentModel) && (
                      <div className="text-[11px] text-app-primary bg-bg-muted/50 p-1.5 rounded-sm">
                        <span className="font-medium text-app-muted mr-1">Equipo:</span>
                        {[sr.equipmentBrand, sr.equipmentModel].filter(Boolean).join(" ")}
                      </div>
                    )}

                    {/* Notes if any */}
                    {sr.notes && (
                      <div className="text-[10px] text-app-muted bg-yellow-50/20 border border-yellow-100/30 p-2 rounded-md flex gap-1 items-start">
                        <FileText className="h-3 w-3 mt-0.5 shrink-0 text-amber-600" />
                        <span className="italic line-clamp-3">{sr.notes}</span>
                      </div>
                    )}

                    {/* Payment & Amount */}
                    <div className="flex items-center justify-between border-t border-border/60 pt-2 text-xs">
                      <span className="font-semibold text-app-primary">
                        {sr.amount != null ? `$${sr.amount.toLocaleString("en-US", { minimumFractionDigits: 0 })}` : "—"}
                      </span>
                      {sr.amount != null ? (
                        <PaymentStatusToggle id={sr.id} paymentStatus={sr.paymentStatus} />
                      ) : (
                        <span className="text-[10px] text-app-muted">Sin costo</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reminders Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-1.5 pb-1 border-b border-border">
              <Bell className="h-4 w-4 text-brand-primary" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-app-primary">
                Seguimientos ({reminders.length})
              </h3>
            </div>

            {reminders.length === 0 ? (
              <p className="text-xs text-app-muted/80 italic py-2">No hay seguimientos registrados para este día.</p>
            ) : (
              <div className="space-y-3">
                {reminders.map((rem) => (
                  <div
                    key={rem.id}
                    className="border border-border rounded-lg bg-bg-subtle hover:bg-bg-base transition-colors p-3 space-y-2.5 relative"
                  >
                    {/* Action buttons (Listo, Posponer, Descartar) */}
                    <div className="absolute top-2.5 right-2.5">
                      <ReminderActions id={rem.id} status={rem.status} />
                    </div>

                    {/* Client info */}
                    <div className="space-y-0.5 pr-20">
                      <Link
                        href={`/crm/clientes/${rem.client.id}`}
                        onClick={() => onOpenChange(false)}
                        className="text-xs font-semibold text-app-primary hover:text-brand-primary flex items-center gap-1"
                      >
                        <User className="h-3 w-3 shrink-0 text-app-muted" />
                        {rem.client.name}
                      </Link>
                      <p className="text-[10px] text-app-muted flex items-center gap-0.5">
                        <Phone className="h-2.5 w-2.5" />
                        {rem.client.phone}
                      </p>
                    </div>

                    {/* Message / Task */}
                    <div className="text-xs text-app-primary font-medium bg-bg-base border border-border p-2 rounded-md">
                      {rem.message}
                    </div>

                    {/* Status Badge & info */}
                    <div className="flex items-center justify-between pt-1">
                      <span className={`inline-flex items-center border rounded px-1.5 py-0.5 text-[9px] font-semibold ${REMINDER_STATUS_BADGES[rem.status] || "bg-bg-muted text-app-muted"}`}>
                        {REMINDER_STATUS_LABELS[rem.status] || rem.status}
                      </span>

                      {rem.serviceRecord && (
                        <span className="text-[9px] text-app-muted">
                          Origen: {TYPE_LABELS[rem.serviceRecord.type] || rem.serviceRecord.type}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
