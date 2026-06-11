import { PageHeaderSkeleton, KpiGridSkeleton, Skeleton } from "@/components/ui/skeleton"

export default function AdsLoading() {
  return (
    <div className="space-y-4">
      <PageHeaderSkeleton />

      {/* Date range + last sync */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-16" />
          ))}
        </div>
        <Skeleton className="h-3 w-40" />
      </div>

      <KpiGridSkeleton />

      {/* Extra metrics row */}
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-bg-subtle p-3 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-4 rounded" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-lg border border-border bg-bg-base p-4 space-y-3">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-52 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
