"use client"

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts"

export type SpendDataPoint = {
  date:        string
  spend:       number
  clicks:      number
  conversions: number
}

export function SpendChart({ data }: { data: SpendDataPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-app-muted">
        Sin datos para mostrar
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "var(--text-muted)" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          yAxisId="spend"
          tick={{ fontSize: 10, fill: "var(--text-muted)" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${v.toFixed(0)}`}
          width={45}
        />
        <YAxis
          yAxisId="clicks"
          orientation="right"
          tick={{ fontSize: 10, fill: "var(--text-muted)" }}
          tickLine={false}
          axisLine={false}
          width={35}
        />
        <Tooltip
          contentStyle={{
            fontSize: 11,
            borderRadius: 6,
            border: "1px solid var(--app-border)",
            backgroundColor: "var(--bg-base)",
          }}
          formatter={(value, name) => {
            const v = typeof value === "number" ? value : Number(value)
            if (name === "Gasto") return [`$${v.toFixed(2)}`, String(name)]
            return [v, String(name)]
          }}
        />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
        <Line
          yAxisId="spend"
          type="monotone"
          dataKey="spend"
          name="Gasto"
          stroke="var(--brand-primary)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          yAxisId="clicks"
          type="monotone"
          dataKey="clicks"
          name="Clicks"
          stroke="var(--warning)"
          strokeWidth={1.5}
          dot={false}
          strokeDasharray="4 2"
          activeDot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
