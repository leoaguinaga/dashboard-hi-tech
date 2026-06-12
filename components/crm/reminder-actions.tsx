"use client"

import { useState, useTransition } from "react"
import { addDays, addMonths, format } from "date-fns"
import {
  completeReminderWithFollowUp,
  rescheduleReminder,
  updateReminderStatus,
} from "@/lib/actions/crm"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input }  from "@/components/ui/input"
import { Label }  from "@/components/ui/label"
import { Check, X, CalendarClock } from "lucide-react"

type Mode = "next" | "custom" | "none"

export function ReminderActions({ id, status }: { id: string; status: string }) {
  const [isPending, startTransition] = useTransition()

  const [doneOpen, setDoneOpen]   = useState(false)
  const [mode, setMode]           = useState<Mode>("next")
  const [customDate, setCustomDate] = useState("")
  const [doneSaving, setDoneSaving] = useState(false)

  const [postponeOpen, setPostponeOpen] = useState(false)
  const [postponeDate, setPostponeDate] = useState("")
  const [postponeSaving, setPostponeSaving] = useState(false)

  if (status !== "PENDING") return null

  const suggestedNext  = format(addMonths(new Date(), 6), "yyyy-MM-dd")
  const suggestedSoon  = format(addDays(new Date(), 7),  "yyyy-MM-dd")

  async function handleDone(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setDoneSaving(true)
    try {
      const next =
        mode === "next"   ? suggestedNext :
        mode === "custom" ? customDate :
        null
      await completeReminderWithFollowUp(id, next)
      setDoneOpen(false)
      setMode("next")
      setCustomDate("")
    } finally {
      setDoneSaving(false)
    }
  }

  async function handleReschedule(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!postponeDate) return
    setPostponeSaving(true)
    try {
      await rescheduleReminder(id, postponeDate)
      setPostponeOpen(false)
      setPostponeDate("")
    } finally {
      setPostponeSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Dialog open={doneOpen} onOpenChange={setDoneOpen}>
        <DialogTrigger
          render={
            <Button
              size="sm"
              variant="outline"
              className="h-6 px-2 text-[11px] text-success border-success/30 hover:bg-success/10 hover:border-success/50"
            />
          }
        >
          <Check className="h-3 w-3 mr-1" />
          Listo
        </DialogTrigger>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Seguimiento completado</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDone} className="space-y-3 pt-1">
            <p className="text-xs text-app-muted">
              ¿Qué sigue después de este contacto?
            </p>

            <label className={`flex items-start gap-2 rounded-md border p-2.5 cursor-pointer transition-colors ${
              mode === "next" ? "border-brand-primary bg-brand-primary/5" : "border-border hover:bg-bg-subtle"
            }`}>
              <input
                type="radio" name="mode" value="next"
                checked={mode === "next"} onChange={() => setMode("next")}
                className="mt-0.5"
              />
              <div className="text-xs">
                <p className="font-medium text-app-primary">Agendar próximo mantenimiento</p>
                <p className="text-app-muted">En 6 meses ({format(addMonths(new Date(), 6), "dd MMM yyyy")})</p>
              </div>
            </label>

            <label className={`flex items-start gap-2 rounded-md border p-2.5 cursor-pointer transition-colors ${
              mode === "custom" ? "border-brand-primary bg-brand-primary/5" : "border-border hover:bg-bg-subtle"
            }`}>
              <input
                type="radio" name="mode" value="custom"
                checked={mode === "custom"} onChange={() => setMode("custom")}
                className="mt-0.5"
              />
              <div className="text-xs flex-1">
                <p className="font-medium text-app-primary">Reagendar más cerca</p>
                <p className="text-app-muted mb-1.5">Cliente quiere posponer el servicio.</p>
                <Input
                  type="date"
                  value={customDate}
                  onChange={(e) => { setCustomDate(e.target.value); setMode("custom") }}
                  min={format(new Date(), "yyyy-MM-dd")}
                  placeholder={suggestedSoon}
                  className="h-7 text-xs"
                />
              </div>
            </label>

            <label className={`flex items-start gap-2 rounded-md border p-2.5 cursor-pointer transition-colors ${
              mode === "none" ? "border-brand-primary bg-brand-primary/5" : "border-border hover:bg-bg-subtle"
            }`}>
              <input
                type="radio" name="mode" value="none"
                checked={mode === "none"} onChange={() => setMode("none")}
                className="mt-0.5"
              />
              <div className="text-xs">
                <p className="font-medium text-app-primary">No requiere más seguimiento</p>
                <p className="text-app-muted">Cerrar este recordatorio.</p>
              </div>
            </label>

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" size="sm" onClick={() => setDoneOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit" size="sm"
                disabled={doneSaving || (mode === "custom" && !customDate)}
              >
                {doneSaving ? "Guardando..." : "Confirmar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={postponeOpen} onOpenChange={setPostponeOpen}>
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
                id={`due-${id}`} type="date" value={postponeDate}
                onChange={(e) => setPostponeDate(e.target.value)} required className="h-8 text-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setPostponeOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={postponeSaving || !postponeDate}>
                {postponeSaving ? "Guardando..." : "Posponer"}
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
