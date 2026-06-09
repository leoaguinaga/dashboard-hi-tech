"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export type LeadStatus = "NEW" | "CONTACTED" | "QUOTED" | "WON" | "LOST"

export async function updateLeadStatus(id: string, status: LeadStatus) {
  await prisma.lead.update({
    where: { id },
    data:  { status },
  })
  revalidatePath("/leads")
}

export async function deleteLead(id: string) {
  await prisma.lead.delete({ where: { id } })
  revalidatePath("/leads")
}

export async function createLeadManual(formData: FormData) {
  const name    = (formData.get("name")    as string).trim()
  const phone   = (formData.get("phone")   as string).trim()
  const email   = (formData.get("email")   as string)?.trim() || null
  const service = (formData.get("service") as string).trim()
  const message = (formData.get("message") as string)?.trim() || null

  await prisma.lead.create({
    data: { name, phone, email, service, message, source: "manual" },
  })
  revalidatePath("/leads")
}

export async function convertLeadToClient(leadId: string) {
  const lead = await prisma.lead.findUnique({
    where:   { id: leadId },
    include: { client: { select: { id: true } } },
  })

  if (!lead) throw new Error("Lead no encontrado")

  // Si ya fue convertido, ir directo al perfil
  if (lead.client) redirect(`/crm/clientes/${lead.client.id}`)

  const client = await prisma.client.create({
    data: {
      name:   lead.name,
      phone:  lead.phone,
      email:  lead.email,
      source: lead.source,
      leadId: lead.id,
    },
  })

  // Asegurar que el lead quede en WON
  if (lead.status !== "WON") {
    await prisma.lead.update({ where: { id: leadId }, data: { status: "WON" } })
  }

  revalidatePath("/leads")
  revalidatePath("/crm/clientes")
  redirect(`/crm/clientes/${client.id}`)
}
