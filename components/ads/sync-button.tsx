"use client"

import { useState, useTransition } from "react"
import { syncAds } from "@/lib/actions/ads"
import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SyncButton() {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  function handleSync() {
    setResult(null)
    startTransition(async () => {
      try {
        const r = await syncAds()
        setResult({
          ok: true,
          message: `${r.campaigns} campaña${r.campaigns !== 1 ? "s" : ""}, ${r.metrics} registros sincronizados.`,
        })
      } catch (e: unknown) {
        setResult({
          ok: false,
          message: e instanceof Error ? e.message : "Error al sincronizar.",
        })
      }
    })
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Button size="sm" variant="outline" disabled={isPending} onClick={handleSync}>
        <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isPending ? "animate-spin" : ""}`} />
        {isPending ? "Sincronizando..." : "Sincronizar ahora"}
      </Button>

      {result && (
        <span className={`flex items-center gap-1.5 text-xs ${result.ok ? "text-success" : "text-danger"}`}>
          {result.ok
            ? <CheckCircle2 className="h-3.5 w-3.5" />
            : <AlertCircle  className="h-3.5 w-3.5" />}
          {result.message}
        </span>
      )}
    </div>
  )
}
