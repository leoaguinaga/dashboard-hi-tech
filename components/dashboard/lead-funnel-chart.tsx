"use client"

import { Bar, BarChart, XAxis, YAxis, Cell } from "recharts"
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export type FunnelPoint = {
  stage: string
  label: string
  count: number
}

const COLORS: Record<string, string> = {
  NEW:       "var(--chart-2)",
  CONTACTED: "var(--chart-1)",
  QUOTED:    "var(--chart-5)",
  WON:       "var(--chart-4)",
  LOST:      "var(--chart-3)",
}

const config = {
  count: { label: "Leads" },
} satisfies ChartConfig

export function LeadFunnelChart({ data }: { data: FunnelPoint[] }) {
  const total = data.reduce((s, d) => s + d.count, 0)

  if (total === 0) {
    return (
      <div className="flex h-52 items-center justify-center text-xs text-app-muted">
        Sin leads registrados
      </div>
    )
  }

  return (
    <ChartContainer config={config} className="h-52 w-full">
      <BarChart data={data} layout="vertical" margin={{ left: 4, right: 16 }}>
        <YAxis
          type="category" dataKey="label" tickLine={false} axisLine={false}
          width={84} fontSize={11}
        />
        <XAxis type="number" hide />
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="count" radius={4} barSize={22}>
          {data.map((d) => (
            <Cell key={d.stage} fill={COLORS[d.stage] ?? "var(--chart-5)"} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
