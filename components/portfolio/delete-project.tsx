"use client"

import { useTransition } from "react"
import { deleteProject } from "@/lib/actions/portfolio"
import { Trash2 } from "lucide-react"

export function DeleteProject({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm("¿Eliminar este proyecto? Esta acción no se puede deshacer.")) return
    startTransition(() => deleteProject(id))
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="inline-flex items-center gap-1 text-xs text-app-muted hover:text-danger transition-colors disabled:opacity-50"
    >
      <Trash2 className="h-3.5 w-3.5" />
      {isPending ? "..." : "Eliminar"}
    </button>
  )
}
