"use client"

import { useTransition } from "react"
import { setServicePaymentStatus } from "@/lib/actions/crm"
import { CheckCircle2, Clock } from "lucide-react"

/** Badge clickeable que alterna el estado de cobro de un servicio (PAID ⇄ PENDING). */
export function PaymentStatusToggle({ id, paymentStatus }: { id: string; paymentStatus: string }) {
  const [isPending, startTransition] = useTransition()
  const paid = paymentStatus === "PAID"

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(() => setServicePaymentStatus(id, paid ? "PENDING" : "PAID"))
      }
      title={paid ? "Cobrado — clic para marcar pendiente" : "Pendiente de cobro — clic para marcar cobrado"}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors disabled:opacity-50 ${
        paid
          ? "bg-success/10 text-success border-success/20 hover:bg-success/20"
          : "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20"
      }`}
    >
      {paid ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
      {paid ? "Cobrado" : "Pendiente"}
    </button>
  )
}
