import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { ProjectForm } from "@/components/portfolio/project-form"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params

  const [p, clients] = await Promise.all([
    prisma.project.findUnique({ where: { id } }),
    prisma.client.findMany({
      select:  { id: true, name: true, phone: true },
      orderBy: { name: "asc" },
    }),
  ])
  if (!p) notFound()

  const project = {
    id:           p.id,
    title:        p.title,
    description:  p.description,
    serviceType:  p.serviceType,
    city:         p.city,
    neighborhood: p.neighborhood,
    serviceDate:  p.serviceDate,
    images:       JSON.parse(p.images || "[]") as string[],
    tags:         JSON.parse(p.tags   || "[]") as string[],
    reviewAuthor: p.reviewAuthor,
    reviewRating: p.reviewRating,
    reviewText:   p.reviewText,
    published:    p.published,
    clientId:     p.clientId,
  }

  return (
    <div className="space-y-4">
      <div>
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-1 text-xs text-app-muted hover:text-app-primary mb-3"
        >
          <ChevronLeft className="h-3 w-3" />
          Volver al portafolio
        </Link>
        <h1 className="text-xl font-semibold">Editar proyecto</h1>
        <p className="text-xs text-app-muted truncate max-w-lg">{p.title}</p>
      </div>

      <div className="rounded-lg border border-border p-5 bg-bg-base">
        <ProjectForm project={project} clients={clients} />
      </div>
    </div>
  )
}
