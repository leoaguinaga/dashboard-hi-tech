import { KpiGridSkeleton, Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="space-y-5">
      {/* Welcome */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-3 w-40" />
      </div>

      {/* KPI grid */}
      <KpiGridSkeleton />

      {/* Charts row 1: revenue (2/3) + donut (1/3) */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-lg border border-border bg-bg-base">
          <div className="px-4 py-2.5 border-b border-border">
            <Skeleton className="h-4 w-36" />
          </div>
          <div className="p-3">
            <Skeleton className="h-56 w-full" />
          </div>
        </div>
        <div className="rounded-lg border border-border bg-bg-base">
          <div className="px-4 py-2.5 border-b border-border">
            <Skeleton className="h-4 w-36" />
          </div>
          <div className="p-3 flex flex-col items-center gap-3">
            <Skeleton className="h-40 w-40 rounded-full" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      </div>

      {/* Charts row 2: funnel + reminders */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-lg border border-border bg-bg-base">
            <div className="px-4 py-2.5 border-b border-border">
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="p-3 space-y-2.5">
              {Array.from({ length: 5 }).map((_, r) => (
                <Skeleton key={r} className="h-6 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
