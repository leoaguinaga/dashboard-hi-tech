import { PageHeaderSkeleton, KpiGridSkeleton, Skeleton } from "@/components/ui/skeleton"

export default function CRMLoading() {
  return (
    <div className="space-y-4">
      <PageHeaderSkeleton />
      <KpiGridSkeleton />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Upcoming reminders */}
        <div className="lg:col-span-2 rounded-lg border border-border bg-bg-base">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, r) => (
              <div key={r} className="flex items-center justify-between px-4 py-3">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-2.5 w-48" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Channel breakdown */}
        <div className="rounded-lg border border-border bg-bg-base">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-14" />
          </div>
          <div className="divide-y divide-border">
            {Array.from({ length: 3 }).map((_, r) => (
              <div key={r} className="flex items-center justify-between px-4 py-3">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-4 w-6" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
