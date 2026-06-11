import { PageHeaderSkeleton, TableSkeleton } from "@/components/ui/skeleton"

export default function PortfolioLoading() {
  return (
    <div className="space-y-4">
      <PageHeaderSkeleton />
      <TableSkeleton rows={6} cols={7} />
    </div>
  )
}
