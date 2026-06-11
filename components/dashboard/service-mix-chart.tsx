"use client"

import { Pie, PieChart, Cell, Label } from "recharts"
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export type ServiceMixPoint = {
  type:  string  // INSTALLATION | MAINTENANCE | REPAIR
  label: string
  count: number
}

const COLORS: Record<string, string> = {
  INSTALLATION: "var(--chart-1)",
  MAINTENANCE:  "var(--chart-2)",
  REPAIR:       "var(--chart-3)",
}

const config = {
  count: { label: "Servicios" },
} satisfies ChartConfig

export function ServiceMixChart({ data }: { data: ServiceMixPoint[] }) {
  const total = data.reduce((s, d) => s + d.count, 0)

  if (total === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-xs text-app-muted">
        Sin servicios registrados
      </div>
    )
  }

  return (
    <ChartContainer config={config} className="mx-auto h-56 w-full">
      <PieChart>
        <ChartTooltip
          content={<ChartTooltipContent nameKey="label" hideLabel />}
        />
        <Pie data={data} dataKey="count" nameKey="label" innerRadius={55} outerRadius={80} strokeWidth={2} paddingAngle={2}>
          {data.map((d) => (
            <Cell key={d.type} fill={COLORS[d.type] ?? "var(--chart-5)"} />
          ))}
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                    <tspan x={viewBox.cx} y={viewBox.cy} className="fill-app-primary text-2xl font-bold">
                      {total}
                    </tspan>
                    <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 18} className="fill-app-muted text-[10px]">
                      servicios
                    </tspan>
                  </text>
                )
              }
              return null
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}
