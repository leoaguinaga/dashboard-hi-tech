import React, { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { subMonths, addMonths } from "date-fns"
import CalendarView from "./calendar-view"
import CalendarLoading from "./loading"

// Set dynamic runtime so it's always up-to-date with CRM DB updates
export const dynamic = "force-dynamic"

async function CalendarContainer() {
  // Query range: 6 months back, 12 months forward to make navigation instant on client
  const startRange = subMonths(new Date(), 6)
  const endRange = addMonths(new Date(), 12)

  // Fetch all required data concurrently
  const [services, reminders, clients] = await Promise.all([
    prisma.serviceRecord.findMany({
      where: {
        serviceDate: {
          gte: startRange,
          lte: endRange,
        },
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
            city: true,
            address: true,
          },
        },
      },
      orderBy: { serviceDate: "asc" },
    }),
    prisma.reminder.findMany({
      where: {
        dueDate: {
          gte: startRange,
          lte: endRange,
        },
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
            city: true,
            address: true,
          },
        },
        serviceRecord: {
          select: {
            type: true,
            equipmentBrand: true,
            equipmentModel: true,
          },
        },
      },
      orderBy: { dueDate: "asc" },
    }),
    prisma.client.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
      },
      orderBy: { name: "asc" },
    }),
  ])

  // Serialize dates to prevent hydration differences and Next.js warning on non-plain objects
  const serializedServices = services.map((s) => ({
    ...s,
    serviceDate: s.serviceDate.toISOString(),
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }))

  const serializedReminders = reminders.map((r) => ({
    ...r,
    dueDate: r.dueDate.toISOString(),
    createdAt: r.createdAt.toISOString(),
  }))

  return (
    <CalendarView
      initialServices={serializedServices}
      initialReminders={serializedReminders}
      clients={clients}
    />
  )
}

export default function CalendarioPage() {
  return (
    <Suspense fallback={<CalendarLoading />}>
      <CalendarContainer />
    </Suspense>
  )
}
