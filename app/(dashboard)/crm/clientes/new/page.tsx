import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { NewClientForm } from "@/components/crm/new-client-form"

export default function NewClientPage() {
  return (
    <div className="space-y-4">
      <div>
        <Link
          href="/crm/clientes"
          className="inline-flex items-center gap-1 text-xs text-app-muted hover:text-app-primary mb-3"
        >
          <ChevronLeft className="h-3 w-3" />
          Volver a clientes
        </Link>
        <h1 className="text-xl font-semibold">Nuevo cliente</h1>
        <p className="text-xs text-app-muted">Registra un nuevo cliente en el CRM.</p>
      </div>

      <div className="rounded-lg border border-border p-5 bg-bg-base max-w-lg">
        <NewClientForm />
      </div>
    </div>
  )
}
