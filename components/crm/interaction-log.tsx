"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { createInteraction, deleteInteraction } from "@/lib/actions/crm"
import { Button } from "@/components/ui/button"
import { Input }  from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Phone, MessageCircle, MapPin, Mail, StickyNote, Trash2, Plus } from "lucide-react"

export interface InteractionItem {
  id: string
  type: string
  note: string
  createdAt: string | Date
}

const TYPE_META: Record<string, { label: string; icon: React.ElementType; class: string }> = {
  CALL:     { label: "Llamada",  icon: Phone,         class: "text-blue-600 bg-blue-50" },
  WHATSAPP: { label: "WhatsApp", icon: MessageCircle, class: "text-[#25D366] bg-[#25D366]/10" },
  VISIT:    { label: "Visita",   icon: MapPin,        class: "text-violet-600 bg-violet-50" },
  EMAIL:    { label: "Correo",   icon: Mail,          class: "text-orange-600 bg-orange-50" },
  NOTE:     { label: "Nota",     icon: StickyNote,    class: "text-app-muted bg-bg-muted" },
}

export function InteractionLog({
  clientId, interactions,
}: { clientId: string; interactions: InteractionItem[] }) {
  const [type, setType]       = useState("NOTE")
  const [loading, setLoading] = useState(false)
  const [isDeleting, startDelete] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)
  const router  = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    fd.set("clientId", clientId)
    fd.set("type", type)
    try {
      await createInteraction(fd)
      formRef.current?.reset()
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-border bg-bg-base">
      <div className="px-4 py-2.5 border-b border-border">
        <h2 className="text-xs font-semibold text-app-muted uppercase tracking-wide">
          Bitácora de contacto
        </h2>
      </div>

      {/* Add form */}
      <form ref={formRef} onSubmit={handleSubmit} className="flex gap-2 px-4 py-3 border-b border-border">
        <Select value={type} onValueChange={(v) => setType(v ?? "NOTE")}>
          <SelectTrigger className="h-8 w-32 text-sm shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(TYPE_META).map(([value, m]) => (
              <SelectItem key={value} value={value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          name="note" required placeholder="Registrar contacto o nota..."
          className="h-8 text-sm flex-1"
        />
        <Button type="submit" size="sm" disabled={loading} className="shrink-0">
          <Plus className="h-3.5 w-3.5 mr-1" />
          {loading ? "..." : "Añadir"}
        </Button>
      </form>

      {/* Timeline */}
      {interactions.length === 0 ? (
        <p className="px-4 py-5 text-xs text-app-muted">
          Sin interacciones registradas. Anota llamadas, visitas o mensajes para llevar el historial.
        </p>
      ) : (
        <div className="divide-y divide-border">
          {interactions.map((it) => {
            const meta = TYPE_META[it.type] ?? TYPE_META.NOTE
            const Icon = meta.icon
            return (
              <div key={it.id} className="group flex items-start gap-3 px-4 py-2.5">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${meta.class}`}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-app-primary break-words">{it.note}</p>
                  <p className="text-[10px] text-app-muted mt-0.5">
                    {meta.label} · {format(new Date(it.createdAt), "dd MMM yyyy, HH:mm", { locale: es })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    startDelete(async () => {
                      await deleteInteraction(it.id)
                      router.refresh()
                    })
                  }
                  disabled={isDeleting}
                  title="Eliminar"
                  className="opacity-0 group-hover:opacity-100 inline-flex h-6 w-6 items-center justify-center rounded text-app-muted hover:text-danger hover:bg-danger/5 transition-all disabled:opacity-50 shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
