import { isConnected, getConnection } from "@/lib/google-ads"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { ArrowLeft, Zap, CheckCircle2, ExternalLink, Copy } from "lucide-react"
import { DisconnectButton } from "@/components/ads/disconnect-button"

export default async function AdsConnectPage() {
  const connected  = await isConnected()
  const connection = await getConnection()
  const callbackUrl = `${process.env.BETTER_AUTH_URL ?? "http://localhost:3000"}/api/ads/callback`

  return (
    <div className="max-w-2xl space-y-5">
      {/* Back */}
      <Link
        href="/ads"
        className="inline-flex items-center gap-1.5 text-xs text-app-muted hover:text-app-primary transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver a Google Ads
      </Link>

      <div>
        <h1 className="text-xl font-semibold">Configurar Google Ads</h1>
        <p className="text-xs text-app-muted mt-0.5">
          Conecta tu cuenta para importar métricas de campañas directamente.
        </p>
      </div>

      {/* Connection status */}
      {connected && connection ? (
        <div className="rounded-lg border border-success/30 bg-success/5 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
            <p className="text-sm font-medium text-success">Cuenta conectada</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-app-muted">
            <div>
              <p className="font-medium text-app-primary">Proveedor</p>
              <p className="font-mono">google-ads</p>
            </div>
            <div>
              <p className="font-medium text-app-primary">Última actualización</p>
              <p>
                {format(new Date(connection.updatedAt), "dd MMM yyyy HH:mm", { locale: es })}
              </p>
            </div>
            <div>
              <p className="font-medium text-app-primary">Token expira</p>
              <p>{format(new Date(connection.expiresAt), "dd MMM yyyy HH:mm", { locale: es })}</p>
            </div>
          </div>
          <div className="pt-1">
            <DisconnectButton />
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-bg-subtle p-4">
          <p className="text-sm text-app-muted mb-3">
            No hay ninguna cuenta de Google Ads conectada.
          </p>
          <a
            href="/api/ads/auth"
            className="inline-flex items-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark transition-colors"
          >
            <Zap className="h-4 w-4" />
            Conectar Google Ads
          </a>
        </div>
      )}

      {/* Setup steps */}
      <div className="rounded-lg border border-border bg-bg-base overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-bg-subtle">
          <h2 className="text-sm font-semibold">Guía de configuración</h2>
        </div>
        <div className="divide-y divide-border">
          {[
            {
              n:     1,
              title: "Proyecto en Google Cloud Console",
              body:  (
                <p className="text-xs text-app-muted leading-relaxed">
                  Ve a{" "}
                  <a
                    href="https://console.cloud.google.com/apis/library/googleads.googleapis.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-0.5 text-brand-primary hover:underline"
                  >
                    Google Cloud Console <ExternalLink className="h-3 w-3" />
                  </a>
                  {" "}y habilita la <strong>Google Ads API</strong>. Si no tienes proyecto, crea uno nuevo.
                </p>
              ),
            },
            {
              n:     2,
              title: "Crear credenciales OAuth2",
              body:  (
                <div className="space-y-2 text-xs text-app-muted leading-relaxed">
                  <p>
                    En el menú lateral selecciona <strong>APIs &amp; Services → Credentials → Create credentials → OAuth client ID</strong>.
                    Tipo: <strong>Web application</strong>.
                  </p>
                  <p>
                    Agrega la siguiente URI en <strong>Authorized redirect URIs</strong>:
                  </p>
                  <div className="flex items-center gap-2 bg-bg-subtle rounded px-3 py-2 font-mono text-[11px] border border-border">
                    <span className="flex-1 break-all">{callbackUrl}</span>
                    <Copy className="h-3.5 w-3.5 text-app-muted shrink-0" />
                  </div>
                </div>
              ),
            },
            {
              n:     3,
              title: "Variables de entorno",
              body:  (
                <div className="space-y-2 text-xs text-app-muted leading-relaxed">
                  <p>Agrega en <code className="font-mono bg-bg-muted px-1 rounded">.env.local</code>:</p>
                  <pre className="bg-bg-subtle rounded p-3 font-mono text-[10px] border border-border overflow-x-auto leading-5">
{`GOOGLE_CLIENT_ID=<tu-client-id>
GOOGLE_CLIENT_SECRET=<tu-client-secret>
GOOGLE_ADS_DEVELOPER_TOKEN=<token-de-ads>
GOOGLE_ADS_CUSTOMER_ID=<id-sin-guiones>`}
                  </pre>
                </div>
              ),
            },
            {
              n:     4,
              title: "Developer Token de Google Ads",
              body:  (
                <p className="text-xs text-app-muted leading-relaxed">
                  Inicia sesión en{" "}
                  <a
                    href="https://ads.google.com/aw/apicenter"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-0.5 text-brand-primary hover:underline"
                  >
                    Google Ads → API Center <ExternalLink className="h-3 w-3" />
                  </a>
                  . Solicita el Developer Token. Las cuentas en modo prueba solo pueden acceder a datos de una cuenta de prueba; para datos reales necesitas aprobación (tarda de 1 a 5 días hábiles).
                </p>
              ),
            },
            {
              n:     5,
              title: "Conectar cuenta",
              body:  (
                <p className="text-xs text-app-muted leading-relaxed">
                  Una vez configuradas las variables, pulsa <strong>Conectar Google Ads</strong> arriba.
                  Serás redirigido a Google para autorizar el acceso. Después sincroniza tus campañas desde el dashboard principal.
                </p>
              ),
            },
          ].map(({ n, title, body }) => (
            <div key={n} className="px-4 py-3 flex gap-4">
              <span className="flex h-5 w-5 shrink-0 mt-0.5 items-center justify-center rounded-full bg-brand-light text-[10px] font-bold text-brand-primary">
                {n}
              </span>
              <div className="space-y-1.5 flex-1 min-w-0">
                <p className="text-sm font-medium">{title}</p>
                {body}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Permissions note */}
      <div className="rounded-md bg-bg-subtle border border-border px-4 py-3 text-xs text-app-muted space-y-1">
        <p className="font-medium text-app-primary">Permisos solicitados</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li><code className="font-mono bg-bg-muted px-1 rounded">https://www.googleapis.com/auth/adwords</code> — lectura y escritura de campañas</li>
        </ul>
        <p>Solo se leen métricas. No se crean ni modifican campañas desde este dashboard.</p>
      </div>
    </div>
  )
}
