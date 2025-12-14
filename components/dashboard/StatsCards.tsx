// D:\FYP\Chameleon Frontend\components\dashboard\StatsCards.tsx
"use client"

import { FileText, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { useEffect, useState } from "react"
import { apiService } from "@/lib/api-service"

export function StatsCards() {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    threats: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const reports = await apiService.getAllReports()
        
        const total = reports.length
        const completed = reports.filter(r => r.status === "complete").length
        const pending = reports.filter(r => r.status !== "complete").length
        const threats = reports.filter(r => (r.malscore || 0) >= 4).length
        
        setStats({ total, completed, pending, threats })
      } catch (err) {
        console.warn("Failed to fetch stats:", err)
      }
    }
    
    fetchStats()
  }, [])

  const statItems = [
    { icon: FileText, label: "Total Analyses", value: stats.total, color: "green" },
    { icon: CheckCircle, label: "Completed", value: stats.completed, color: "green" },
    { icon: Clock, label: "Pending", value: stats.pending, color: "blue" },
    { icon: AlertTriangle, label: "Threats Detected", value: stats.threats, color: "pink" },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((stat) => {
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