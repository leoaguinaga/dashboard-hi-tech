import React from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { DollarSign, Briefcase, Users, Percent, Bell, CheckCircle2 } from "lucide-react";
import { ReminderBadge }   from "@/components/crm/reminder-badge";
import { ReminderActions } from "@/components/crm/reminder-actions";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user    = session?.user;
  const now     = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalClients, newClientsThisMonth, pendingReminders] = await Promise.all([
    prisma.client.count(),
    prisma.client.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.reminder.findMany({
      where:   { status: "PENDING" },
      include: { client: { select: { id: true, name: true } } },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
  ]);

  const overdueCount = pendingReminders.filter(
    (r) => new Date(r.dueDate) < now
  ).length;

  const kpis = [
    {
      title:      "Ingresos del mes",
      value:      "$0",
      change:     "Sin datos aún",
      isPositive: true,
      icon:       DollarSign,
      muted:      true,
    },
    {
      title:      "Trabajos realizados",
      value:      "0",
      change:     "Sin datos aún",
      isPositive: true,
      icon:       Briefcase,
      muted:      true,
    },
    {
      title:      "Clientes nuevos",
      value:      String(newClientsThisMonth),
      change:     `${totalClients} total`,
      isPositive: true,
      icon:       Users,
    },
    {
      title:      "Recordatorios pendientes",
      value:      String(pendingReminders.length),
      change:     overdueCount > 0 ? `${overdueCount} vencido${overdueCount > 1 ? "s" : ""}` : "Al día",
      isPositive: overdueCount === 0,
      icon:       Bell,
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
            <div
              key={kpi.title}
              className={`rounded-lg border p-3 ${
                kpi.muted ? "border-border bg-bg-subtle opacity-60" : "border-border bg-bg-subtle"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-app-muted">{kpi.title}</span>
                <Icon className="h-4 w-4 text-brand-primary" />
              </div>
              <p className="text-2xl font-bold text-app-primary mt-1">{kpi.value}</p>
              <span className={`text-[10px] font-medium mt-0.5 inline-block ${kpi.isPositive ? "text-success" : "text-danger"}`}>
                {kpi.change}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bottom grid */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Upcoming reminders — real data */}
        <div className="rounded-lg border border-border bg-bg-base">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
            <h2 className="text-sm font-semibold text-app-primary">Próximos seguimientos</h2>
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

        {/* Quick access */}
        <div className="rounded-lg border border-border bg-bg-base">
          <div className="px-4 py-2.5 border-b border-border">
            <h2 className="text-sm font-semibold text-app-primary">Acceso rápido</h2>
          </div>
          <div className="p-4 grid grid-cols-2 gap-2">
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
    </div>
  );
}
