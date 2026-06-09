import React from "react"
import { cn } from "@/lib/utils"

const CONFIG: Record<string, { label: string; className: string }> = {
  landing:  { label: "Landing",  className: "bg-blue-50 text-blue-700 border-blue-200" },
  referral: { label: "Referido", className: "bg-green-50 text-green-700 border-green-200" },
  phone:    { label: "Teléfono", className: "bg-amber-50 text-amber-700 border-amber-200" },
  manual:   { label: "Manual",   className: "bg-gray-50 text-gray-700 border-gray-200" },
}

export function ChannelBadge({ channel }: { channel: string; source?: never }): React.ReactElement
export function ChannelBadge({ source }: { source: string; channel?: never }): React.ReactElement
export function ChannelBadge({ channel, source }: { channel?: string; source?: string }) {
  const key = channel ?? source ?? ""
  const cfg = CONFIG[key] ?? { label: key, className: "bg-gray-50 text-gray-600 border-gray-200" }
  return (
    <span className={cn("inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-medium", cfg.className)}>
      {cfg.label}
    </span>
  ) as React.ReactElement
}
