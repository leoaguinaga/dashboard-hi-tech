"use client"

import Link from "next/link"
import { ImagePlus, ExternalLink } from "lucide-react"

interface Props {
  serviceRecordId: string
  clientId:        string
  projectId?:      string // ya promovido
  projectTitle?:   string
}

export function PromoteToPortfolioButton({ serviceRecordId, clientId, projectId, projectTitle }: Props) {
  // Ya tiene proyecto de portafolio → link al proyecto
  if (projectId) {
    return (
      <Link
        href={`/portfolio/${projectId}/edit`}
        className="inline-flex items-center gap-1 text-[11px] font-medium text-success hover:underline"
        title={projectTitle}
      >
        <ExternalLink className="h-3 w-3" />
        Ver portafolio
      </Link>
    )
  }

  // Aún no tiene proyecto → link al form de nuevo proyecto pre-cargado
  const params = new URLSearchParams({ serviceRecordId, clientId })
  return (
    <Link
      href={`/portfolio/new?${params.toString()}`}
      className="inline-flex items-center gap-1 text-[11px] font-medium text-app-muted hover:text-brand-primary transition-colors"
      title="Documentar en portafolio"
    >
      <ImagePlus className="h-3 w-3" />
      → Portafolio
    </Link>
  )
}
