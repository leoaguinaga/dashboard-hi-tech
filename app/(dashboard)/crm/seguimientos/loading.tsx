import { TableSkeleton, Skeleton } from "@/components/ui/skeleton"

export default function SeguimientosLoading() {
  return (
    <div className="space-y-4">
      {/* Header (no action) */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-64" />
      </div>

      {/* Status tabs */}
      <div className="flex gap-3 border-b border-border pb-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-24" />
        ))}
      </div>

      <TableSkeleton rows={7} cols={5} />
    </div>
  )
}
