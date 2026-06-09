import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { Users } from "lucide-react"
import { ChannelBadge } from "@/components/crm/channel-badge"
import { ReminderBadge } from "@/components/crm/reminder-badge"

interface Props {
  searchParams: Promise<{ q?: string }>
}

export default async function ClientesPage({ searchParams }: Props) {
  const { q } = await searchParams

  const clients = await prisma.client.findMany({
    where: q
      ? { OR: [{ name: { contains: q } }, { phone: { contains: q } }, { email: { contains: q } }] }
      : undefined,
    include: {
      serviceRecords: { orderBy: { serviceDate: "desc" }, take: 1 },
      reminders:      { where: { status: "PENDING" }, orderBy: { dueDate: "asc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Clientes</h1>
          <p className="text-xs text-app-muted">
            {clients.length} cliente{clients.length !== 1 ? "s" : ""}
            {q ? ` para "${q}"` : " en total"}
          </p>
        </div>
        <Link
          href="/crm/clientes/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-brand-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark transition-colors"
        >
          + Nuevo cliente
        </Link>
      </div>

      {/* Search */}
      <form method="GET" className="flex gap-2 max-w-sm">
        <input
          name="q"
          defaultValue={q}
          placeholder="Nombre, teléfono o correo..."
          className="flex-1 rounded-md border border-border bg-bg-base px-3 py-1.5 text-sm focus:border-app-border-focus focus:outline-none focus:ring-1 focus:ring-app-border-focus placeholder:text-app-muted"
        />
        <button
          type="submit"
          className="rounded-md bg-brand-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark transition-colors"
        >
          Buscar
        </button>
        {q && (
          <Link
            href="/crm/clientes"
            className="rounded-md border border-border px-3 py-1.5 text-sm text-app-muted hover:bg-bg-muted transition-colors"
          >
            Limpiar
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg-subtle">
              <th className="px-3 py-2 text-left text-xs font-medium text-app-muted">Nombre</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-app-muted">Teléfono</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-app-muted hidden sm:table-cell">Canal</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-app-muted hidden md:table-cell">Último servicio</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-app-muted hidden md:table-cell">Próx. recordatorio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {clients.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-12 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-app-muted/40" />
                  <p className="text-xs text-app-muted">
                    {q ? `Sin resultados para "${q}"` : "Sin clientes registrados aún"}
                  </p>
                </td>
              </tr>
            )}
            {clients.map((c) => (
              <tr key={c.id} className="hover:bg-bg-subtle transition-colors">
                <td className="px-3 py-2.5">
                  <Link
                    href={`/crm/clientes/${c.id}`}
                    className="font-medium text-app-primary hover:text-brand-primary"
                  >
                    {c.name}
                  </Link>
                </td>
                <td className="px-3 py-2.5 text-app-muted">{c.phone}</td>
                <td className="px-3 py-2.5 hidden sm:table-cell">
                  <ChannelBadge source={c.source} />
                </td>
                <td className="px-3 py-2.5 text-app-muted hidden md:table-cell">
                  {c.serviceRecords[0]
                    ? format(new Date(c.serviceRecords[0].serviceDate), "dd MMM yyyy", { locale: es })
                    : <span className="text-app-muted/50">—</span>}
                </td>
                <td className="px-3 py-2.5 hidden md:table-cell">
                  {c.reminders[0]
                    ? <ReminderBadge dueDate={new Date(c.reminders[0].dueDate)} status={c.reminders[0].status} />
                    : <span className="text-app-muted/50 text-xs">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
