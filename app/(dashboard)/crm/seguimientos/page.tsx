import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { Bell } from "lucide-react"
import { ReminderBadge }   from "@/components/crm/reminder-badge"
import { ReminderActions } from "@/components/crm/reminder-actions"

interface Props {
  searchParams: Promise<{ status?: string }>
}

const TABS = [
  { value: "",          label: "Todos" },
  { value: "PENDING",   label: "Pendientes" },
  { value: "DONE",      label: "Completados" },
  { value: "DISMISSED", label: "Descartados" },
]

const SERVICE_LABELS: Record<string, string> = {
  INSTALLATION: "Instalación",
  MAINTENANCE:  "Mantenimiento",
  REPAIR:       "Reparación",
}

export default async function SeguimientosPage({ searchParams }: Props) {
  const { status } = await searchParams

  const reminders = await prisma.reminder.findMany({
    where:   status ? { status } : undefined,
    include: {
      client:        { select: { id: true, name: true, phone: true } },
      serviceRecord: { select: { type: true, equipmentBrand: true, equipmentModel: true } },
    },
    orderBy: { dueDate: "asc" },
  })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Seguimientos</h1>
        <p className="text-xs text-app-muted">
          Recordatorios de mantenimiento preventivo para clientes.
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map((tab) => {
          const active = status === tab.value || (!status && !tab.value)
          const href   = tab.value ? `/crm/seguimientos?status=${tab.value}` : "/crm/seguimientos"
          return (
            <Link
              key={tab.value}
              href={href}
              className={`px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors ${
                active
                  ? "border-brand-primary text-brand-primary"
                  : "border-transparent text-app-muted hover:text-app-primary"
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg-subtle">
              <th className="px-3 py-2 text-left text-xs font-medium text-app-muted">Cliente</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-app-muted hidden sm:table-cell">Servicio</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-app-muted hidden md:table-cell">Recordatorio</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-app-muted">Vence</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-app-muted">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {reminders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-12 text-center">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-app-muted/40" />
                  <p className="text-xs text-app-muted">
                    Sin recordatorios{status ? " con este estado" : ""}
                  </p>
                </td>
              </tr>
            )}
            {reminders.map((r) => (
              <tr key={r.id} className="hover:bg-bg-subtle transition-colors">
                <td className="px-3 py-2.5">
                  <Link
                    href={`/crm/clientes/${r.client.id}`}
                    className="font-medium text-app-primary hover:text-brand-primary"
                  >
                    {r.client.name}
                  </Link>
                  <p className="text-[11px] text-app-muted">{r.client.phone}</p>
                </td>

                <td className="px-3 py-2.5 hidden sm:table-cell">
                  <span className="text-xs">
                    {SERVICE_LABELS[r.serviceRecord.type] ?? r.serviceRecord.type}
                  </span>
                  {(r.serviceRecord.equipmentBrand || r.serviceRecord.equipmentModel) && (
                    <p className="text-[11px] text-app-muted">
                      {[r.serviceRecord.equipmentBrand, r.serviceRecord.equipmentModel]
                        .filter(Boolean)
                        .join(" ")}
                    </p>
                  )}
                </td>

                <td className="px-3 py-2.5 hidden md:table-cell">
                  <p className="text-xs text-app-muted">{r.message}</p>
                </td>

                <td className="px-3 py-2.5">
                  <ReminderBadge dueDate={new Date(r.dueDate)} status={r.status} />
                  <p className="text-[10px] text-app-muted mt-0.5">
                    {format(new Date(r.dueDate), "dd MMM yyyy", { locale: es })}
                  </p>
                </td>

                <td className="px-3 py-2.5">
                  <ReminderActions id={r.id} status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
