"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"

const ROUTE_MAP: Record<string, string> = {
  "leads": "Leads",
  "historial": "Historial",
  "crm": "CRM",
  "calendario": "Calendario",
  "clientes": "Clientes",
  "new": "Nuevo Cliente",
  "seguimientos": "Seguimientos",
  "services": "Servicios",
  "ads": "Google Ads",
  "portfolio": "Portafolio",
}

export function Breadcrumb() {
  const pathname = usePathname()

  if (pathname === "/") {
    return (
      <div className="flex items-center text-xs text-app-muted">
        <span className="font-medium">Inicio</span>
      </div>
    )
  }

  const segments = pathname.split("/").filter(Boolean)

  return (
    <nav className="flex items-center space-x-1.5 text-xs text-app-muted">
      {/* Home link */}
      <Link
        href="/"
        className="flex items-center hover:text-brand-primary transition-colors font-medium"
      >
        <span>Inicio</span>
      </Link>

      {segments.map((segment, index) => {
        const url = `/${segments.slice(0, index + 1).join("/")}`
        const isLast = index === segments.length - 1

        // Map segment name to human-readable label
        let label = ROUTE_MAP[segment] || segment

        // Detect dynamic CUID or DB ID (e.g. cmqgwmz2m00007zyk81nhwnvn)
        if (segment.length >= 10 && (segment.startsWith("c") || /^[0-9a-fA-F-]+$/.test(segment))) {
          // If the parent was "clientes", label it as "Detalle Cliente", else "Detalle"
          const parent = segments[index - 1]
          label = parent === "clientes" ? "Detalle Cliente" : "Detalle"
        }

        return (
          <React.Fragment key={url}>
            <ChevronRight className="h-3 w-3 text-app-disabled shrink-0" />
            {isLast ? (
              <span className="font-semibold text-app-primary truncate max-w-[120px] sm:max-w-none">
                {label}
              </span>
            ) : (
              <Link
                href={url}
                className="hover:text-brand-primary transition-colors font-medium truncate max-w-[100px] sm:max-w-none"
              >
                {label}
              </Link>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
