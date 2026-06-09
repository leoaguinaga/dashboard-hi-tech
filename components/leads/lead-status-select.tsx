"use client"

import { useTransition } from "react"
import { updateLeadStatus, type LeadStatus } from "@/lib/actions/leads"

const OPTIONS: { value: LeadStatus; label: string; class: string }[] = [
  { value: "NEW",       label: "Nuevo",      class: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "CONTACTED", label: "Contactado", class: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  { value: "QUOTED",    label: "Cotizado",   class: "bg-violet-50 text-violet-700 border-violet-200" },
  { value: "WON",       label: "Ganado",     class: "bg-success/10 text-success border-success/20" },
  { value: "LOST",      label: "Perdido",    class: "bg-danger/10 text-danger border-danger/20" },
]

export function LeadStatusSelect({ id, status }: { id: string; status: string }) {
  const [isPending, startTransition] = useTransition()
  const current = OPTIONS.find((o) => o.value === status) ?? OPTIONS[0]

  return (
    <select
      disabled={isPending}
      defaultValue={status}
      onChange={(e) =>
        startTransition(() => updateLeadStatus(id, e.target.value as LeadStatus))
      }
      className={`text-[11px] font-semibold rounded-full px-2.5 py-0.5 border cursor-pointer transition-opacity disabled:opacity-50 ${current.class}`}
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}
