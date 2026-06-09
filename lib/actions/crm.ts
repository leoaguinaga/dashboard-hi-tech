"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { addDays } from "date-fns"

/* ─── Client ────────────────────────────────────────────────────────────── */

export async function createClient(formData: FormData) {
  const name    = (formData.get("name")    as string).trim()
  const phone   = (formData.get("phone")   as string).trim()
  const email   = (formData.get("email")   as string)?.trim()  || null
  const address = (formData.get("address") as string)?.trim()  || null
  const source = formData.get("source") as string
  const notes   = (formData.get("notes")   as string)?.trim()  || null

  const client = await prisma.client.create({
    data: { name, phone, email, address, source, notes },
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
    data: { clientId, type, status, serviceDate, equipmentBrand, equipmentModel, notes, amount, followUpDays, followUpDate },
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

  revalidatePath(`/crm/clientes/${clientId}`)
  revalidatePath("/crm/seguimientos")
  revalidatePath("/crm")
  revalidatePath("/")
}

/* ─── Reminder ──────────────────────────────────────────────────────────── */

export async function updateReminderStatus(id: string, status: "DONE" | "DISMISSED") {
  await prisma.reminder.update({ where: { id }, data: { status } })

  revalidatePath("/crm/seguimientos")
  revalidatePath("/crm")
  revalidatePath("/")
}
