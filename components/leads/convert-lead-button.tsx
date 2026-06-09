"use client"

import { useTransition } from "react"
import { convertLeadToClient } from "@/lib/actions/leads"
import { UserPlus } from "lucide-react"

interface Props {
  leadId:      string
  clientId?:   string // ya convertido → link directo
}

export function ConvertLeadButton({ leadId, clientId }: Props) {
  const [pending, startTransition] = useTransition()

  // Ya convertido: link al perfil del cliente
  if (clientId) {
    return (
      <a
        href={`/crm/clientes/${clientId}`}
        className="inline-flex items-center gap-1 text-[11px] font-medium text-success hover:underline"
      >
        <UserPlus className="h-3 w-3" />
        Ver cliente
      </a>
    )
  }

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(() => convertLeadToClient(leadId))
      }
      className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-primary hover:text-brand-dark disabled:opacity-50 transition-colors"
      title="Convertir este lead en cliente"
    >
      <UserPlus className="h-3 w-3" />
      {pending ? "Creando..." : "→ Cliente"}
    </button>
  )
}
