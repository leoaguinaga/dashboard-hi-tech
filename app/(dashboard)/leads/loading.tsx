import { PageHeaderSkeleton, KpiGridSkeleton, TableSkeleton, Skeleton } from "@/components/ui/skeleton"

export default function LeadsLoading() {
  return (
    <div className="space-y-4">
      <PageHeaderSkeleton />
      <KpiGridSkeleton />

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-16" />
          ))}
        </div>
        <Skeleton className="ml-auto h-7 w-44" />
      </div>

      <TableSkeleton rows={7} cols={6} />
    </div>
  )
}
