"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { createServiceRecord } from "@/lib/actions/crm"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ServiceRecordFields } from "@/components/crm/service-record-fields"
import { Plus } from "lucide-react"

export function AddServiceRecordDialog({ clientId }: { clientId: string }) {
  const [open,    setOpen]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [type,    setType]    = useState("")
  const [status,  setStatus]  = useState("COMPLETED")
  const [payment, setPayment] = useState("PAID")
  const formRef               = useRef<HTMLFormElement>(null)
  const router                = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!type) return
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    fd.set("clientId",      clientId)
    fd.set("type",          type)
    fd.set("status",        status)
    fd.set("paymentStatus", payment)
    try {
      await createServiceRecord(fd)
      setOpen(false)
      formRef.current?.reset()
      setType("")
      setStatus("COMPLETED")
      setPayment("PAID")
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
          <ServiceRecordFields
            type={type} setType={setType}
            status={status} setStatus={setStatus}
            payment={payment} setPayment={setPayment}
          />

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
