"use client"

import { deleteProject } from "@/lib/actions/portfolio"
import { Trash2 } from "lucide-react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export function DeleteProject({ id }: { id: string }) {
  return (
    <ConfirmDialog
      title="¿Eliminar este proyecto?"
      description="Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      onConfirm={() => deleteProject(id)}
      trigger={
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs text-app-muted hover:text-danger transition-colors disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Eliminar
        </button>
      }
    />
  )
}
