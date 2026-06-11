import { cn } from "@/lib/utils"

/** Base shimmer block. */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-bg-muted", className)}
      {...props}
    />
  )
}

/** Page title + subtitle, optionally with a right-aligned action button. */
export function PageHeaderSkeleton({ action = true }: { action?: boolean }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-64" />
      </div>
      {action && <Skeleton className="h-8 w-32 rounded-md" />}
    </div>
  )
}

/** Row of KPI cards matching the dashboard stat grid. */
export function KpiGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-bg-subtle p-3 space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-4 rounded" />
          </div>
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-2.5 w-24" />
        </div>
      ))}
    </div>
  )
}

/** Generic table placeholder with header + body rows. */
export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-bg-subtle px-3 py-2.5 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {/* Rows */}
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="px-3 py-3 flex gap-4 items-center">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
