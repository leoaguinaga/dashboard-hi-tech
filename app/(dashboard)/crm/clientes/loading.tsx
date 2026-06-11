import { PageHeaderSkeleton, TableSkeleton, Skeleton } from "@/components/ui/skeleton"

export default function ClientesLoading() {
  return (
    <div className="space-y-4">
      <PageHeaderSkeleton />

      {/* Search */}
      <div className="flex gap-2 max-w-sm">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-20" />
      </div>

      <TableSkeleton rows={8} cols={5} />
    </div>
  )
}
