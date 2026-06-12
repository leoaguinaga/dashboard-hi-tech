"use client"

import { useState, useTransition } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Variant = "danger" | "default"

export interface ConfirmDialogProps {
  /** Element that opens the dialog. Must be a focusable trigger (button, etc.). */
  trigger: React.ReactElement
  title: string
  description?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: Variant
  /** Async action to run on confirm. Dialog closes after it resolves. */
  onConfirm: () => void | Promise<void>
  /** Optional disabled state for the trigger element. */
  disabled?: boolean
}

/**
 * Reusable confirmation dialog. Wraps a trigger and shows a confirm/cancel modal.
 * Use for destructive or irreversible actions (delete, disconnect, etc.).
 */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "danger",
  onConfirm,
  disabled,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleConfirm() {
    startTransition(async () => {
      await onConfirm()
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} disabled={disabled} />
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-xs">{description}</DialogDescription>
          )}
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={pending}
            onClick={handleConfirm}
            className={cn(
              variant === "danger" &&
                "bg-danger text-white hover:bg-danger/90 focus-visible:ring-danger/40",
            )}
          >
            {pending ? "..." : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
