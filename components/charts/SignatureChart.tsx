// components/charts/SignatureChart.tsx
"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { FileSignature, AlertTriangle, Shield, Bug } from 'lucide-react'

interface SignatureData {
  name: string
  value: number
  color: string
  description?: string
}

interface SignatureChartProps {
  data: SignatureData[]
  title?: string
  showLegend?: boolean
}

export function SignatureChart({ data, title = "Signature Distribution", showLegend = true }: SignatureChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            Count: <span className="text-foreground font-medium">{payload[0].value}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Percentage: <span className="text-foreground font-medium">
              {((payload[0].value / total) * 100).toFixed(1)}%
            </span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="glass border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileSignature className="w-6 h-6 text-accent" />
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        </div>
        <div className="text-sm text-muted-foreground">
          {total} total signatures
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--border)" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend 
                layout="vertical"
                verticalAlign="middle"
                align="right"
                formatter={(value, entry) => (
                  <span className="text-sm text-foreground">{value}</span>
                )}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        {data.map((item, index) => (
          <div key={index} className="text-center p-3 rounded-lg bg-muted/10">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm font-medium text-foreground">{item.name}</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{item.value}</div>
            <div className="text-xs text-muted-foreground">
              {((item.value / total) * 100).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}