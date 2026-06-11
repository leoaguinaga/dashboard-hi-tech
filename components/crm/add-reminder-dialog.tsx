"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { createReminder } from "@/lib/actions/crm"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input }  from "@/components/ui/input"
import { Label }  from "@/components/ui/label"
import { Plus }   from "lucide-react"

export function AddReminderDialog({ clientId }: { clientId: string }) {
  const [open,    setOpen]    = useState(false)
  const [loading, setLoading] = useState(false)
  const formRef               = useRef<HTMLFormElement>(null)
  const router                = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    fd.set("clientId", clientId)
    try {
      await createReminder(fd)
      setOpen(false)
      formRef.current?.reset()
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            type="button"
            title="Nuevo recordatorio"
            className="inline-flex h-6 w-6 items-center justify-center rounded text-app-muted hover:text-brand-primary hover:bg-bg-muted transition-colors"
          />
        }
      >
        <Plus className="h-3.5 w-3.5" />
      </DialogTrigger>

      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">Nuevo recordatorio</DialogTitle>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-3 pt-1">
          <div className="space-y-1">
            <Label htmlFor="message" className="text-xs">Recordatorio *</Label>
            <Input
              id="message" name="message" required
              placeholder="Ej: Llamar para cotización de ductos"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="dueDate" className="text-xs">Fecha *</Label>
            <Input id="dueDate" name="dueDate" type="date" required className="h-8 text-sm" />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Guardando..." : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
