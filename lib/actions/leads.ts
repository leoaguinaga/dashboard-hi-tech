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

  const lead = await prisma.lead.create({
    data: { name, phone, email, service, message, source: "manual" },
  })

  const existing = await prisma.client.findFirst({ where: { phone } })
  if (existing) {
    if (!existing.leadId) {
      await prisma.client.update({
        where: { id: existing.id },
        data:  { leadId: lead.id },
      })
    }
  } else {
    await prisma.client.create({
      data: { name, phone, email, source: "manual", category: "CONTACT", leadId: lead.id },
    })
  }

  revalidatePath("/leads")
  revalidatePath("/crm/clientes")
}

export async function convertLeadToClient(leadId: string) {
  const lead = await prisma.lead.findUnique({
    where:   { id: leadId },
    include: { client: { select: { id: true, category: true } } },
  })

  if (!lead) throw new Error("Lead no encontrado")

  let clientId: string

  if (lead.client) {
    // Ya hay un Client vinculado (probablemente como CONTACT) — promover a CLIENT.
    clientId = lead.client.id
    if (lead.client.category !== "CLIENT") {
      await prisma.client.update({
        where: { id: clientId },
        data:  { category: "CLIENT" },
      })
    }
  } else {
    // Por si el lead se creó antes de que existiera el auto-contacto.
    const existing = await prisma.client.findFirst({ where: { phone: lead.phone } })
    if (existing) {
      clientId = existing.id
      await prisma.client.update({
        where: { id: existing.id },
        data:  { category: "CLIENT", leadId: lead.id },
      })
    } else {
      const created = await prisma.client.create({
        data: {
          name:     lead.name,
          phone:    lead.phone,
          email:    lead.email,
          source:   lead.source,
          category: "CLIENT",
          leadId:   lead.id,
        },
      })
      clientId = created.id
    }
  }

  // Asegurar que el lead quede en WON
  if (lead.status !== "WON") {
    await prisma.lead.update({ where: { id: leadId }, data: { status: "WON" } })
  }

  revalidatePath("/leads")
  revalidatePath("/crm/clientes")
  redirect(`/crm/clientes/${clientId}`)
}
