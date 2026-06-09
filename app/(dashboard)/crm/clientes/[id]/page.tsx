import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { ChevronLeft, Phone, Mail, MapPin, FileText, ArrowRightLeft } from "lucide-react"
import { ChannelBadge }           from "@/components/crm/channel-badge"
import { ReminderBadge }          from "@/components/crm/reminder-badge"
import { ReminderActions }        from "@/components/crm/reminder-actions"
import { AddServiceRecordDialog }    from "@/components/crm/add-service-record-dialog"
import { PromoteToPortfolioButton } from "@/components/crm/promote-to-portfolio-button"

interface Props {
  params: Promise<{ id: string }>
}

const SERVICE_LABELS: Record<string, string> = {
  INSTALLATION: "Instalación",
  MAINTENANCE:  "Mantenimiento",
  REPAIR:       "Reparación",
}

const STATUS_LABELS: Record<string, { label: string; class: string }> = {
  PENDING:     { label: "Pendiente",   class: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  IN_PROGRESS: { label: "En progreso", class: "bg-blue-50 text-blue-700 border-blue-200" },
  COMPLETED:   { label: "Completado",  class: "bg-success/10 text-success border-success/20" },
  CANCELLED:   { label: "Cancelado",   class: "bg-danger/10 text-danger border-danger/20" },
}

export default async function ClientProfilePage({ params }: Props) {
  const { id } = await params

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      lead:          { select: { id: true, service: true, createdAt: true } },
      serviceRecords: {
        orderBy: { serviceDate: "desc" },
        include: { project: { select: { id: true, title: true } } },
      },
      reminders: {
        orderBy: { dueDate: "asc" },
        include: { serviceRecord: { select: { type: true } } },
      },
    },
  })

  if (!client) notFound()

  const pendingReminders = client.reminders.filter((r) => r.status === "PENDING")
  const pastReminders    = client.reminders.filter((r) => r.status !== "PENDING")

  return (
    <div className="space-y-4">
      {/* Back + header */}
      <div>
        <Link
          href="/crm/clientes"
          className="inline-flex items-center gap-1 text-xs text-app-muted hover:text-app-primary mb-3"
        >
          <ChevronLeft className="h-3 w-3" />Volver a clientes
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold">{client.name}</h1>
              <ChannelBadge source={client.source} />
            </div>
            <p className="text-xs text-app-muted mt-0.5">
              Cliente desde {format(new Date(client.createdAt), "dd 'de' MMMM yyyy", { locale: es })}
            </p>
            {client.lead && (
              <Link
                href={`/leads?q=${encodeURIComponent(client.name)}`}
                className="inline-flex items-center gap-1 mt-1 text-[11px] text-app-muted hover:text-brand-primary transition-colors"
              >
                <ArrowRightLeft className="h-3 w-3" />
                Convertido desde lead · {client.lead.service}
              </Link>
            )}
          </div>
          <AddServiceRecordDialog clientId={client.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ─── Left column ──────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Contact card */}
          <div className="rounded-lg border border-border p-4 bg-bg-base space-y-2.5">
            <h2 className="text-xs font-semibold text-app-muted uppercase tracking-wide">Contacto</h2>

            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-3.5 w-3.5 text-app-muted shrink-0" />
              <span>{client.phone}</span>
            </div>

            {client.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-3.5 w-3.5 text-app-muted shrink-0" />
                <a href={`mailto:${client.email}`} className="text-brand-primary hover:underline">
                  {client.email}
                </a>
              </div>
            )}

            {client.address && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-3.5 w-3.5 text-app-muted shrink-0 mt-0.5" />
                <span className="text-app-muted">{client.address}</span>
              </div>
            )}

            {client.notes && (
              <div className="flex items-start gap-2 text-sm pt-2 border-t border-border">
                <FileText className="h-3.5 w-3.5 text-app-muted shrink-0 mt-0.5" />
                <span className="text-app-muted">{client.notes}</span>
              </div>
            )}
          </div>

          {/* Pending reminders */}
          <div className="rounded-lg border border-border bg-bg-base">
            <div className="px-4 py-2.5 border-b border-border flex items-center gap-2">
              <h2 className="text-xs font-semibold text-app-muted uppercase tracking-wide">
                Recordatorios pendientes
              </h2>
              {pendingReminders.length > 0 && (
                <span className="rounded-full bg-warning/15 px-1.5 py-0.5 text-[10px] font-semibold text-warning">
                  {pendingReminders.length}
                </span>
              )}
            </div>

            {pendingReminders.length === 0 ? (
              <p className="px-4 py-5 text-xs text-app-muted">Sin recordatorios pendientes.</p>
            ) : (
              <div className="divide-y divide-border">
                {pendingReminders.map((r) => (
                  <div key={r.id} className="px-4 py-2.5 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium truncate">{r.message}</p>
                      <ReminderBadge dueDate={new Date(r.dueDate)} status={r.status} />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-app-muted">
                        {format(new Date(r.dueDate), "dd MMM yyyy", { locale: es })}
                      </p>
                      <ReminderActions id={r.id} status={r.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── Right column ─────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Service history */}
          <div className="rounded-lg border border-border bg-bg-base">
            <div className="px-4 py-2.5 border-b border-border">
              <h2 className="text-xs font-semibold text-app-muted uppercase tracking-wide">
                Historial de servicios ({client.serviceRecords.length})
              </h2>
            </div>

            {client.serviceRecords.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="text-xs text-app-muted">Sin servicios registrados.</p>
                <p className="text-[10px] text-app-muted mt-1">
                  Usa el botón "Agregar servicio" para registrar el primer servicio.
                </p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-bg-subtle">
                    <th className="px-3 py-2 text-left text-xs font-medium text-app-muted">Fecha</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-app-muted">Tipo</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-app-muted hidden sm:table-cell">Estado</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-app-muted hidden md:table-cell">Equipo</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-app-muted hidden lg:table-cell">Costo</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-app-muted">Portafolio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {client.serviceRecords.map((sr) => {
                    const statusM = STATUS_LABELS[sr.status] ?? STATUS_LABELS.COMPLETED
                    return (
                      <tr key={sr.id} className="hover:bg-bg-subtle transition-colors">
                        <td className="px-3 py-2.5 whitespace-nowrap text-xs text-app-muted">
                          {format(new Date(sr.serviceDate), "dd MMM yyyy", { locale: es })}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium bg-brand-light text-brand-primary">
                            {SERVICE_LABELS[sr.type] ?? sr.type}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 hidden sm:table-cell">
                          <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-medium ${statusM.class}`}>
                            {statusM.label}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-app-muted hidden md:table-cell">
                          {[sr.equipmentBrand, sr.equipmentModel].filter(Boolean).join(" ") || "—"}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-app-muted hidden lg:table-cell">
                          {sr.amount != null ? `$${sr.amount.toLocaleString("en-US", { minimumFractionDigits: 0 })}` : "—"}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <PromoteToPortfolioButton
                            serviceRecordId={sr.id}
                            clientId={client.id}
                            projectId={sr.project?.id}
                            projectTitle={sr.project?.title}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Past reminders */}
          {pastReminders.length > 0 && (
            <div className="rounded-lg border border-border bg-bg-base">
              <div className="px-4 py-2.5 border-b border-border">
                <h2 className="text-xs font-semibold text-app-muted uppercase tracking-wide">
                  Recordatorios anteriores
                </h2>
              </div>
              <div className="divide-y divide-border">
                {pastReminders.map((r) => (
                  <div key={r.id} className="flex items-center justify-between px-4 py-2">
                    <p className="text-xs text-app-muted truncate pr-4">{r.message}</p>
                    <ReminderBadge dueDate={new Date(r.dueDate)} status={r.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
