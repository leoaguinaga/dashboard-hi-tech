# Módulo: Home / KPIs

Página de inicio del dashboard. Muestra el estado del negocio de un vistazo.

## KPIs principales (primera fila — stat cards)

| KPI | Descripción | Cómo se calcula |
|---|---|---|
| Ingresos del mes | Suma de trabajos facturados en el mes actual | `SUM(jobs.amount) WHERE month = current` |
| Trabajos completados | Cantidad de servicios terminados en el mes | `COUNT(jobs) WHERE status = COMPLETED` |
| Clientes nuevos | Clientes adquiridos en el mes | `COUNT(clients) WHERE createdAt = current month` |
| CAC | Costo de adquisición por cliente | `ad_spend / new_clients` (cruza con Google Ads) |

## KPIs secundarios (segunda fila)

| KPI | Descripción |
|---|---|
| Valor promedio por trabajo | `AVG(jobs.amount)` |
| Tasa de conversión | `closed_jobs / total_leads * 100` |
| Pipeline activo | Leads en estado pendiente de cierre |
| Facturas pendientes | Monto total sin cobrar |

## Gráficos

1. **Ingresos por mes** — line chart, últimos 6 meses.
2. **Trabajos por tipo** — donut chart: instalación, mantenimiento, reparación.
3. **Clientes por canal** — bar chart: Google Ads, referido, orgánico, directo.

## Componentes UI

```
<StatsRow />          ← 4 stat cards top
<SecondaryStats />    ← 4 stats compactos
<RevenueChart />      ← recharts LineChart
<JobTypesChart />     ← recharts PieChart
<ChannelChart />      ← recharts BarChart
<RecentActivity />    ← lista de últimas 5 acciones (jobs, clientes nuevos)
```

## Schema Prisma relevante

```prisma
model Job {
  id          String   @id @default(cuid())
  clientId    String
  type        JobType  // INSTALLATION | MAINTENANCE | REPAIR
  status      JobStatus // PENDING | IN_PROGRESS | COMPLETED | CANCELLED
  amount      Float
  completedAt DateTime?
  createdAt   DateTime @default(now())

  client Client @relation(fields: [clientId], references: [id])
}

enum JobType {
  INSTALLATION
  MAINTENANCE
  REPAIR
}

enum JobStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```
