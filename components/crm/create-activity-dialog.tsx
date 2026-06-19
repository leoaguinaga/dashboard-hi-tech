"use client"

import React, { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { createServiceRecord, createReminder } from "@/lib/actions/crm"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ServiceRecordFields } from "@/components/crm/service-record-fields"
import { Search, X, Check, Bell, Wrench } from "lucide-react"

interface ClientOption {
  id: string
  name: string
  phone: string
}

interface Props {
  clients: ClientOption[]
  initialDate?: string // format: YYYY-MM-DD
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ActivityType = "service" | "reminder"

export function CreateActivityDialog({ clients, initialDate, open, onOpenChange }: Props) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)

  const [activityType, setActivityType] = useState<ActivityType>("service")
  const [loading, setLoading] = useState(false)

  // Client search state
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClient, setSelectedClient] = useState<ClientOption | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)

  // Service Record specific fields
  const [serviceType, setServiceType] = useState("")
  const [serviceStatus, setServiceStatus] = useState("PENDING")
  const [paymentStatus, setPaymentStatus] = useState("PENDING")
  const todayStr = initialDate || new Date().toISOString().split("T")[0]

  // Filter clients based on query
  const filteredClients = searchQuery
    ? clients.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery)
      ).slice(0, 5)
    : clients.slice(0, 5)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedClient) {
      alert("Por favor, selecciona un cliente")
      return
    }

    setLoading(true)
    const fd = new FormData(e.currentTarget)
    fd.set("clientId", selectedClient.id)

    try {
      if (activityType === "service") {
        if (!serviceType) {
          alert("Por favor, selecciona el tipo de servicio")
          setLoading(false)
          return
        }
        fd.set("type", serviceType)
        fd.set("status", serviceStatus)
        fd.set("paymentStatus", paymentStatus)
        await createServiceRecord(fd)
      } else {
        await createReminder(fd)
      }

      onOpenChange(false)
      formRef.current?.reset()
      router.refresh()
    } catch (err) {
      console.error("Error al agendar actividad:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-base">Agendar Actividad</DialogTitle>
        </DialogHeader>

        {/* Selector de Tipo de Actividad */}
        <div className="grid grid-cols-2 gap-1 bg-bg-muted p-1 rounded-md mb-2">
          <button
            type="button"
            onClick={() => setActivityType("service")}
            className={`flex items-center justify-center gap-1.5 py-1 text-xs font-medium rounded transition-colors ${
              activityType === "service"
                ? "bg-bg-base text-brand-primary shadow-xs"
                : "text-app-muted hover:text-app-primary"
            }`}
          >
            <Wrench className="h-3.5 w-3.5" />
            Servicio
          </button>
          <button
            type="button"
            onClick={() => setActivityType("reminder")}
            className={`flex items-center justify-center gap-1.5 py-1 text-xs font-medium rounded transition-colors ${
              activityType === "reminder"
                ? "bg-bg-base text-brand-primary shadow-xs"
                : "text-app-muted hover:text-app-primary"
            }`}
          >
            <Bell className="h-3.5 w-3.5" />
            Seguimiento
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-3.5 pt-1">
          {/* Selector de Cliente */}
          <div className="space-y-1.5 relative">
            <Label className="text-xs">Cliente *</Label>
            {selectedClient ? (
              <div className="flex items-center justify-between border border-brand-primary/40 bg-brand-light/20 rounded-md px-3 py-1.5 text-sm">
                <div>
                  <p className="font-medium text-brand-primary text-xs">{selectedClient.name}</p>
                  <p className="text-[10px] text-app-muted">{selectedClient.phone}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedClient(null)
                    setSearchQuery("")
                  }}
                  className="text-app-muted hover:text-danger rounded p-0.5"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-app-muted" />
                <Input
                  placeholder="Buscar cliente por nombre o teléfono..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setShowDropdown(true)
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="h-8 pl-8 text-xs bg-bg-subtle focus:bg-bg-base"
                />
                {showDropdown && (
                  <div className="absolute top-9 left-0 right-0 z-50 border border-border bg-bg-base rounded-md shadow-md py-1 max-h-40 overflow-y-auto">
                    {filteredClients.length === 0 ? (
                      <p className="text-xs text-app-muted px-3 py-2 text-center">Sin resultados</p>
                    ) : (
                      filteredClients.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSelectedClient(c)
                            setShowDropdown(false)
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs hover:bg-bg-muted flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium text-app-primary">{c.name}</p>
                            <p className="text-[10px] text-app-muted">{c.phone}</p>
                          </div>
                          <Check className="h-3 w-3 text-brand-primary opacity-0 hover:opacity-100" />
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Formulario específico según tipo */}
          {activityType === "service" ? (
            <ServiceRecordFields
              type={serviceType}
              setType={setServiceType}
              status={serviceStatus}
              setStatus={setServiceStatus}
              payment={paymentStatus}
              setPayment={setPaymentStatus}
              defaults={{ serviceDate: todayStr }}
            />
          ) : (
            <>
              <div className="space-y-1">
                <Label htmlFor="message" className="text-xs">Detalle del seguimiento *</Label>
                <Input
                  id="message"
                  name="message"
                  required
                  placeholder="Ej: Llamar para cotización de mantenimiento preventivo"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="dueDate" className="text-xs">Fecha del seguimiento *</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  defaultValue={todayStr}
                  required
                  className="h-8 text-sm"
                />
              </div>
            </>
          )}

          {/* Acciones */}
          <div className="flex justify-end gap-2 pt-2 border-t border-border mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading || !selectedClient || (activityType === "service" && !serviceType)}
            >
              {loading ? "Guardando..." : "Confirmar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
