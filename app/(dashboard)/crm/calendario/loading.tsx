import React from "react"

export default function CalendarLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-1">
        <div className="h-6 w-32 bg-bg-muted rounded" />
        <div className="h-4 w-64 bg-bg-muted rounded" />
      </div>

      {/* Control Bar Skeleton */}
      <div className="flex flex-wrap gap-2 items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          {/* Month/Week Switcher */}
          <div className="h-8 w-28 bg-bg-muted rounded-md" />
          {/* Navigation buttons */}
          <div className="flex gap-1">
            <div className="h-8 w-8 bg-bg-muted rounded-md" />
            <div className="h-8 w-16 bg-bg-muted rounded-md" />
            <div className="h-8 w-8 bg-bg-muted rounded-md" />
          </div>
          {/* Title */}
          <div className="h-6 w-24 bg-bg-muted rounded ml-2" />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <div className="h-8 w-32 bg-bg-muted rounded-md" />
          <div className="h-8 w-28 bg-bg-muted rounded-md" />
          <div className="h-8 w-24 bg-bg-muted rounded-md" />
        </div>
      </div>

      {/* Grid Skeleton (Monthly view style) */}
      <div className="rounded-lg border border-border bg-bg-base overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-border bg-bg-subtle">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="px-3 py-2 text-center border-r border-border last:border-r-0">
              <div className="h-3 w-8 bg-bg-muted mx-auto rounded" />
            </div>
          ))}
        </div>
        {/* Days grid */}
        <div className="grid grid-cols-7 divide-y divide-border border-b border-border">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="min-h-[90px] p-2 bg-bg-base flex flex-col justify-between border-r border-border last:border-r-0">
              <div className="flex justify-between items-center">
                <div className="h-4 w-4 bg-bg-muted rounded" />
              </div>
              <div className="space-y-1 mt-2">
                <div className="h-3.5 w-16 bg-bg-muted rounded" />
                <div className="h-3.5 w-12 bg-bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
