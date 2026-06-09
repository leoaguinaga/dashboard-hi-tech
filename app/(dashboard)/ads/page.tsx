import { prisma } from "@/lib/prisma"
import { isConnected } from "@/lib/google-ads"
import { format, subDays } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import {
  DollarSign, MousePointerClick, TrendingUp,
  Users, Percent, Zap, AlertCircle, CheckCircle2,
} from "lucide-react"
import { SyncButton }        from "@/components/ads/sync-button"
import { DisconnectButton }  from "@/components/ads/disconnect-button"
import { SpendChart, type SpendDataPoint }           from "@/components/ads/spend-chart"
import { ConversionsChart, type ConversionDataPoint } from "@/components/ads/conversions-chart"

interface Props {
  searchParams: Promise<{ days?: string; connected?: string; error?: string }>
}

const DAYS_OPTIONS = [
  { value: "7",  label: "7 días" },
  { value: "30", label: "30 días" },
  { value: "90", label: "90 días" },
]

const STATUS_LABELS: Record<string, string> = {
  ENABLED:  "Activa",
  PAUSED:   "Pausada",
  REMOVED:  "Eliminada",
}

export default async function AdsPage({ searchParams }: Props) {
  const { days: daysParam, connected, error } = await searchParams
  const days    = parseInt(daysParam ?? "30")
  const since   = subDays(new Date(), days)
  const connected_ = await isConnected()

  /* ─── Aggregate metrics from DB ───────────────────────────────── */

  const [dailyMetrics, campaignTotals, newAdsClients, latestMetric] = await Promise.all([
    // Daily aggregates for chart
    prisma.adMetric.groupBy({
      by:      ["date"],
      _sum:    { costMicros: true, clicks: true, impressions: true, conversions: true },
      where:   { date: { gte: since } },
      orderBy: { date: "asc" },
    }),

    // Per-campaign totals
    prisma.adMetric.groupBy({
      by:      ["campaignId"],
      _sum:    { costMicros: true, clicks: true, impressions: true, conversions: true },
      where:   { date: { gte: since } },
    }),

    // New clients converted from leads in same period (for CAC)
    prisma.client.count({
      where: { createdAt: { gte: since } },
    }),

    // When was the last sync?
    prisma.adMetric.findFirst({ orderBy: { date: "desc" }, select: { date: true } }),
  ])

  // Campaign names
  const campaignIds = campaignTotals.map((c) => c.campaignId)
  const campaigns   = await prisma.adCampaign.findMany({
    where: { id: { in: campaignIds } },
  })
  const campMap = Object.fromEntries(campaigns.map((c) => [c.id, c]))

  /* ─── KPI calculations ─────────────────────────────────────────── */

  const totalCostMicros  = dailyMetrics.reduce((s, d) => s + (d._sum.costMicros  ?? 0), 0)
  const totalClicks      = dailyMetrics.reduce((s, d) => s + (d._sum.clicks      ?? 0), 0)
  const totalImpressions = dailyMetrics.reduce((s, d) => s + (d._sum.impressions ?? 0), 0)
  const totalConversions = dailyMetrics.reduce((s, d) => s + (d._sum.conversions ?? 0), 0)

  const totalSpend = totalCostMicros / 1_000_000
  const ctr        = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
  const cpc        = totalClicks > 0 ? totalSpend / totalClicks : 0
  const cpa        = totalConversions > 0 ? totalSpend / totalConversions : 0
  const cac        = newAdsClients > 0 ? totalSpend / newAdsClients : null

  /* ─── Chart data ───────────────────────────────────────────────── */

  const spendChartData: SpendDataPoint[] = dailyMetrics.map((d) => ({
    date:        format(new Date(d.date), "dd MMM", { locale: es }),
    spend:       (d._sum.costMicros ?? 0) / 1_000_000,
    clicks:      d._sum.clicks      ?? 0,
    conversions: d._sum.conversions ?? 0,
  }))

  const convChartData: ConversionDataPoint[] = campaignTotals.map((ct) => {
    const camp  = campMap[ct.campaignId]
    const spend = (ct._sum.costMicros ?? 0) / 1_000_000
    const clicks = ct._sum.clicks ?? 0
    return {
      name:        (camp?.name ?? "Campaña").slice(0, 20),
      spend,
      conversions: ct._sum.conversions ?? 0,
      cpc:         clicks > 0 ? spend / clicks : 0,
    }
  })

  const hasData = dailyMetrics.length > 0

  /* ─── Render ───────────────────────────────────────────────────── */

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold">Google Ads</h1>
          <p className="text-xs text-app-muted">
            Seguimiento de campañas y métricas de adquisición.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {connected_ ? (
            <>
              <span className="flex items-center gap-1.5 text-xs text-success">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Conectado
              </span>
              <SyncButton />
              <DisconnectButton />
            </>
          ) : (
            <a
              href="/api/ads/auth"
              className="inline-flex items-center gap-1.5 rounded-md bg-brand-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark transition-colors"
            >
              <Zap className="h-3.5 w-3.5" />
              Conectar Google Ads
            </a>
          )}
        </div>
      </div>

      {/* OAuth result banners */}
      {connected === "1" && (
        <div className="rounded-md bg-success/10 border border-success/20 px-3 py-2 text-xs text-success flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Cuenta de Google Ads conectada correctamente. Pulsa "Sincronizar ahora" para cargar los datos.
        </div>
      )}
      {error && (
        <div className="rounded-md bg-danger/10 border border-danger/20 px-3 py-2 text-xs text-danger flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error === "missing_credentials"
            ? "Faltan las variables GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET en el servidor."
            : error === "token_exchange"
            ? "No se pudo completar la autorización. Asegúrate de que el Developer Token esté aprobado."
            : `Error: ${error}`}
        </div>
      )}

      {/* Not connected — setup guide */}
      {!connected_ && (
        <div className="rounded-lg border border-border p-5 bg-bg-base max-w-xl">
          <h2 className="text-sm font-semibold mb-3">Configurar Google Ads</h2>
          <ol className="space-y-3 text-xs text-app-muted list-none">
            {[
              { n: 1, text: "Crea un proyecto en Google Cloud Console y habilita la Google Ads API." },
              { n: 2, text: "Genera credenciales OAuth2 (tipo \"Web application\") y agrega la URI de callback." },
              { n: 3, text: <span>Agrega en <code className="font-mono bg-bg-muted px-1 rounded">.env.local</code>: <code className="font-mono bg-bg-muted px-1 rounded">GOOGLE_CLIENT_ID</code>, <code className="font-mono bg-bg-muted px-1 rounded">GOOGLE_CLIENT_SECRET</code>, <code className="font-mono bg-bg-muted px-1 rounded">GOOGLE_ADS_DEVELOPER_TOKEN</code> y <code className="font-mono bg-bg-muted px-1 rounded">GOOGLE_ADS_CUSTOMER_ID</code>.</span> },
              { n: 4, text: <>Solicita el Developer Token en Google Ads → Herramientas → API Center. La aprobación puede tomar varios días.</> },
              { n: 5, text: "Pulsa \"Conectar Google Ads\" para iniciar el flujo OAuth2." },
            ].map(({ n, text }) => (
              <li key={n} className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-light text-[10px] font-bold text-brand-primary">
                  {n}
                </span>
                <span className="pt-0.5">{text}</span>
              </li>
            ))}
          </ol>

          <div className="mt-4 rounded-md bg-bg-subtle border border-border p-3 font-mono text-[10px] text-app-muted">
            <p className="text-app-primary font-semibold mb-1"># .env.local</p>
            <p>GOOGLE_CLIENT_ID=</p>
            <p>GOOGLE_CLIENT_SECRET=</p>
            <p>GOOGLE_ADS_DEVELOPER_TOKEN=</p>
            <p>GOOGLE_ADS_CUSTOMER_ID=         <span className="text-app-muted"># sin guiones</span></p>
          </div>

          <p className="text-[10px] text-app-muted mt-3">
            URI de callback para Google Cloud Console:{" "}
            <code className="font-mono bg-bg-muted px-1 rounded">
              {process.env.BETTER_AUTH_URL ?? "http://localhost:3000"}/api/ads/callback
            </code>
          </p>
        </div>
      )}

      {/* Connected — dashboard */}
      {connected_ && (
        <>
          {/* Date range + last sync */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex gap-1 border-b border-border">
              {DAYS_OPTIONS.map((opt) => {
                const active = String(days) === opt.value || (!daysParam && opt.value === "30")
                return (
                  <Link
                    key={opt.value}
                    href={`/ads?days=${opt.value}`}
                    className={`px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors ${
                      active
                        ? "border-brand-primary text-brand-primary"
                        : "border-transparent text-app-muted hover:text-app-primary"
                    }`}
                  >
                    {opt.label}
                  </Link>
                )
              })}
            </div>
            {latestMetric && (
              <p className="text-[11px] text-app-muted">
                Último dato: {format(new Date(latestMetric.date), "dd MMM yyyy", { locale: es })}
              </p>
            )}
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { title: "Gasto total",     value: `$${totalSpend.toFixed(2)}`,  icon: DollarSign,       sub: `${days}d` },
              { title: "Clicks",          value: totalClicks.toLocaleString(), icon: MousePointerClick, sub: `CTR ${ctr.toFixed(2)}%` },
              { title: "Conversiones",    value: totalConversions.toFixed(1),  icon: TrendingUp,        sub: `CPA $${cpa.toFixed(2)}` },
              { title: "CAC Google Ads",  value: cac !== null ? `$${cac.toFixed(2)}` : "—", icon: Users, sub: `${newAdsClients} clientes vía Ads` },
            ].map((k) => {
              const Icon = k.icon
              return (
                <div key={k.title} className="rounded-lg border border-border bg-bg-subtle p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-app-muted">{k.title}</span>
                    <Icon className="h-4 w-4 text-brand-primary" />
                  </div>
                  <p className="text-2xl font-bold text-app-primary">{k.value}</p>
                  <p className="text-[10px] text-app-muted mt-0.5">{k.sub}</p>
                </div>
              )
            })}
          </div>

          {/* Extra metrics row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { title: "Impresiones",   value: totalImpressions.toLocaleString(), icon: Percent },
              { title: "CPC promedio",  value: `$${cpc.toFixed(3)}`,              icon: MousePointerClick },
              { title: "Clientes/Ads",  value: newAdsClients,                     icon: Users },
            ].map((k) => {
              const Icon = k.icon
              return (
                <div key={k.title} className="rounded-lg border border-border bg-bg-subtle p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-app-muted">{k.title}</span>
                    <Icon className="h-4 w-4 text-app-muted/60" />
                  </div>
                  <p className="text-xl font-bold text-app-primary">{k.value}</p>
                </div>
              )
            })}
          </div>

          {/* Charts */}
          {!hasData ? (
            <div className="rounded-lg border border-dashed border-border p-10 text-center">
              <Zap className="h-8 w-8 mx-auto mb-2 text-app-muted/40" />
              <p className="text-sm font-medium text-app-primary">Sin datos sincronizados</p>
              <p className="text-xs text-app-muted mt-1">
                Pulsa "Sincronizar ahora" para importar los datos de tus campañas.
              </p>
              <div className="mt-4">
                <SyncButton />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Spend trend */}
              <div className="rounded-lg border border-border bg-bg-base p-4">
                <h2 className="text-sm font-medium mb-3">Gasto y clicks diarios</h2>
                <div className="h-52">
                  <SpendChart data={spendChartData} />
                </div>
              </div>

              {/* Per-campaign */}
              <div className="rounded-lg border border-border bg-bg-base p-4">
                <h2 className="text-sm font-medium mb-3">Gasto y conversiones por campaña</h2>
                <div className="h-52">
                  <ConversionsChart data={convChartData} />
                </div>
              </div>
            </div>
          )}

          {/* Campaigns table */}
          {campaigns.length > 0 && (
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border bg-bg-subtle">
                <h2 className="text-sm font-medium">Campañas</h2>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-bg-subtle/50">
                    <th className="px-3 py-2 text-left text-xs font-medium text-app-muted">Campaña</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-app-muted">Estado</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-app-muted">Gasto</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-app-muted hidden sm:table-cell">Clicks</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-app-muted hidden md:table-cell">Impresiones</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-app-muted hidden md:table-cell">Conv.</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-app-muted hidden lg:table-cell">CPA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {campaignTotals.map((ct) => {
                    const camp      = campMap[ct.campaignId]
                    const spend     = (ct._sum.costMicros ?? 0) / 1_000_000
                    const clicks    = ct._sum.clicks      ?? 0
                    const impr      = ct._sum.impressions ?? 0
                    const conv      = ct._sum.conversions ?? 0
                    const campaCPA  = conv > 0 ? spend / conv : null

                    return (
                      <tr key={ct.campaignId} className="hover:bg-bg-subtle">
                        <td className="px-3 py-2.5 font-medium text-app-primary truncate max-w-[200px]">
                          {camp?.name ?? ct.campaignId}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium ${
                            camp?.status === "ENABLED"
                              ? "bg-success/10 text-success"
                              : "bg-bg-muted text-app-muted"
                          }`}>
                            {STATUS_LABELS[camp?.status ?? ""] ?? camp?.status ?? "—"}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right font-medium">${spend.toFixed(2)}</td>
                        <td className="px-3 py-2.5 text-right text-app-muted hidden sm:table-cell">{clicks.toLocaleString()}</td>
                        <td className="px-3 py-2.5 text-right text-app-muted hidden md:table-cell">{impr.toLocaleString()}</td>
                        <td className="px-3 py-2.5 text-right text-app-muted hidden md:table-cell">{conv.toFixed(1)}</td>
                        <td className="px-3 py-2.5 text-right text-app-muted hidden lg:table-cell">
                          {campaCPA !== null ? `$${campaCPA.toFixed(2)}` : "—"}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
