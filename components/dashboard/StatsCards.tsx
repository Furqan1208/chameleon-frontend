"use client"

import { FileText, AlertTriangle, CheckCircle, Clock } from "lucide-react"

export function StatsCards() {
  const stats = [
    { icon: FileText, label: "Total Analyses", value: "0", color: "green" },
    { icon: CheckCircle, label: "Completed", value: "0", color: "green" },
    { icon: Clock, label: "Pending", value: "0", color: "blue" },
    { icon: AlertTriangle, label: "Threats Detected", value: "0", color: "pink" },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        const glowClass = stat.color === "green" ? "glow-green" : stat.color === "blue" ? "glow-blue" : "glow-pink"
        const iconColor =
          stat.color === "green" ? "text-primary" : stat.color === "blue" ? "text-secondary" : "text-accent"

        return (
          <div
            key={stat.label}
            className={`glass border border-border rounded-lg p-6 hover:${glowClass} transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <Icon className={`w-8 h-8 ${iconColor}`} />
            </div>
            <p className="text-3xl font-bold text-foreground mb-2">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        )
      })}
    </div>
  )
}
