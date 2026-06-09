"use client"

import { useTransition } from "react"
import { disconnectAds } from "@/lib/actions/ads"
import { useRouter } from "next/navigation"

export function DisconnectButton() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleDisconnect() {
    if (!confirm("¿Desconectar la cuenta de Google Ads? Los datos sincronizados se conservan.")) return
    startTransition(async () => {
      await disconnectAds()
      router.refresh()
    })
  }

  return (
    <button
      onClick={handleDisconnect}
      disabled={isPending}
      className="text-xs text-app-muted hover:text-danger transition-colors disabled:opacity-50"
    >
      {isPending ? "Desconectando..." : "Desconectar cuenta"}
    </button>
  )
}
