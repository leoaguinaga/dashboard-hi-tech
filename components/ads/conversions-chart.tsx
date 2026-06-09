"use client"

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts"

export type ConversionDataPoint = {
  name:        string   // campaign name (truncated)
  spend:       number
  conversions: number
  cpc:         number
}

export function ConversionsChart({ data }: { data: ConversionDataPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-app-muted">
        Sin datos de campañas
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: "var(--text-muted)" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          yAxisId="spend"
          tick={{ fontSize: 10, fill: "var(--text-muted)" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${v}`}
          width={45}
        />
        <YAxis
          yAxisId="conv"
          orientation="right"
          tick={{ fontSize: 10, fill: "var(--text-muted)" }}
          tickLine={false}
          axisLine={false}
          width={30}
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
            return [v.toFixed(1), String(name)]
          }}
        />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
        <Bar yAxisId="spend"  dataKey="spend"       name="Gasto"       fill="var(--brand-primary)" radius={[3,3,0,0]} />
        <Bar yAxisId="conv"   dataKey="conversions" name="Conversiones" fill="var(--success)"       radius={[3,3,0,0]} opacity={0.8} />
      </BarChart>
    </ResponsiveContainer>
  )
}
