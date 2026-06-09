"use client"

import { useTransition } from "react"
import { togglePublished } from "@/lib/actions/portfolio"

export function TogglePublished({ id, published }: { id: string; published: boolean }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => togglePublished(id, !published))}
      className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-medium transition-colors disabled:opacity-50 ${
        published
          ? "bg-success/10 text-success border-success/30 hover:bg-success/20"
          : "bg-bg-muted text-app-muted border-border hover:bg-bg-muted"
      }`}
    >
      {isPending ? "..." : published ? "Publicado" : "Borrador"}
    </button>
  )
}
