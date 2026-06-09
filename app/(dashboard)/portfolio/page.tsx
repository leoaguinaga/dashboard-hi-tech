import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import Link from "next/link"
import { Briefcase, ExternalLink, Star, MapPin } from "lucide-react"
import { TogglePublished } from "@/components/portfolio/toggle-published"
import { DeleteProject } from "@/components/portfolio/delete-project"

const SERVICE_BADGE: Record<string, string> = {
  "AC Services": "bg-sky-50 text-sky-700",
  "Heating Services": "bg-orange-50 text-orange-700",
  "Duct Cleaning": "bg-slate-100 text-slate-600",
  "Smart Thermostat": "bg-emerald-50 text-emerald-700",
  "Preventive Maintenance": "bg-violet-50 text-violet-700",
  "Emergency Support": "bg-red-50 text-red-700",
}

export default async function PortfolioPage() {
  const projects = await prisma.project.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { client: { select: { id: true, name: true } } },
  })

  const published = projects.filter((p) => p.published).length
  const drafts = projects.length - published

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Portafolio</h1>
          <p className="text-xs text-app-muted">
            {published} publicado{published !== 1 ? "s" : ""}
            {drafts > 0 ? ` · ${drafts} borrador${drafts !== 1 ? "es" : ""}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/api/portfolio?published=true"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-app-muted hover:bg-bg-muted transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Ver API
          </a>
          <Link
            href="/portfolio/new"
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark transition-colors"
          >
            + Nuevo proyecto
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg-subtle">
              <th className="px-3 py-2 text-left text-xs font-medium text-app-muted">Proyecto</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-app-muted hidden sm:table-cell">Servicio</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-app-muted hidden md:table-cell">Ubicación</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-app-muted hidden lg:table-cell">Fecha</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-app-muted hidden lg:table-cell">Reseña</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-app-muted hidden xl:table-cell">Cliente</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-app-muted">Estado</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-app-muted">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {projects.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-12 text-center">
                  <Briefcase className="h-8 w-8 mx-auto mb-2 text-app-muted/40" />
                  <p className="text-xs text-app-muted">Sin proyectos todavía</p>
                  <Link href="/portfolio/new" className="text-xs text-brand-primary hover:underline mt-1 inline-block">
                    Crear el primero →
                  </Link>
                </td>
              </tr>
            )}
            {projects.map((p) => {
              const images = JSON.parse(p.images || "[]") as string[]
              const thumb = images[0]
              const location = [p.neighborhood, p.city].filter(Boolean).join(", ")

              return (
                <tr key={p.id} className="hover:bg-bg-subtle transition-colors">
                  {/* Thumbnail + title */}
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-3">
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumb} alt={p.title}
                          className="h-10 w-14 rounded object-cover shrink-0 border border-border"
                        />
                      ) : (
                        <div className="h-10 w-14 rounded bg-bg-muted border border-border flex items-center justify-center shrink-0">
                          <Briefcase className="h-4 w-4 text-app-muted/50" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-app-primary truncate">{p.title}</p>
                        <p className="text-[11px] text-app-muted">
                          {images.length} foto{images.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-3 py-2.5 hidden sm:table-cell">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${SERVICE_BADGE[p.serviceType] ?? "bg-bg-muted text-app-muted"}`}>
                      {p.serviceType}
                    </span>
                  </td>

                  <td className="px-3 py-2.5 hidden md:table-cell">
                    {location ? (
                      <span className="inline-flex items-center gap-1 text-xs text-app-muted">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {location}
                      </span>
                    ) : (
                      <span className="text-[11px] text-app-muted/50">—</span>
                    )}
                  </td>

                  <td className="px-3 py-2.5 hidden lg:table-cell text-xs text-app-muted whitespace-nowrap">
                    {format(new Date(p.serviceDate), "MMM yyyy")}
                  </td>

                  <td className="px-3 py-2.5 hidden lg:table-cell">
                    {p.reviewText ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-warning">
                        <Star className="h-3 w-3 fill-warning" />
                        {p.reviewRating ?? 5}/5
                      </span>
                    ) : (
                      <span className="text-[11px] text-app-muted/50">Sin reseña</span>
                    )}
                  </td>

                  <td className="px-3 py-2.5 hidden xl:table-cell">
                    {p.client ? (
                      <Link
                        href={`/crm/clientes/${p.client.id}`}
                        className="text-xs text-brand-primary hover:underline truncate max-w-[120px] block"
                      >
                        {p.client.name}
                      </Link>
                    ) : (
                      <span className="text-[11px] text-app-muted/50">—</span>
                    )}
                  </td>

                  <td className="px-3 py-2.5">
                    <TogglePublished id={p.id} published={p.published} />
                  </td>

                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/portfolio/${p.id}/edit`}
                        className="text-xs text-brand-primary hover:underline"
                      >
                        Editar
                      </Link>
                      <DeleteProject id={p.id} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Info note */}
      <p className="text-[11px] text-app-muted">
        💡 Los proyectos publicados aparecen automáticamente en la landing page vía{" "}
        <code className="font-mono bg-bg-muted px-1 rounded">/api/portfolio?published=true</code>
      </p>
    </div>
  )
}
