"use client"

import { useTransition } from "react"
import { deleteLead } from "@/lib/actions/leads"
import { Trash2 } from "lucide-react"

export function DeleteLead({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      disabled={isPending}
      onClick={() => {
        if (!confirm("¿Eliminar este lead?")) return
        startTransition(() => deleteLead(id))
      }}
      className="text-app-muted hover:text-danger transition-colors disabled:opacity-50"
      aria-label="Eliminar lead"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  )
}
