// components/charts/FileTypeChart.tsx
"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { FileText, Code, Database, Image, Archive } from 'lucide-react'

interface FileTypeData {
  type: string
  count: number
  malicious: number
  suspicious: number
  clean: number
}

interface FileTypeChartProps {
  data: FileTypeData[]
  title?: string
}

export function FileTypeChart({ data, title = "File Type Analysis" }: FileTypeChartProps) {
  const getFileIcon = (type: string) => {
    switch(type.toLowerCase()) {
      case 'exe':
      case 'dll': return <Code className="w-4 h-4" />
      case 'pdf':
      case 'doc': return <FileText className="w-4 h-4" />
      case 'jpg':
      case 'png': return <Image className="w-4 h-4" />
      case 'zip':
      case 'rar': return <Archive className="w-4 h-4" />
      default: return <Database className="w-4 h-4" />
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload[0].payload.count
      const malicious = payload[0].payload.malicious
      const suspicious = payload[0].payload.suspicious
      const clean = payload[0].payload.clean

      return (
        <div className="glass border border-border rounded-lg p-3 shadow-lg min-w-48">
          <div className="flex items-center gap-2 mb-2">
            {getFileIcon(label)}
            <p className="font-medium text-foreground">.{label}</p>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Files:</span>
              <span className="text-foreground font-medium">{total}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-destructive">Malicious:</span>
              <span className="text-destructive font-medium">{malicious}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-accent">Suspicious:</span>
              <span className="text-accent font-medium">{suspicious}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-primary">Clean:</span>
              <span className="text-primary font-medium">{clean}</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="glass border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-secondary" />
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        </div>
        <div className="text-sm text-muted-foreground">
          Analysis by file type
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis 
              dataKey="type" 
              stroke="var(--muted-foreground)"
              tick={{ fill: 'var(--muted-foreground)' }}
            />
            <YAxis 
              stroke="var(--muted-foreground)"
              tick={{ fill: 'var(--muted-foreground)' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="malicious" 
              name="Malicious" 
              fill="var(--destructive)" 
              radius={[4, 4, 0, 0]}
              stackId="a"
            />
            <Bar 
              dataKey="suspicious" 
              name="Suspicious" 
              fill="var(--accent)" 
              radius={[4, 4, 0, 0]}
              stackId="a"
            />
            <Bar 
              dataKey="clean" 
              name="Clean" 
              fill="var(--primary)" 
              radius={[4, 4, 0, 0]}
              stackId="a"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center mt-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-destructive" />
          <span className="text-sm text-muted-foreground">Malicious</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-accent" />
          <span className="text-sm text-muted-foreground">Suspicious</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-primary" />
          <span className="text-sm text-muted-foreground">Clean</span>
        </div>
      </div>
    </div>
  )
}