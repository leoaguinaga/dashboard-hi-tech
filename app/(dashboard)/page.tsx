import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { format, startOfMonth, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { DollarSign, Briefcase, Users, Wallet, CheckCircle2, TrendingUp } from "lucide-react";
import { ReminderBadge }   from "@/components/crm/reminder-badge";
import { ReminderActions } from "@/components/crm/reminder-actions";
import { RevenueChart, type RevenuePoint }        from "@/components/dashboard/revenue-chart";
import { ServiceMixChart, type ServiceMixPoint }  from "@/components/dashboard/service-mix-chart";
import { LeadFunnelChart, type FunnelPoint }      from "@/components/dashboard/lead-funnel-chart";

const TYPE_LABELS: Record<string, string> = {
  INSTALLATION: "Instalación",
  MAINTENANCE:  "Mantenimiento",
  REPAIR:       "Reparación",
};

const TYPE_DOT: Record<string, string> = {
  INSTALLATION: "bg-[var(--chart-1)]",
  MAINTENANCE:  "bg-[var(--chart-2)]",
  REPAIR:       "bg-[var(--chart-3)]",
};

const FUNNEL_ORDER = ["NEW", "CONTACTED", "QUOTED", "WON", "LOST"];
const STAGE_LABELS: Record<string, string> = {
  NEW: "Nuevos", CONTACTED: "Contactados", QUOTED: "Cotizados", WON: "Ganados", LOST: "Perdidos",
};

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user    = session?.user;
  const now     = new Date();
  const monthStart = startOfMonth(now);
  const chartStart = startOfMonth(subMonths(now, 5)); // 6 meses incl. el actual

  const [
    totalClients,
    newClientsThisMonth,
    pendingReminders,
    revenueThisMonth,
    jobsThisMonth,
    pendingRevenue,
    recentServices,
    serviceMix,
    leadFunnel,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.client.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.reminder.findMany({
      where:   { status: "PENDING" },
      include: { client: { select: { id: true, name: true } } },
      orderBy: { dueDate: "asc" },
      take: 6,
    }),
    prisma.serviceRecord.aggregate({
      _sum:  { amount: true },
      where: { paymentStatus: "PAID", serviceDate: { gte: monthStart } },
    }),
    prisma.serviceRecord.count({
      where: { status: "COMPLETED", serviceDate: { gte: monthStart } },
    }),
    prisma.serviceRecord.aggregate({
      _sum:  { amount: true },
      where: { paymentStatus: "PENDING" },
    }),
    prisma.serviceRecord.findMany({
      where:  { serviceDate: { gte: chartStart } },
      select: { serviceDate: true, amount: true, paymentStatus: true },
    }),
    prisma.serviceRecord.groupBy({ by: ["type"], _count: { id: true } }),
    prisma.lead.groupBy({ by: ["status"], _count: { id: true } }),
  ]);

  const overdueCount = pendingReminders.filter((r) => new Date(r.dueDate) < now).length;
  const monthRevenue = revenueThisMonth._sum.amount ?? 0;
  const owedRevenue  = pendingRevenue._sum.amount ?? 0;
  const fmtMoney = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

  /* ─── Tendencia de ingresos (6 meses) ─────────────────────────────── */
  const revenueData: RevenuePoint[] = Array.from({ length: 6 }).map((_, i) => {
    const m   = startOfMonth(subMonths(now, 5 - i));
    const key = format(m, "yyyy-MM");
    let cobrado = 0, pendiente = 0;
    for (const s of recentServices) {
      if (format(new Date(s.serviceDate), "yyyy-MM") !== key || s.amount == null) continue;
      if (s.paymentStatus === "PAID") cobrado += s.amount;
      else pendiente += s.amount;
    }
    return { month: format(m, "MMM", { locale: es }), cobrado, pendiente };
  });

  /* ─── Mezcla de servicios ─────────────────────────────────────────── */
  const serviceMixData: ServiceMixPoint[] = serviceMix.map((s) => ({
    type:  s.type,
    label: TYPE_LABELS[s.type] ?? s.type,
    count: s._count.id,
  }));

  /* ─── Embudo de leads ─────────────────────────────────────────────── */
  const funnelMap = Object.fromEntries(leadFunnel.map((l) => [l.status, l._count.id]));
  const funnelData: FunnelPoint[] = FUNNEL_ORDER.map((s) => ({
    stage: s, label: STAGE_LABELS[s], count: funnelMap[s] ?? 0,
  }));
  const totalLeads = funnelData.reduce((acc, d) => acc + d.count, 0);
  const wonLeads   = funnelMap.WON ?? 0;
  const convRate   = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

  const kpis = [
    {
      title: "Ingresos del mes", value: fmtMoney(monthRevenue),
      change: format(now, "MMMM yyyy", { locale: es }), isPositive: true, icon: DollarSign,
    },
    {
      title: "Por cobrar", value: fmtMoney(owedRevenue),
      change: owedRevenue > 0 ? "pendiente de pago" : "todo cobrado",
      isPositive: owedRevenue === 0, icon: Wallet,
    },
    {
      title: "Trabajos del mes", value: String(jobsThisMonth),
      change: "servicios completados", isPositive: true, icon: Briefcase,
    },
    {
      title: "Clientes nuevos", value: String(newClientsThisMonth),
      change: `${totalClients} en total`, isPositive: true, icon: Users,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Welcome */}
      <div>
        <h1 className="text-xl font-semibold text-app-primary">
          ¡Hola, {user?.name?.split(" ")[0] || "equipo"}!
        </h1>
        <p className="text-xs text-app-muted">
          {format(now, "EEEE dd 'de' MMMM yyyy", { locale: es })}
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.title} className="rounded-lg border border-border bg-bg-subtle p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-app-muted">{kpi.title}</span>
                <Icon className="h-4 w-4 text-brand-primary" />
              </div>
              <p className="text-2xl font-bold text-app-primary mt-1">{kpi.value}</p>
              <span className={`text-[10px] font-medium mt-0.5 inline-block ${kpi.isPositive ? "text-success" : "text-warning"}`}>
                {kpi.change}
              </span>
            </div>
          );
        })}
      </div>

      {/* Charts row 1: revenue trend + service mix */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        {/* Revenue trend */}
        <div className="lg:col-span-2 rounded-lg border border-border bg-bg-base">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold text-app-primary">Ingresos por mes</h2>
              <p className="text-[11px] text-app-muted">Últimos 6 meses · cobrado vs. por cobrar</p>
            </div>
            <Link href="/services" className="text-xs text-brand-primary hover:underline">Ver servicios</Link>
          </div>
          <div className="p-3">
            <RevenueChart data={revenueData} />
          </div>
        </div>

        {/* Service mix donut */}
        <div className="rounded-lg border border-border bg-bg-base">
          <div className="px-4 py-2.5 border-b border-border">
            <h2 className="text-sm font-semibold text-app-primary">Mezcla de servicios</h2>
            <p className="text-[11px] text-app-muted">Distribución por tipo</p>
          </div>
          <div className="p-3">
            <ServiceMixChart data={serviceMixData} />
            <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
              {serviceMixData.map((s) => (
                <div key={s.type} className="flex items-center gap-1.5 text-[11px] text-app-muted">
                  <span className={`h-2 w-2 rounded-full ${TYPE_DOT[s.type] ?? "bg-[var(--chart-5)]"}`} />
                  {s.label} <span className="font-semibold text-app-primary">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts row 2: lead funnel + upcoming reminders */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Lead funnel */}
        <div className="rounded-lg border border-border bg-bg-base">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold text-app-primary">Embudo de leads</h2>
              <p className="text-[11px] text-app-muted">{totalLeads} leads · {convRate}% de conversión</p>
            </div>
            <Link href="/leads" className="text-xs text-brand-primary hover:underline flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" /> Ver leads
            </Link>
          </div>
          <div className="p-3">
            <LeadFunnelChart data={funnelData} />
          </div>
        </div>

        {/* Upcoming reminders */}
        <div className="rounded-lg border border-border bg-bg-base">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
            <h2 className="text-sm font-semibold text-app-primary">Próximos mantenimientos</h2>
            {overdueCount > 0 && (
              <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[10px] font-semibold text-danger">
                {overdueCount} vencido{overdueCount > 1 ? "s" : ""}
              </span>
            )}
            <Link href="/crm/seguimientos" className="text-xs text-brand-primary hover:underline ml-auto">
              Ver todos
            </Link>
          </div>

          {pendingReminders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <CheckCircle2 className="h-8 w-8 text-success mb-2" />
              <p className="text-xs font-medium text-app-primary">Al día con todos los seguimientos</p>
              <p className="text-[10px] text-app-muted mt-1">
                Registra servicios en el CRM para generar recordatorios automáticos.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {pendingReminders.map((r) => (
                <div key={r.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-bg-subtle">
                  <div className="min-w-0 pr-4">
                    <Link
                      href={`/crm/clientes/${r.client.id}`}
                      className="text-sm font-medium text-app-primary hover:text-brand-primary truncate block"
                    >
                      {r.client.name}
                    </Link>
                    <p className="text-[11px] text-app-muted">
                      {format(new Date(r.dueDate), "dd MMM yyyy", { locale: es })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <ReminderBadge dueDate={new Date(r.dueDate)} status={r.status} />
                    <ReminderActions id={r.id} status={r.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick access */}
      <div className="rounded-lg border border-border bg-bg-base">
        <div className="px-4 py-2.5 border-b border-border">
          <h2 className="text-sm font-semibold text-app-primary">Acceso rápido</h2>
        </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: "Nuevo cliente",  href: "/crm/clientes/new",  emoji: "👤" },
            { label: "Ver clientes",   href: "/crm/clientes",      emoji: "👥" },
            { label: "Seguimientos",   href: "/crm/seguimientos",  emoji: "🔔" },
            { label: "Portafolio",     href: "/portfolio",          emoji: "🖼️" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2.5 text-sm text-app-primary hover:bg-bg-subtle hover:border-app-border-focus transition-colors"
            >
              <span>{item.emoji}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
