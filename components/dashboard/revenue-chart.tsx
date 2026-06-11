"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"

export type RevenuePoint = {
  month:   string
  cobrado: number
  pendiente: number
}

const config = {
  cobrado:   { label: "Cobrado",   color: "var(--chart-4)" },
  pendiente: { label: "Por cobrar", color: "var(--chart-3)" },
} satisfies ChartConfig

const money = (v: number) =>
  v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  return (
    <ChartContainer config={config} className="h-56 w-full">
      <BarChart data={data} margin={{ left: 0, right: 4, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
        <YAxis tickLine={false} axisLine={false} width={46} fontSize={11} tickFormatter={money} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => (
                <div className="flex w-full items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-app-muted">
                    <span
                      className="h-2.5 w-2.5 rounded-[2px]"
                      style={{ backgroundColor: config[name as keyof typeof config]?.color }}
                    />
                    {config[name as keyof typeof config]?.label ?? name}
                  </span>
                  <span className="font-mono font-medium text-app-primary">
                    ${Number(value).toLocaleString("en-US")}
                  </span>
                </div>
              )}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="cobrado"   stackId="r" fill="var(--color-cobrado)"   radius={[0, 0, 0, 0]} maxBarSize={46} />
        <Bar dataKey="pendiente" stackId="r" fill="var(--color-pendiente)" radius={[4, 4, 0, 0]} maxBarSize={46} />
      </BarChart>
    </ChartContainer>
  )
}
