import { Skeleton } from "@/components/ui/skeleton"

export default function ClientProfileLoading() {
  return (
    <div className="space-y-4">
      {/* Back + header */}
      <div>
        <Skeleton className="h-3 w-32 mb-3" />
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="h-8 w-32 rounded-md" />
        </div>
      </div>

      {/* Contact info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>

      {/* Two columns: services + reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[0, 1].map((col) => (
          <div key={col} className="rounded-lg border border-border bg-bg-base">
            <div className="px-4 py-2.5 border-b border-border">
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="divide-y divide-border">
              {Array.from({ length: 4 }).map((_, r) => (
                <div key={r} className="px-4 py-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-2.5 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
