import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { Wrench } from "lucide-react"
import { PromoteToPortfolioButton } from "@/components/crm/promote-to-portfolio-button"
import { PaymentStatusToggle } from "@/components/crm/payment-status-toggle"

interface Props {
  searchParams: Promise<{ type?: string; status?: string; q?: string }>
}

const TYPE_OPTIONS = [
  { value: "",             label: "Todos los tipos" },
  { value: "INSTALLATION", label: "Instalación" },
  { value: "MAINTENANCE",  label: "Mantenimiento" },
  { value: "REPAIR",       label: "Reparación" },
]

const STATUS_OPTIONS = [
  { value: "",            label: "Todos los estados" },
  { value: "PENDING",     label: "Pendiente" },
  { value: "IN_PROGRESS", label: "En progreso" },
  { value: "COMPLETED",   label: "Completado" },
  { value: "CANCELLED",   label: "Cancelado" },
]

const TYPE_BADGE: Record<string, string> = {
  INSTALLATION: "bg-brand-light text-brand-primary",
  MAINTENANCE:  "bg-violet-50 text-violet-700",
  REPAIR:       "bg-orange-50 text-orange-700",
}

const STATUS_BADGE: Record<string, { label: string; class: string }> = {
  PENDING:     { label: "Pendiente",   class: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  IN_PROGRESS: { label: "En progreso", class: "bg-blue-50 text-blue-700 border-blue-200" },
  COMPLETED:   { label: "Completado",  class: "bg-success/10 text-success border-success/20" },
  CANCELLED:   { label: "Cancelado",   class: "bg-danger/10 text-danger border-danger/20" },
}

const TYPE_LABELS: Record<string, string> = {
  INSTALLATION: "Instalación",
  MAINTENANCE:  "Mantenimiento",
  REPAIR:       "Reparación",
}

export default async function ServicesPage({ searchParams }: Props) {
  const { type, status, q } = await searchParams

  const records = await prisma.serviceRecord.findMany({
    where: {
      ...(type   ? { type }   : {}),
      ...(status ? { status } : {}),
      ...(q ? {
        OR: [
          { client: { name:  { contains: q, mode: "insensitive" } } },
          { client: { phone: { contains: q } } },
          { equipmentBrand: { contains: q, mode: "insensitive" } },
          { equipmentModel: { contains: q, mode: "insensitive" } },
        ],
      } : {}),
    },
    include: {
      client:  { select: { id: true, name: true, city: true } },
      project: { select: { id: true, title: true } },
    },
    orderBy: { serviceDate: "desc" },
  })

  // KPIs
  const [total, pending, completed, paidAgg, pendingAgg] = await Promise.all([
    prisma.serviceRecord.count(),
    prisma.serviceRecord.count({ where: { status: "PENDING" } }),
    prisma.serviceRecord.count({ where: { status: "COMPLETED" } }),
    prisma.serviceRecord.aggregate({ _sum: { amount: true }, where: { paymentStatus: "PAID" } }),
    prisma.serviceRecord.aggregate({ _sum: { amount: true }, where: { paymentStatus: "PENDING" } }),
  ])
  const paidRevenue    = paidAgg._sum.amount ?? 0
  const pendingRevenue = pendingAgg._sum.amount ?? 0
  const fmtMoney = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 0 })}`
  const withPortfolio = records.filter((r) => r.project).length

  function buildHref(params: Record<string, string>) {
    const p = new URLSearchParams()
    if (params.type   ?? type)   p.set("type",   params.type   ?? type   ?? "")
    if (params.status ?? status) p.set("status", params.status ?? status ?? "")
    if (params.q      ?? q)      p.set("q",      params.q      ?? q      ?? "")
    // Allow explicit empty string to clear a param
    if ("type"   in params && params.type   === "") p.delete("type")
    if ("status" in params && params.status === "") p.delete("status")
    if ("q"      in params && params.q      === "") p.delete("q")
    const s = p.toString()
    return `/services${s ? `?${s}` : ""}`
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold">Servicios</h1>
        <p className="text-xs text-app-muted">
          Todos los servicios realizados · {records.length} resultado{records.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total servicios",  value: total,     sub: "histórico" },
          { label: "Completados",      value: completed, sub: `${pending} pendientes` },
          { label: "Ingresos cobrados", value: fmtMoney(paidRevenue),    sub: "registrados" },
          { label: "Por cobrar",        value: fmtMoney(pendingRevenue), sub: "pendiente de pago" },
        ].map((k) => (
          <div key={k.label} className="rounded-lg border border-border bg-bg-subtle p-3">
            <p className="text-xs text-app-muted">{k.label}</p>
            <p className="text-2xl font-bold text-app-primary mt-0.5">{k.value}</p>
            <p className="text-[10px] text-app-muted">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1 border-b border-border">
          {TYPE_OPTIONS.map((opt) => (
            <Link
              key={opt.value}
              href={buildHref({ type: opt.value })}
              className={`px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors ${
                (type ?? "") === opt.value
                  ? "border-brand-primary text-brand-primary"
                  : "border-transparent text-app-muted hover:text-app-primary"
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>

        <div className="flex gap-1 border-b border-border">
          {STATUS_OPTIONS.map((opt) => (
            <Link
              key={opt.value}
              href={buildHref({ status: opt.value })}
              className={`px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors ${
                (status ?? "") === opt.value
                  ? "border-brand-primary text-brand-primary"
                  : "border-transparent text-app-muted hover:text-app-primary"
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>

        <form className="ml-auto flex gap-2">
          {type   && <input type="hidden" name="type"   value={type}   />}
          {status && <input type="hidden" name="status" value={status} />}
          <input
            name="q"
            defaultValue={q}
            placeholder="Cliente, equipo..."
            className="h-7 rounded-md border border-border bg-bg-subtle px-2.5 text-xs placeholder-app-muted focus:outline-none focus:ring-1 focus:ring-brand-primary/40 w-44"
          />
        </form>
      </div>

      {/* Portfolio coverage note */}
      {records.length > 0 && (
        <p className="text-[11px] text-app-muted">
          {withPortfolio} de {records.length} servicio{records.length !== 1 ? "s" : ""} tienen proyecto en el portafolio.
          {" "}Los que no tienen muestran el botón <strong>→ Portafolio</strong>.
        </p>
      )}

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg-subtle">
              <th className="px-3 py-2 text-left text-xs font-medium text-app-muted">Cliente</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-app-muted">Tipo</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-app-muted hidden sm:table-cell">Estado</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-app-muted hidden md:table-cell">Fecha</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-app-muted hidden md:table-cell">Equipo</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-app-muted hidden lg:table-cell">Costo</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-app-muted">Cobro</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-app-muted">Portafolio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {records.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-14 text-center">
                  <Wrench className="h-8 w-8 mx-auto mb-2 text-app-muted/40" />
                  <p className="text-xs text-app-muted">
                    {q || type || status ? "Sin resultados para estos filtros." : "Sin servicios registrados aún."}
                  </p>
                  <p className="text-[11px] text-app-muted mt-1">
                    Los servicios se registran desde el perfil de cada cliente.
                  </p>
                </td>
              </tr>
            )}
            {records.map((sr) => {
              const statusM = STATUS_BADGE[sr.status] ?? STATUS_BADGE.COMPLETED
              return (
                <tr key={sr.id} className="hover:bg-bg-subtle transition-colors">
                  <td className="px-3 py-2.5">
                    <Link
                      href={`/crm/clientes/${sr.client.id}`}
                      className="font-medium text-app-primary hover:text-brand-primary text-sm"
                    >
                      {sr.client.name}
                    </Link>
                    {sr.client.city && (
                      <p className="text-[10px] text-app-muted">{sr.client.city}</p>
                    )}
                  </td>

                  <td className="px-3 py-2.5">
                    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium ${TYPE_BADGE[sr.type] ?? "bg-bg-muted text-app-muted"}`}>
                      {TYPE_LABELS[sr.type] ?? sr.type}
                    </span>
                  </td>

                  <td className="px-3 py-2.5 hidden sm:table-cell">
                    <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-medium ${statusM.class}`}>
                      {statusM.label}
                    </span>
                  </td>

                  <td className="px-3 py-2.5 text-xs text-app-muted whitespace-nowrap hidden md:table-cell">
                    {format(new Date(sr.serviceDate), "dd MMM yyyy", { locale: es })}
                  </td>

                  <td className="px-3 py-2.5 text-xs text-app-muted hidden md:table-cell">
                    {[sr.equipmentBrand, sr.equipmentModel].filter(Boolean).join(" ") || "—"}
                  </td>

                  <td className="px-3 py-2.5 text-xs text-app-muted hidden lg:table-cell">
                    {sr.amount != null
                      ? `$${sr.amount.toLocaleString("en-US", { minimumFractionDigits: 0 })}`
                      : "—"}
                  </td>

                  <td className="px-3 py-2.5">
                    {sr.amount != null
                      ? <PaymentStatusToggle id={sr.id} paymentStatus={sr.paymentStatus} />
                      : <span className="text-[11px] text-app-muted/50">—</span>}
                  </td>

                  <td className="px-3 py-2.5 text-right">
                    <PromoteToPortfolioButton
                      serviceRecordId={sr.id}
                      clientId={sr.client.id}
                      projectId={sr.project?.id}
                      projectTitle={sr.project?.title}
                    />
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
