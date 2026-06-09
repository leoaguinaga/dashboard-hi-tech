import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { ProjectForm } from "@/components/portfolio/project-form"
import { prisma } from "@/lib/prisma"

interface Props {
  searchParams: Promise<{ serviceRecordId?: string; clientId?: string }>
}

export default async function NewProjectPage({ searchParams }: Props) {
  const { serviceRecordId, clientId } = await searchParams

  const [clients, serviceRecord] = await Promise.all([
    prisma.client.findMany({
      select:  { id: true, name: true, phone: true },
      orderBy: { name: "asc" },
    }),
    serviceRecordId
      ? prisma.serviceRecord.findUnique({
          where:   { id: serviceRecordId },
          include: { client: { select: { id: true, name: true, city: true } } },
        })
      : null,
  ])

  // Pre-fill project data from the service record
  const prefill = serviceRecord
    ? {
        clientId:        serviceRecord.clientId,
        serviceRecordId: serviceRecord.id,
        serviceDate:     serviceRecord.serviceDate,
        city:            serviceRecord.client.city ?? "",
        // serviceType will be empty — user picks from the portfolio taxonomy
      }
    : clientId
      ? { clientId }
      : undefined

  return (
    <div className="space-y-4">
      <div>
        <Link
          href={serviceRecord ? `/crm/clientes/${serviceRecord.clientId}` : "/portfolio"}
          className="inline-flex items-center gap-1 text-xs text-app-muted hover:text-app-primary mb-3"
        >
          <ChevronLeft className="h-3 w-3" />
          {serviceRecord ? `Volver a ${serviceRecord.client.name}` : "Volver al portafolio"}
        </Link>
        <h1 className="text-xl font-semibold">Nuevo proyecto</h1>
        {serviceRecord && (
          <p className="text-xs text-brand-primary mt-0.5">
            Documentando servicio de {serviceRecord.client.name} ·{" "}
            {new Date(serviceRecord.serviceDate).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
          </p>
        )}
        <p className="text-xs text-app-muted">
          Completa los datos y sube las imágenes. Puedes publicarlo ahora o guardarlo como borrador.
        </p>
      </div>

      <div className="rounded-lg border border-border p-5 bg-bg-base">
        <ProjectForm clients={clients} prefill={prefill} />
      </div>
    </div>
  )
}
