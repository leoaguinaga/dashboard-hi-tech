import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { Users, Bell, AlertTriangle, Calendar } from "lucide-react"
import { ChannelBadge } from "@/components/crm/channel-badge"
import { ReminderBadge } from "@/components/crm/reminder-badge"

export default async function CRMPage() {
  const now          = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [totalClients, clientsByChannel, pendingReminders, overdueCount, newThisMonth] =
    await Promise.all([
      prisma.client.count(),
      prisma.client.groupBy({ by: ["source"], _count: { id: true } }),
      prisma.reminder.findMany({
        where:   { status: "PENDING" },
        include: { client: { select: { id: true, name: true } } },
        orderBy: { dueDate: "asc" },
        take: 10,
      }),
      prisma.reminder.count({ where: { status: "PENDING", dueDate: { lt: now } } }),
      prisma.client.count({ where: { createdAt: { gte: startOfMonth } } }),
    ])

  const stats = [
    {
      title: "Total clientes",
      value: totalClients,
      icon:  Users,
      sub:   `+${newThisMonth} este mes`,
    },
    {
      title:   "Recordatorios pendientes",
      value:   pendingReminders.length,
      icon:    Bell,
      sub:     `${overdueCount} vencido${overdueCount !== 1 ? "s" : ""}`,
    },
    {
      title:   "Vencidos",
      value:   overdueCount,
      icon:    AlertTriangle,
      isAlert: overdueCount > 0,
    },
    {
      title: "Próx. recordatorio",
      value: pendingReminders[0]
        ? format(new Date(pendingReminders[0].dueDate), "dd MMM", { locale: es })
        : "—",
      icon: Calendar,
    },
  ] as const

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">CRM</h1>
          <p className="text-xs text-app-muted">Gestión de clientes y seguimientos de mantenimiento.</p>
        </div>
        <Link
          href="/crm/clientes/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-brand-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark transition-colors"
        >
          + Nuevo cliente
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => {
          const Icon = s.icon
          const alert = "isAlert" in s && s.isAlert && s.value > 0
          return (
            <div
              key={s.title}
              className={`rounded-lg border p-3 bg-bg-subtle ${alert ? "border-danger/30" : "border-border"}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-app-muted">{s.title}</span>
                <Icon className={`h-4 w-4 ${alert ? "text-danger" : "text-brand-primary"}`} />
              </div>
              <p className={`text-2xl font-bold ${alert ? "text-danger" : "text-app-primary"}`}>
                {s.value}
              </p>
              {"sub" in s && s.sub && (
                <p className="text-[10px] text-app-muted mt-0.5">{s.sub}</p>
              )}
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Upcoming reminders */}
        <div className="lg:col-span-2 rounded-lg border border-border bg-bg-base">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
            <h2 className="text-sm font-medium">Próximos recordatorios</h2>
            <Link href="/crm/seguimientos" className="text-xs text-brand-primary hover:underline">
              Ver todos
            </Link>
          </div>
          {pendingReminders.length === 0 ? (
            <div className="px-4 py-10 text-center text-xs text-app-muted">
              Sin recordatorios pendientes
            </div>
          ) : (
            <div className="divide-y divide-border">
              {pendingReminders.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-bg-subtle"
                >
                  <div className="min-w-0 pr-4">
                    <Link
                      href={`/crm/clientes/${r.client.id}`}
                      className="text-sm font-medium text-app-primary hover:text-brand-primary truncate block"
                    >
                      {r.client.name}
                    </Link>
                    <p className="text-xs text-app-muted truncate">{r.message}</p>
                  </div>
                  <ReminderBadge dueDate={new Date(r.dueDate)} status={r.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Channel breakdown */}
        <div className="rounded-lg border border-border bg-bg-base">
          <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-medium">Clientes por canal</h2>
            <Link href="/crm/clientes" className="text-xs text-brand-primary hover:underline">
              Ver lista
            </Link>
          </div>
          {clientsByChannel.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-app-muted">Sin clientes aún</div>
          ) : (
            <div className="divide-y divide-border">
              {clientsByChannel.map((c) => (
                <div key={c.source} className="flex items-center justify-between px-4 py-2.5">
                  <ChannelBadge source={c.source} />
                  <span className="text-sm font-semibold text-app-primary">{c._count.id}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
