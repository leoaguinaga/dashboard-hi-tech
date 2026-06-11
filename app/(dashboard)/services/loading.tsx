import { KpiGridSkeleton, TableSkeleton, Skeleton } from "@/components/ui/skeleton"

export default function ServicesLoading() {
  return (
    <div className="space-y-4">
      {/* Header (no action button) */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-56" />
      </div>

      <KpiGridSkeleton />

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-24" />
          ))}
        </div>
        <Skeleton className="ml-auto h-7 w-44" />
      </div>

      <TableSkeleton rows={7} cols={6} />
    </div>
  )
}
