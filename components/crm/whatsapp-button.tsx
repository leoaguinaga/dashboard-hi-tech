import { MessageCircle } from "lucide-react"

interface Props {
  phone: string
  message?: string
  /** "button" = botón verde sólido, "icon" = solo ícono compacto */
  variant?: "button" | "icon"
  label?: string
}

/** Construye un deep-link a WhatsApp (wa.me) con un mensaje opcional prellenado. */
export function WhatsAppButton({ phone, message, variant = "button", label = "WhatsApp" }: Props) {
  const digits = phone.replace(/\D/g, "")
  if (!digits) return null

  const href = `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`

  if (variant === "icon") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title="Enviar WhatsApp"
        className="inline-flex h-6 w-6 items-center justify-center rounded text-[#25D366] hover:bg-[#25D366]/10 transition-colors"
      >
        <MessageCircle className="h-4 w-4" />
      </a>
    )
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-md bg-[#25D366] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1da851] transition-colors"
    >
      <MessageCircle className="h-3.5 w-3.5" />
      {label}
    </a>
  )
}
