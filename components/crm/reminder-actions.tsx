"use client"

import { useState, useTransition } from "react"
import { updateReminderStatus, rescheduleReminder } from "@/lib/actions/crm"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input }  from "@/components/ui/input"
import { Label }  from "@/components/ui/label"
import { Check, X, CalendarClock } from "lucide-react"

export function ReminderActions({ id, status }: { id: string; status: string }) {
  const [isPending, startTransition] = useTransition()
  const [open, setOpen]     = useState(false)
  const [date, setDate]     = useState("")
  const [saving, setSaving] = useState(false)

  if (status !== "PENDING") return null

  async function handleReschedule(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!date) return
    setSaving(true)
    try {
      await rescheduleReminder(id, date)
      setOpen(false)
      setDate("")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        size="sm"
        variant="outline"
        className="h-6 px-2 text-[11px] text-success border-success/30 hover:bg-success/10 hover:border-success/50"
        disabled={isPending}
        onClick={() => startTransition(() => updateReminderStatus(id, "DONE"))}
      >
        <Check className="h-3 w-3 mr-1" />
        Listo
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <button
              type="button"
              title="Posponer"
              className="inline-flex h-6 w-6 items-center justify-center rounded text-app-muted hover:text-brand-primary hover:bg-bg-muted transition-colors"
            />
          }
        >
          <CalendarClock className="h-3.5 w-3.5" />
        </DialogTrigger>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-base">Posponer recordatorio</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleReschedule} className="space-y-3 pt-1">
            <div className="space-y-1">
              <Label htmlFor={`due-${id}`} className="text-xs">Nueva fecha</Label>
              <Input
                id={`due-${id}`} type="date" value={date}
                onChange={(e) => setDate(e.target.value)} required className="h-8 text-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={saving || !date}>
                {saving ? "Guardando..." : "Posponer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Button
        size="sm"
        variant="ghost"
        className="h-6 px-2 text-[11px] text-app-muted hover:text-danger hover:bg-danger/5"
        disabled={isPending}
        onClick={() => startTransition(() => updateReminderStatus(id, "DISMISSED"))}
        title="Descartar"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  )
}
