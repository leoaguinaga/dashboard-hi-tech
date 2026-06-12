"use client"

import { disconnectAds } from "@/lib/actions/ads"
import { useRouter } from "next/navigation"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export function DisconnectButton() {
  const router = useRouter()

  async function handleDisconnect() {
    await disconnectAds()
    router.refresh()
  }

  return (
    <ConfirmDialog
      title="¿Desconectar cuenta de Google Ads?"
      description="Los datos sincronizados se conservan. Podrás reconectar la cuenta más tarde."
      confirmLabel="Desconectar"
      onConfirm={handleDisconnect}
      trigger={
        <button
          type="button"
          className="text-xs text-app-muted hover:text-danger transition-colors disabled:opacity-50"
        >
          Desconectar cuenta
        </button>
      }
    />
  )
}
