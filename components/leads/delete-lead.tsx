"use client"

import { deleteLead } from "@/lib/actions/leads"
import { Trash2 } from "lucide-react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export function DeleteLead({ id }: { id: string }) {
  return (
    <ConfirmDialog
      title="¿Eliminar este lead?"
      description="Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      onConfirm={() => deleteLead(id)}
      trigger={
        <button
          type="button"
          className="text-app-muted hover:text-danger transition-colors disabled:opacity-50"
          aria-label="Eliminar lead"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      }
    />
  )
}
