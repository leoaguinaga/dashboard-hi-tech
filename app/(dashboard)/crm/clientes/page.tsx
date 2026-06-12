import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { Users } from "lucide-react"
import { ChannelBadge } from "@/components/crm/channel-badge"
import { ReminderBadge } from "@/components/crm/reminder-badge"

interface Props {
  searchParams: Promise<{ q?: string; category?: string }>
}

const CATEGORY_TABS = [
  { value: "",        label: "Todos" },
  { value: "CLIENT",  label: "Clientes" },
  { value: "CONTACT", label: "Contactos" },
]

export default async function ClientesPage({ searchParams }: Props) {
  const { q, category } = await searchParams

  const where = {
    ...(category ? { category } : {}),
    ...(q
      ? { OR: [{ name: { contains: q } }, { phone: { contains: q } }, { email: { contains: q } }] }
      : {}),
  }

  const [clients, countAll, countClients, countContacts] = await Promise.all([
    prisma.client.findMany({
      where,
      include: {
        serviceRecords: { orderBy: { serviceDate: "desc" }, take: 1 },
        reminders:      { where: { status: "PENDING" }, orderBy: { dueDate: "asc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.client.count(),
    prisma.client.count({ where: { category: "CLIENT" } }),
    prisma.client.count({ where: { category: "CONTACT" } }),
  ])

  const counts: Record<string, number> = {
    "":        countAll,
    CLIENT:    countClients,
    CONTACT:   countContacts,
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Clientes y contactos</h1>
          <p className="text-xs text-app-muted">
            {clients.length} resultado{clients.length !== 1 ? "s" : ""}
            {q ? ` para "${q}"` : ""}
          </p>
        </div>
        <Link
          href="/crm/clientes/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-brand-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark transition-colors"
        >
          + Nuevo cliente
        </Link>
      </div>

      {/* Category tabs + search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 border-b border-border">
          {CATEGORY_TABS.map((tab) => {
            const active = (category ?? "") === tab.value
            const params = new URLSearchParams()
            if (tab.value) params.set("category", tab.value)
            if (q)         params.set("q", q)
            const href = `/crm/clientes${params.toString() ? `?${params}` : ""}`
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
                <span className="ml-1 text-[10px] text-app-muted">({counts[tab.value]})</span>
              </Link>
            )
          })}
        </div>

        <form method="GET" className="flex gap-2 ml-auto max-w-sm">
          {category && <input type="hidden" name="category" value={category} />}
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
              href={category ? `/crm/clientes?category=${category}` : "/crm/clientes"}
              className="rounded-md border border-border px-3 py-1.5 text-sm text-app-muted hover:bg-bg-muted transition-colors"
            >
              Limpiar
            </Link>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg-subtle">
              <th className="px-3 py-2 text-left text-xs font-medium text-app-muted">Nombre</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-app-muted">Tipo</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-app-muted">Teléfono</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-app-muted hidden sm:table-cell">Canal</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-app-muted hidden md:table-cell">Último servicio</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-app-muted hidden md:table-cell">Próx. recordatorio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {clients.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-12 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-app-muted/40" />
                  <p className="text-xs text-app-muted">
                    {q ? `Sin resultados para "${q}"` : "Sin registros aún"}
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
                <td className="px-3 py-2.5">
                  <span
                    className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-medium ${
                      c.category === "CLIENT"
                        ? "bg-success/10 text-success border-success/20"
                        : "bg-bg-muted text-app-muted border-border"
                    }`}
                  >
                    {c.category === "CLIENT" ? "Cliente" : "Contacto"}
                  </span>
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
