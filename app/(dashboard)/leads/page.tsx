import { prisma } from "@/lib/prisma"
import { subDays, differenceInHours } from "date-fns"
import Link from "next/link"
import { History } from "lucide-react"
import { NewLeadDialog } from "@/components/leads/new-lead-dialog"
import { LeadKanban, type KanbanLead } from "@/components/leads/lead-kanban"

const WINDOW_DAYS = 45

export default async function LeadsPage() {
  const since = subDays(new Date(), WINDOW_DAYS)

  const leads = await prisma.lead.findMany({
    where:   { createdAt: { gte: since } },
    include: { client: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  })

  // KPIs (ventana de 45d)
  const windowCount = leads.length
  const newCount    = leads.filter((l) => l.status === "NEW").length
  const wonCount    = leads.filter((l) => l.status === "WON").length
  const lostCount   = leads.filter((l) => l.status === "LOST").length
  const convRate    = windowCount > 0 ? Math.round((wonCount / windowCount) * 100) : 0

  // Tiempo promedio Nuevo → Ganado (en horas) — usa updatedAt como proxy
  const wonLeads = leads.filter((l) => l.status === "WON")
  const avgHoursToWin = wonLeads.length
    ? Math.round(
        wonLeads.reduce(
          (acc, l) => acc + differenceInHours(new Date(l.updatedAt), new Date(l.createdAt)),
          0,
        ) / wonLeads.length,
      )
    : null

  // Servicio top
  const serviceCounts = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.service] = (acc[l.service] ?? 0) + 1
    return acc
  }, {})
  const topService = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—"

  const kanbanLeads: KanbanLead[] = leads.map((l) => ({
    id:        l.id,
    name:      l.name,
    phone:     l.phone,
    email:     l.email,
    service:   l.service,
    message:   l.message,
    status:    l.status,
    source:    l.source,
    createdAt: l.createdAt.toISOString(),
    clientId:  l.client?.id ?? null,
  }))

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold">Leads</h1>
          <p className="text-xs text-app-muted">
            Tablero de los últimos {WINDOW_DAYS} días. Arrastra una tarjeta para cambiar su estado.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/leads/historial"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-bg-subtle px-3 py-1.5 text-sm font-medium text-app-primary hover:bg-bg-muted transition-colors"
          >
            <History className="h-3.5 w-3.5" />
            Historial
          </Link>
          <NewLeadDialog />
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: `Leads ${WINDOW_DAYS}d`,  value: windowCount,                          sub: "ventana actual" },
          { label: "Sin contactar",           value: newCount,                             sub: "requieren acción" },
          { label: "Tasa conversión",         value: `${convRate}%`,                       sub: `${wonCount} ganados · ${lostCount} perdidos` },
          { label: "Tiempo a ganar",          value: avgHoursToWin == null ? "—" : `${avgHoursToWin}h`, sub: "promedio nuevo→ganado" },
          { label: "Servicio top",            value: topService,                           sub: `${serviceCounts[topService] ?? 0} leads` },
        ].map((k) => (
          <div key={k.label} className="rounded-lg border border-border bg-bg-subtle p-3">
            <p className="text-xs text-app-muted">{k.label}</p>
            <p className="text-2xl font-bold text-app-primary mt-0.5 truncate">{k.value}</p>
            <p className="text-[10px] text-app-muted">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Kanban */}
      {kanbanLeads.length === 0 ? (
        <div className="rounded-lg border border-border bg-bg-subtle p-10 text-center">
          <p className="text-sm text-app-muted">Sin leads en los últimos {WINDOW_DAYS} días.</p>
          <p className="text-[11px] text-app-muted mt-1">
            Revisa el <Link href="/leads/historial" className="text-brand-primary hover:underline">historial completo</Link> o agrega uno manual.
          </p>
        </div>
      ) : (
        <LeadKanban leads={kanbanLeads} />
      )}

      <p className="text-[11px] text-app-muted">
        Cuando un lead pasa a <strong>Ganado</strong>, aparece el botón <strong>→ Cliente</strong> en la tarjeta para promover su contacto a cliente del CRM.
      </p>
    </div>
  )
}
