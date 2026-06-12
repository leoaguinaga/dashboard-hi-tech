import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { SERVICE_BY_LABEL } from "@/lib/services"
import { DeleteLead }          from "@/components/leads/delete-lead"
import { ConvertLeadButton }   from "@/components/leads/convert-lead-button"
import { Inbox, Globe, Phone, User, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Props {
  searchParams: Promise<{ status?: string; service?: string; q?: string }>
}

const STATUS_OPTIONS = [
  { value: "",          label: "Todos" },
  { value: "NEW",       label: "Nuevos" },
  { value: "CONTACTED", label: "Contactados" },
  { value: "QUOTED",    label: "Cotizados" },
  { value: "WON",       label: "Ganados" },
  { value: "LOST",      label: "Perdidos" },
]

const STATUS_META: Record<string, { label: string; class: string }> = {
  NEW:       { label: "Nuevo",      class: "bg-blue-50 text-blue-700 border-blue-200" },
  CONTACTED: { label: "Contactado", class: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  QUOTED:    { label: "Cotizado",   class: "bg-violet-50 text-violet-700 border-violet-200" },
  WON:       { label: "Ganado",     class: "bg-success/10 text-success border-success/20" },
  LOST:      { label: "Perdido",    class: "bg-danger/10 text-danger border-danger/20" },
}

const SOURCE_ICON: Record<string, React.ElementType> = {
  landing: Globe,
  phone:   Phone,
  manual:  User,
}

export default async function LeadsHistoryPage({ searchParams }: Props) {
  const { status, service, q } = await searchParams

  const leads = await prisma.lead.findMany({
    where: {
      ...(status  ? { status } : {}),
      ...(service ? { service } : {}),
      ...(q       ? {
        OR: [
          { name:    { contains: q } },
          { phone:   { contains: q } },
          { email:   { contains: q } },
          { service: { contains: q } },
        ],
      } : {}),
    },
    include: { client: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-app-muted">
            <Link href="/leads" className="hover:text-app-primary inline-flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> Tablero
            </Link>
          </div>
          <h1 className="text-xl font-semibold mt-0.5">Historial de leads</h1>
          <p className="text-xs text-app-muted">
            {leads.length} lead{leads.length !== 1 ? "s" : ""} en total · solo lectura.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1 border-b border-border">
          {STATUS_OPTIONS.map((opt) => {
            const isActive = (status ?? "") === opt.value
            const params = new URLSearchParams()
            if (opt.value) params.set("status", opt.value)
            if (service)   params.set("service", service)
            if (q)         params.set("q", q)
            const href = `/leads/historial${params.toString() ? `?${params}` : ""}`
            return (
              <Link
                key={opt.value}
                href={href}
                className={`px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors ${
                  isActive
                    ? "border-brand-primary text-brand-primary"
                    : "border-transparent text-app-muted hover:text-app-primary"
                }`}
              >
                {opt.label}
              </Link>
            )
          })}
        </div>

        <form className="ml-auto flex gap-2">
          {status  && <input type="hidden" name="status"  value={status} />}
          {service && <input type="hidden" name="service" value={service} />}
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar nombre, teléfono..."
            className="h-7 rounded-md border border-border bg-bg-subtle px-2.5 text-xs text-app-primary placeholder-app-muted focus:outline-none focus:ring-1 focus:ring-brand-primary/40 w-44"
          />
        </form>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg-subtle">
              <th className="px-3 py-2 text-left text-xs font-medium text-app-muted">Lead</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-app-muted hidden sm:table-cell">Servicio</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-app-muted hidden md:table-cell">Mensaje</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-app-muted hidden lg:table-cell">Origen</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-app-muted hidden lg:table-cell">Fecha</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-app-muted">Estado</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-app-muted">Accs.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {leads.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-14 text-center">
                  <Inbox className="h-8 w-8 mx-auto mb-2 text-app-muted/40" />
                  <p className="text-xs text-app-muted">
                    {q || status || service ? "Sin resultados para estos filtros." : "Sin leads todavía."}
                  </p>
                </td>
              </tr>
            )}
            {leads.map((lead) => {
              const badge      = SERVICE_BY_LABEL[lead.service]
              const statusM    = STATUS_META[lead.status] ?? STATUS_META.NEW
              const SourceIcon = SOURCE_ICON[lead.source] ?? Globe

              return (
                <tr key={lead.id} className="hover:bg-bg-subtle transition-colors">
                  <td className="px-3 py-2.5">
                    <p className="font-medium text-app-primary text-sm">{lead.name}</p>
                    <a href={`tel:${lead.phone}`} className="text-[11px] text-brand-primary hover:underline">
                      {lead.phone}
                    </a>
                    {lead.email && (
                      <p className="text-[10px] text-app-muted truncate max-w-[160px]">{lead.email}</p>
                    )}
                  </td>

                  <td className="px-3 py-2.5 hidden sm:table-cell">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold border ${badge?.badgeClass ?? "bg-bg-muted text-app-muted border-border"}`}>
                      {lead.service}
                    </span>
                  </td>

                  <td className="px-3 py-2.5 hidden md:table-cell max-w-[200px]">
                    {lead.message ? (
                      <p className="text-xs text-app-muted line-clamp-2">{lead.message}</p>
                    ) : (
                      <span className="text-[11px] text-app-muted/40">—</span>
                    )}
                  </td>

                  <td className="px-3 py-2.5 hidden lg:table-cell">
                    <span className="inline-flex items-center gap-1 text-[11px] text-app-muted capitalize">
                      <SourceIcon className="h-3 w-3" />
                      {lead.source}
                    </span>
                  </td>

                  <td className="px-3 py-2.5 hidden lg:table-cell text-xs text-app-muted whitespace-nowrap">
                    {format(new Date(lead.createdAt), "dd MMM yyyy", { locale: es })}
                  </td>

                  <td className="px-3 py-2.5">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold border ${statusM.class}`}>
                      {statusM.label}
                    </span>
                  </td>

                  <td className="px-3 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {lead.status === "WON" && (
                        <ConvertLeadButton
                          leadId={lead.id}
                          clientId={lead.client?.id}
                        />
                      )}
                      <DeleteLead id={lead.id} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
