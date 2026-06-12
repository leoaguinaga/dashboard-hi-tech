"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { addDays } from "date-fns"

/** Revalida todas las vistas que dependen de los datos del CRM. */
function revalidateCRM(clientId?: string) {
  if (clientId) revalidatePath(`/crm/clientes/${clientId}`)
  revalidatePath("/crm/clientes")
  revalidatePath("/crm/seguimientos")
  revalidatePath("/crm")
  revalidatePath("/")
}

/* ─── Client ────────────────────────────────────────────────────────────── */

export async function createClient(formData: FormData) {
  const name    = (formData.get("name")    as string).trim()
  const phone   = (formData.get("phone")   as string).trim()
  const email   = (formData.get("email")   as string)?.trim()  || null
  const address = (formData.get("address") as string)?.trim()  || null
  const source  = formData.get("source") as string
  const notes   = (formData.get("notes")   as string)?.trim()  || null
  const category = ((formData.get("category") as string) || "CLIENT") === "CONTACT" ? "CONTACT" : "CLIENT"

  const client = await prisma.client.create({
    data: { name, phone, email, address, source, notes, category },
  })

  redirect(`/crm/clientes/${client.id}`)
}

export async function updateClient(id: string, formData: FormData) {
  const name    = (formData.get("name")    as string).trim()
  const phone   = (formData.get("phone")   as string).trim()
  const email   = (formData.get("email")   as string)?.trim()  || null
  const address = (formData.get("address") as string)?.trim()  || null
  const source = formData.get("source") as string
  const notes   = (formData.get("notes")   as string)?.trim()  || null

  await prisma.client.update({
    where: { id },
    data: { name, phone, email, address, source, notes },
  })

  revalidatePath(`/crm/clientes/${id}`)
  revalidatePath("/crm/clientes")
}

/* ─── Service Record ────────────────────────────────────────────────────── */

export async function createServiceRecord(formData: FormData) {
  const clientId       = formData.get("clientId")       as string
  const type           = formData.get("type")           as string
  const status         = (formData.get("status") as string) || "COMPLETED"
  const paymentStatus  = (formData.get("paymentStatus") as string) || "PAID"
  const serviceDateRaw = formData.get("serviceDate")    as string
  // Noon UTC to avoid off-by-one from timezone shifts on date-only inputs
  const serviceDate    = new Date(serviceDateRaw + "T12:00:00")
  const equipmentBrand = (formData.get("equipmentBrand") as string)?.trim() || null
  const equipmentModel = (formData.get("equipmentModel") as string)?.trim() || null
  const notes          = (formData.get("notes")          as string)?.trim() || null
  const amountRaw      = formData.get("amount") as string | null
  const amount         = amountRaw ? parseFloat(amountRaw) : null
  const followUpDays   = Math.max(1, parseInt(formData.get("followUpDays") as string) || 180)
  const followUpDate   = addDays(serviceDate, followUpDays)

  const record = await prisma.serviceRecord.create({
    data: { clientId, type, status, paymentStatus, serviceDate, equipmentBrand, equipmentModel, notes, amount, followUpDays, followUpDate },
  })

  const label = [equipmentBrand, equipmentModel].filter(Boolean).join(" ")
  await prisma.reminder.create({
    data: {
      clientId,
      serviceRecordId: record.id,
      dueDate:  followUpDate,
      message:  label ? `Mantenimiento preventivo — ${label}` : "Mantenimiento preventivo",
      status:   "PENDING",
    },
  })

  revalidateCRM(clientId)
}

export async function updateServiceRecord(id: string, formData: FormData) {
  const type           = formData.get("type")           as string
  const status         = (formData.get("status") as string) || "COMPLETED"
  const paymentStatus  = (formData.get("paymentStatus") as string) || "PAID"
  const serviceDateRaw = formData.get("serviceDate")    as string
  const serviceDate    = new Date(serviceDateRaw + "T12:00:00")
  const equipmentBrand = (formData.get("equipmentBrand") as string)?.trim() || null
  const equipmentModel = (formData.get("equipmentModel") as string)?.trim() || null
  const notes          = (formData.get("notes")          as string)?.trim() || null
  const amountRaw      = formData.get("amount") as string | null
  const amount         = amountRaw ? parseFloat(amountRaw) : null

  const record = await prisma.serviceRecord.update({
    where: { id },
    data:  { type, status, paymentStatus, serviceDate, equipmentBrand, equipmentModel, notes, amount },
  })

  revalidateCRM(record.clientId)
}

export async function deleteServiceRecord(id: string) {
  const record = await prisma.serviceRecord.delete({ where: { id } })
  revalidateCRM(record.clientId)
}

export async function setServicePaymentStatus(id: string, paymentStatus: "PAID" | "PENDING") {
  const record = await prisma.serviceRecord.update({
    where: { id },
    data:  { paymentStatus },
  })
  revalidateCRM(record.clientId)
  revalidatePath("/services")
}

/* ─── Reminder ──────────────────────────────────────────────────────────── */

export async function updateReminderStatus(id: string, status: "DONE" | "DISMISSED") {
  const reminder = await prisma.reminder.update({ where: { id }, data: { status } })
  revalidateCRM(reminder.clientId)
}

/**
 * Marca un recordatorio como completado y opcionalmente crea el siguiente.
 * Caso de uso: ya contacté al cliente; el AC vence en 6 meses → crear el próximo seguimiento.
 */
export async function completeReminderWithFollowUp(
  id: string,
  nextDueDate: string | null,
  nextMessage?: string,
) {
  const reminder = await prisma.reminder.update({
    where: { id },
    data:  { status: "DONE" },
    include: { serviceRecord: { select: { equipmentBrand: true, equipmentModel: true } } },
  })

  if (nextDueDate) {
    const dueDate = new Date(nextDueDate + "T12:00:00")
    const equipment = reminder.serviceRecord
      ? [reminder.serviceRecord.equipmentBrand, reminder.serviceRecord.equipmentModel]
          .filter(Boolean).join(" ")
      : ""
    const message = nextMessage?.trim()
      || (equipment ? `Mantenimiento preventivo — ${equipment}` : "Seguimiento")

    await prisma.reminder.create({
      data: {
        clientId:        reminder.clientId,
        serviceRecordId: reminder.serviceRecordId,
        dueDate,
        message,
        status:          "PENDING",
      },
    })
  }

  revalidateCRM(reminder.clientId)
}

export async function rescheduleReminder(id: string, newDate: string) {
  // Noon to avoid timezone off-by-one on date-only inputs
  const dueDate  = new Date(newDate + "T12:00:00")
  const reminder = await prisma.reminder.update({
    where: { id },
    data:  { dueDate, status: "PENDING" },
  })
  revalidateCRM(reminder.clientId)
}

export async function createReminder(formData: FormData) {
  const clientId   = formData.get("clientId") as string
  const message    = (formData.get("message") as string).trim()
  const dueDateRaw = formData.get("dueDate")  as string
  const dueDate    = new Date(dueDateRaw + "T12:00:00")

  await prisma.reminder.create({
    data: { clientId, message, dueDate, status: "PENDING" },
  })
  revalidateCRM(clientId)
}

/* ─── Interactions (bitácora de contacto) ───────────────────────────────── */

export async function createInteraction(formData: FormData) {
  const clientId = formData.get("clientId") as string
  const type     = (formData.get("type") as string) || "NOTE"
  const note     = (formData.get("note") as string).trim()
  if (!note) return

  await prisma.interaction.create({ data: { clientId, type, note } })
  revalidatePath(`/crm/clientes/${clientId}`)
}

export async function deleteInteraction(id: string) {
  const interaction = await prisma.interaction.delete({ where: { id } })
  revalidatePath(`/crm/clientes/${interaction.clientId}`)
}
