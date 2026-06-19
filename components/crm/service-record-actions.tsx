"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { updateServiceRecord, deleteServiceRecord } from "@/lib/actions/crm"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { ServiceRecordFields } from "@/components/crm/service-record-fields"
import { Pencil, Trash2 } from "lucide-react"

export interface ServiceRecordData {
  id: string
  type: string
  status: string
  paymentStatus: string
  serviceDate: string | Date
  equipmentBrand: string | null
  equipmentModel: string | null
  amount: number | null
  notes: string | null
  scheduledTime?: string | null
  address?: string | null
}

export function ServiceRecordActions({ record }: { record: ServiceRecordData }) {
  const [open,    setOpen]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [type,    setType]    = useState(record.type)
  const [status,  setStatus]  = useState(record.status)
  const [payment, setPayment] = useState(record.paymentStatus)
  const formRef = useRef<HTMLFormElement>(null)
  const router  = useRouter()

  const serviceDateStr = new Date(record.serviceDate).toISOString().split("T")[0]

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!type) return
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    fd.set("type",          type)
    fd.set("status",        status)
    fd.set("paymentStatus", payment)
    try {
      await updateServiceRecord(record.id, fd)
      setOpen(false)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    await deleteServiceRecord(record.id)
    router.refresh()
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <button
              type="button"
              title="Editar servicio"
              className="inline-flex h-6 w-6 items-center justify-center rounded text-app-muted hover:text-brand-primary hover:bg-bg-muted transition-colors"
            />
          }
        >
          <Pencil className="h-3.5 w-3.5" />
        </DialogTrigger>

        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Editar servicio</DialogTitle>
          </DialogHeader>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-3 pt-1">
            <ServiceRecordFields
              type={type} setType={setType}
              status={status} setStatus={setStatus}
              payment={payment} setPayment={setPayment}
              showFollowUp={false}
              defaults={{
                serviceDate:    serviceDateStr,
                equipmentBrand: record.equipmentBrand,
                equipmentModel: record.equipmentModel,
                amount:         record.amount,
                notes:          record.notes,
                scheduledTime:  record.scheduledTime,
                address:        record.address,
              }}
            />
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={loading || !type}>
                {loading ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        title="¿Eliminar este servicio?"
        description="Sus recordatorios asociados también se borrarán. Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        trigger={
          <button
            type="button"
            title="Eliminar servicio"
            className="inline-flex h-6 w-6 items-center justify-center rounded text-app-muted hover:text-danger hover:bg-danger/5 transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        }
      />
    </div>
  )
}
