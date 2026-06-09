"use client"

import { useTransition } from "react"
import { updateReminderStatus } from "@/lib/actions/crm"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"

export function ReminderActions({ id, status }: { id: string; status: string }) {
  const [isPending, startTransition] = useTransition()

  if (status !== "PENDING") return null

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
      <Button
        size="sm"
        variant="ghost"
        className="h-6 px-2 text-[11px] text-app-muted hover:text-danger hover:bg-danger/5"
        disabled={isPending}
        onClick={() => startTransition(() => updateReminderStatus(id, "DISMISSED"))}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  )
}
