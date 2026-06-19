"use client"

import React, { useState, useEffect } from "react"
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  format,
} from "date-fns"
import { es } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, LayoutGrid, ListTodo } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DayDetailSheet } from "@/components/crm/day-detail-sheet"
import { CreateActivityDialog } from "@/components/crm/create-activity-dialog"

interface ClientInfo {
  id: string
  name: string
  phone: string
  city?: string | null
}

interface ServiceRecordItem {
  id: string
  clientId: string
  type: string
  status: string
  serviceDate: Date | string
  equipmentBrand: string | null
  equipmentModel: string | null
  notes: string | null
  amount: number | null
  paymentStatus: string
  client: ClientInfo
  scheduledTime?: string | null
  address?: string | null
}

interface ReminderItem {
  id: string
  clientId: string
  serviceRecordId: string | null
  dueDate: Date | string
  message: string
  status: string
  client: ClientInfo
  serviceRecord?: {
    type: string
    equipmentBrand: string | null
    equipmentModel: string | null
  } | null
}

interface ClientOption {
  id: string
  name: string
  phone: string
}

interface Props {
  initialServices: ServiceRecordItem[]
  initialReminders: ReminderItem[]
  clients: ClientOption[]
}

type CalendarViewType = "month" | "week"
type TypeFilter = "all" | "services" | "reminders"
type StatusFilter = "pending_in_progress" | "all"

const TYPE_BADGE_CLASSES: Record<string, string> = {
  INSTALLATION: "bg-blue-50 text-blue-700 border-blue-100",
  MAINTENANCE: "bg-violet-50 text-violet-700 border-violet-100",
  REPAIR: "bg-orange-50 text-orange-700 border-orange-100",
}

const TYPE_SHORT_LABELS: Record<string, string> = {
  INSTALLATION: "Instalación",
  MAINTENANCE: "Mantenimiento",
  REPAIR: "Reparación",
}

export default function CalendarView({ initialServices, initialReminders, clients }: Props) {
  // Mounting check to prevent hydration issues
  const [mounted, setMounted] = useState(false)

  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [view, setView] = useState<CalendarViewType>("month")

  // Filters
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending_in_progress")

  // Sheet & Dialog state
  const [selectedDateStr, setSelectedDateStr] = useState<string>("")
  const [sheetOpen, setSheetOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-96 flex items-center justify-center text-xs text-app-muted">Cargando calendario...</div>
  }

  // Parse service date helpers to handle timezone offset safely
  const parseDateOnly = (dateVal: Date | string): Date => {
    if (typeof dateVal === "string") {
      // split and construct local date
      const [y, m, d] = dateVal.split("T")[0].split("-").map(Number)
      return new Date(y, m - 1, d)
    }
    return new Date(dateVal)
  }

  // Apply filters to data
  const getFilteredData = () => {
    let filteredServices = [...initialServices]
    let filteredReminders = [...initialReminders]

    // Status filter
    if (statusFilter === "pending_in_progress") {
      filteredServices = filteredServices.filter(s => s.status === "PENDING" || s.status === "IN_PROGRESS")
      filteredReminders = filteredReminders.filter(r => r.status === "PENDING")
    }

    // Type filter
    if (typeFilter === "services") {
      filteredReminders = []
    } else if (typeFilter === "reminders") {
      filteredServices = []
    }

    return { services: filteredServices, reminders: filteredReminders }
  }

  const { services, reminders } = getFilteredData()

  // Grid generation
  const getDaysGrid = () => {
    if (view === "month") {
      const monthStart = startOfMonth(currentDate)
      const monthEnd = endOfMonth(monthStart)
      // weekStartsOn: 1 means Lunes (Monday)
      const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
      const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })
      return eachDayOfInterval({ start: startDate, end: endDate })
    } else {
      // Week view: Lunes a Domingo for the week of currentDate
      const startDate = startOfWeek(currentDate, { weekStartsOn: 1 })
      const endDate = endOfWeek(currentDate, { weekStartsOn: 1 })
      return eachDayOfInterval({ start: startDate, end: endDate })
    }
  }

  const daysGrid = getDaysGrid()

  // Navigation handlers
  const handlePrev = () => {
    if (view === "month") {
      setCurrentDate(prev => subMonths(prev, 1))
    } else {
      setCurrentDate(prev => subWeeks(prev, 1))
    }
  }

  const handleNext = () => {
    if (view === "month") {
      setCurrentDate(prev => addMonths(prev, 1))
    } else {
      setCurrentDate(prev => addWeeks(prev, 1))
    }
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  // Date selection click handler
  const handleDayClick = (date: Date) => {
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, "0")
    const dd = String(date.getDate()).padStart(2, "0")
    const dateStr = `${yyyy}-${mm}-${dd}`

    setSelectedDateStr(dateStr)
    setSheetOpen(true)
  }

  // Find activities for a day
  const getDayActivities = (date: Date) => {
    const dayServices = services.filter(s => isSameDay(parseDateOnly(s.serviceDate), date))
    const dayReminders = reminders.filter(r => isSameDay(parseDateOnly(r.dueDate), date))
    return { services: dayServices, reminders: dayReminders }
  }

  // Format header title
  const getHeaderTitle = () => {
    if (view === "month") {
      const title = format(currentDate, "MMMM yyyy", { locale: es })
      return title.charAt(0).toUpperCase() + title.slice(1)
    } else {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 })
      const end = endOfWeek(currentDate, { weekStartsOn: 1 })

      if (start.getMonth() === end.getMonth()) {
        return `${format(start, "d")} - ${format(end, "d 'de' MMMM, yyyy", { locale: es })}`
      } else {
        return `${format(start, "d 'de' MMM", { locale: es })} - ${format(end, "d 'de' MMM, yyyy", { locale: es })}`
      }
    }
  }

  // Get active items for the selected day in Sheet
  const getSelectedDayItems = () => {
    if (!selectedDateStr) return { services: [], reminders: [] }
    const [y, m, d] = selectedDateStr.split("-").map(Number)
    const dateObj = new Date(y, m - 1, d)
    return getDayActivities(dateObj)
  }

  const selectedDayItems = getSelectedDayItems()

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-brand-primary" />
            Calendario CRM
          </h1>
          <p className="text-xs text-app-muted">
            Monitorea servicios realizados/programados y seguimientos de mantenimiento.
          </p>
        </div>

        {/* Action Button */}
        <Button
          size="sm"
          onClick={() => {
            const today = new Date()
            const y = today.getFullYear()
            const m = String(today.getMonth() + 1).padStart(2, "0")
            const d = String(today.getDate()).padStart(2, "0")
            setSelectedDateStr(`${y}-${m}-${d}`)
            setCreateDialogOpen(true)
          }}
          className="bg-brand-primary hover:bg-brand-dark text-white text-xs h-8 px-3 rounded-md flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Agendar Actividad
        </Button>
      </div>

      {/* Toolbar / Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        {/* Navigation & View Switcher */}
        <div className="flex items-center flex-wrap gap-2">
          {/* View Toggle */}
          <div className="flex bg-bg-muted p-0.5 rounded-md border border-border">
            <button
              onClick={() => setView("month")}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors ${view === "month"
                ? "bg-bg-base text-brand-primary shadow-xs"
                : "text-app-muted hover:text-app-primary"
                }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Mes
            </button>
            <button
              onClick={() => setView("week")}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors ${view === "week"
                ? "bg-bg-base text-brand-primary shadow-xs"
                : "text-app-muted hover:text-app-primary"
                }`}
            >
              <ListTodo className="h-3.5 w-3.5" />
              Semana
            </button>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-1 ml-1">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={handlePrev}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToday}
              className="h-8 text-xs px-2.5"
            >
              Hoy
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={handleNext}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Title */}
          <h2 className="text-sm font-semibold text-app-primary ml-2 hidden sm:block">
            {getHeaderTitle()}
          </h2>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {/* Title Mobile */}
          <h2 className="text-xs font-semibold text-app-primary sm:hidden mr-auto">
            {getHeaderTitle()}
          </h2>

          {/* Type Filter */}
          <div className="flex bg-bg-muted p-0.5 rounded-md border border-border text-[11px]">
            <button
              onClick={() => setTypeFilter("all")}
              className={`px-2 py-0.5 font-medium rounded-sm transition-colors ${typeFilter === "all" ? "bg-bg-base text-app-primary shadow-2xs" : "text-app-muted hover:text-app-primary"
                }`}
            >
              Todo
            </button>
            <button
              onClick={() => setTypeFilter("services")}
              className={`px-2 py-0.5 font-medium rounded-sm transition-colors ${typeFilter === "services" ? "bg-bg-base text-app-primary shadow-2xs" : "text-app-muted hover:text-app-primary"
                }`}
            >
              Servicios
            </button>
            <button
              onClick={() => setTypeFilter("reminders")}
              className={`px-2 py-0.5 font-medium rounded-sm transition-colors ${typeFilter === "reminders" ? "bg-bg-base text-app-primary shadow-2xs" : "text-app-muted hover:text-app-primary"
                }`}
            >
              Seguimientos
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex bg-bg-muted p-0.5 rounded-md border border-border text-[11px]">
            <button
              onClick={() => setStatusFilter("pending_in_progress")}
              title="Pendientes y En Progreso"
              className={`px-2 py-0.5 font-medium rounded-sm transition-colors ${statusFilter === "pending_in_progress" ? "bg-bg-base text-app-primary shadow-2xs" : "text-app-muted hover:text-app-primary"
                }`}
            >
              Activos
            </button>
            <button
              onClick={() => setStatusFilter("all")}
              title="Todos los estados históricos"
              className={`px-2 py-0.5 font-medium rounded-sm transition-colors ${statusFilter === "all" ? "bg-bg-base text-app-primary shadow-2xs" : "text-app-muted hover:text-app-primary"
                }`}
            >
              Todos
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-lg border border-border bg-bg-base overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-border bg-bg-subtle text-center text-xs font-semibold text-app-muted py-1.5">
          <div>Lun</div>
          <div>Mar</div>
          <div>Mié</div>
          <div>Jue</div>
          <div>Vie</div>
          <div>Sáb</div>
          <div>Dom</div>
        </div>

        {/* Days Cells */}
        <div className={`grid grid-cols-7 divide-x divide-y divide-border border-b border-border ${view === "week" ? "min-h-[360px]" : ""}`}>
          {daysGrid.map((day, idx) => {
            const { services: dayServices, reminders: dayReminders } = getDayActivities(day)
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isDayToday = isToday(day)

            const totalCount = dayServices.length + dayReminders.length

            return (
              <div
                key={idx}
                onClick={() => handleDayClick(day)}
                className={`min-h-[90px] p-1.5 flex flex-col justify-between cursor-pointer transition-colors group relative ${isCurrentMonth ? "bg-bg-base hover:bg-bg-subtle" : "bg-bg-muted/40 hover:bg-bg-muted/70 text-app-disabled"
                  } ${isDayToday ? "ring-1 ring-inset ring-brand-primary/50 bg-brand-light/5" : ""}`}
              >
                {/* Day Number */}
                <div className="flex justify-between items-center">
                  <span
                    className={`text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center transition-colors ${isDayToday
                      ? "bg-brand-primary text-white"
                      : isCurrentMonth
                        ? "text-app-primary"
                        : "text-app-disabled"
                      }`}
                  >
                    {day.getDate()}
                  </span>

                  {totalCount > 0 && (
                    <span className="text-[9px] font-semibold text-app-muted/80 bg-bg-muted px-1.5 py-0.5 rounded-full block sm:hidden">
                      {totalCount}
                    </span>
                  )}
                </div>

                {/* Mini labels (visible on Desktop) */}
                <div className="hidden sm:block space-y-0.5 mt-1.5 mb-0.5 overflow-hidden flex-1 max-h-[72px]">
                  {/* Services Mini-labels */}
                  {dayServices.slice(0, 3).map((s) => (
                    <div
                      key={s.id}
                      className={`text-[9px] px-1 py-0.5 rounded-xs border leading-none font-medium truncate ${TYPE_BADGE_CLASSES[s.type] || "bg-bg-muted text-app-muted"
                        } ${s.status === "COMPLETED" ? "opacity-60 line-through" : ""}`}
                    >
                      {s.scheduledTime ? `${s.scheduledTime} | ` : ""}{TYPE_SHORT_LABELS[s.type] || s.type}: {s.client.name.split(" ")[0]}
                    </div>
                  ))}

                  {/* Reminders Mini-labels */}
                  {dayReminders.slice(0, Math.max(0, 3 - dayServices.length)).map((r) => (
                    <div
                      key={r.id}
                      className={`text-[9px] px-1 py-0.5 rounded-xs border leading-none font-medium truncate bg-yellow-50 text-yellow-700 border-yellow-100 ${r.status !== "PENDING" ? "opacity-60 line-through" : ""
                        }`}
                    >
                      Seg.: {r.client.name.split(" ")[0]}
                    </div>
                  ))}

                  {/* Overflows */}
                  {totalCount > 3 && (
                    <div className="text-[8px] text-app-muted/80 font-bold pl-1">
                      +{totalCount - 3} más
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Date Detail Drawer (Sheet) */}
      <DayDetailSheet
        selectedDate={selectedDateStr}
        services={selectedDayItems.services}
        reminders={selectedDayItems.reminders}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onCreateActivity={() => {
          setSheetOpen(false)
          setCreateDialogOpen(true)
        }}
      />

      {/* Unified creation dialog */}
      {createDialogOpen && (
        <CreateActivityDialog
          clients={clients}
          initialDate={selectedDateStr}
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />
      )}
    </div>
  )
}
