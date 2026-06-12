"use client"

import { useOptimistic, useTransition, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Globe, Phone, User, MessageSquare, ArrowRight } from "lucide-react"
import { updateLeadStatus, convertLeadToClient, type LeadStatus } from "@/lib/actions/leads"
import { DeleteLead } from "@/components/leads/delete-lead"
import { SERVICE_BY_LABEL } from "@/lib/services"

export type KanbanLead = {
  id: string
  name: string
  phone: string
  email: string | null
  service: string
  message: string | null
  status: string
  source: string
  createdAt: string
  clientId: string | null
}

const COLUMNS: { value: LeadStatus; label: string; color: string }[] = [
  { value: "NEW",       label: "Nuevos",       color: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "CONTACTED", label: "Contactados",  color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  { value: "QUOTED",    label: "Cotizados",    color: "bg-violet-50 text-violet-700 border-violet-200" },
  { value: "WON",       label: "Ganados",      color: "bg-success/10 text-success border-success/20" },
  { value: "LOST",      label: "Perdidos",     color: "bg-danger/10 text-danger border-danger/20" },
]

const SOURCE_ICON: Record<string, React.ElementType> = {
  landing: Globe,
  phone:   Phone,
  manual:  User,
}

export function LeadKanban({ leads }: { leads: KanbanLead[] }) {
  const [, startTransition] = useTransition()
  const [optimistic, setOptimistic] = useOptimistic(
    leads,
    (state: KanbanLead[], move: { id: string; status: string }) =>
      state.map((l) => (l.id === move.id ? { ...l, status: move.status } : l)),
  )
  const [dragging, setDragging]   = useState<string | null>(null)
  const [overCol, setOverCol]     = useState<string | null>(null)

  function handleDragStart(e: React.DragEvent, leadId: string) {
    setDragging(leadId)
    e.dataTransfer.setData("text/plain", leadId)
    e.dataTransfer.effectAllowed = "move"
  }

  function handleDragEnd() {
    setDragging(null)
    setOverCol(null)
  }

  function handleDragOver(e: React.DragEvent, col: LeadStatus) {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setOverCol(col)
  }

  function handleDrop(e: React.DragEvent, col: LeadStatus) {
    e.preventDefault()
    const leadId = e.dataTransfer.getData("text/plain")
    setDragging(null)
    setOverCol(null)
    if (!leadId) return
    const lead = optimistic.find((l) => l.id === leadId)
    if (!lead || lead.status === col) return

    startTransition(async () => {
      setOptimistic({ id: leadId, status: col })
      await updateLeadStatus(leadId, col)
    })
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {COLUMNS.map((col) => {
        const items = optimistic.filter((l) => l.status === col.value)
        const isOver = overCol === col.value

        return (
          <div
            key={col.value}
            onDragOver={(e) => handleDragOver(e, col.value)}
            onDragLeave={() => setOverCol(null)}
            onDrop={(e) => handleDrop(e, col.value)}
            className={`min-w-[260px] flex-1 rounded-lg border bg-bg-subtle/40 transition-colors ${
              isOver ? "border-brand-primary bg-brand-primary/5" : "border-border"
            }`}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-border">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${col.color}`}>
                  {col.label}
                </span>
              </div>
              <span className="text-[11px] text-app-muted">{items.length}</span>
            </div>

            <div className="p-2 space-y-2 min-h-[120px]">
              {items.length === 0 && (
                <p className="text-center text-[11px] text-app-muted/60 py-6">
                  —
                </p>
              )}
              {items.map((lead) => {
                const badge      = SERVICE_BY_LABEL[lead.service]
                const SourceIcon = SOURCE_ICON[lead.source] ?? Globe
                const isDragging = dragging === lead.id

                return (
                  <article
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    onDragEnd={handleDragEnd}
                    className={`group rounded-md border border-border bg-bg-base p-2.5 cursor-grab active:cursor-grabbing shadow-sm hover:border-app-muted/40 hover:shadow transition ${
                      isDragging ? "opacity-40" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-app-primary text-sm truncate">{lead.name}</p>
                        <a
                          href={`tel:${lead.phone}`}
                          className="text-[11px] text-brand-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {lead.phone}
                        </a>
                      </div>
                      <SourceIcon className="h-3 w-3 text-app-muted shrink-0 mt-1" />
                    </div>

                    <div className="mt-1.5">
                      <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold border ${badge?.badgeClass ?? "bg-bg-muted text-app-muted border-border"}`}>
                        {lead.service}
                      </span>
                    </div>

                    {lead.message && (
                      <p className="mt-1.5 text-[11px] text-app-muted line-clamp-2 flex gap-1">
                        <MessageSquare className="h-3 w-3 shrink-0 mt-0.5" />
                        <span>{lead.message}</span>
                      </p>
                    )}

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-app-muted">
                        {format(new Date(lead.createdAt), "dd MMM", { locale: es })}
                      </span>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {lead.status === "WON" && (
                          lead.clientId ? (
                            <Link
                              href={`/crm/clientes/${lead.clientId}`}
                              className="inline-flex items-center gap-1 text-[10px] text-brand-primary hover:underline"
                            >
                              Cliente <ArrowRight className="h-2.5 w-2.5" />
                            </Link>
                          ) : (
                            <PromoteButton leadId={lead.id} />
                          )
                        )}
                        <DeleteLead id={lead.id} />
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PromoteButton({ leadId }: { leadId: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => convertLeadToClient(leadId))}
      className="inline-flex items-center gap-1 text-[10px] text-brand-primary hover:underline disabled:opacity-50"
    >
      → Cliente
    </button>
  )
}
