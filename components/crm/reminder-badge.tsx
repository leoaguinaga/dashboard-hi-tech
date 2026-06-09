import { differenceInDays } from "date-fns"

interface Props {
  dueDate: Date
  status:  string
}

export function ReminderBadge({ dueDate, status }: Props) {
  if (status === "DONE") {
    return <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium bg-success/10 text-success">Completado</span>
  }
  if (status === "DISMISSED") {
    return <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium bg-bg-muted text-app-muted">Descartado</span>
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = differenceInDays(new Date(dueDate), today)

  if (diff < 0)  return <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium bg-danger/10 text-danger">Vencido {Math.abs(diff)}d</span>
  if (diff === 0) return <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium bg-warning/10 text-warning">Hoy</span>
  if (diff <= 7)  return <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium bg-warning/10 text-warning">En {diff}d</span>
  return             <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium bg-success/10 text-success">En {diff}d</span>
}
