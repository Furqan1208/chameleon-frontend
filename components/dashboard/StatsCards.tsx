// D:\FYP\Chameleon Frontend\components\dashboard\StatsCards.tsx
"use client"

import { FileText, AlertTriangle, CheckCircle, Clock, AlertOctagon } from "lucide-react"
import { useEffect, useState } from "react"
import { apiService } from "@/services/api/api.service"
import { isCompletedStatus, isPendingStatus } from "@/lib/analysis-status"

// minimal interface for reports returned by API (expand as needed)
interface Report {
  status?: string
  malscore?: number | null
  // other fields can be added here
}

export function StatsCards() {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    threats: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const reports: Report[] = await apiService.getAllReports()
        
        // Calculate stats matching Reports page logic
        const total = reports.length
        
        const completed = reports.filter((r: Report) => isCompletedStatus(r.status)).length
        const pending = reports.filter((r: Report) => isPendingStatus(r.status)).length
        
        // Threats: malscore >= 4 (Medium + High risk)
        const threats = reports.filter((r: Report) => (r.malscore || 0) >= 4).length
        
        console.log("Stats calculated:", { total, completed, pending, threats })
        
        setStats({ total, completed, pending, threats })
      } catch (err) {
        console.warn("Failed to fetch stats:", err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchStats()
  }, [])

  const statItems = [
    {
      icon: FileText,
      label: "Total Analyses",
      value: stats.total,
      threat: false,
    },
    {
      icon: CheckCircle,
      label: "Completed",
      value: stats.completed,
      threat: false,
      sub: stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}%` : null,
    },
    {
      icon: Clock,
      label: "Pending",
      value: stats.pending,
      threat: false,
    },
    {
      icon: AlertOctagon,
      label: "Threats Detected",
      value: stats.threats,
      threat: true,
    },
  ]

  // Loading skeletons
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border/80 bg-card/50 p-5 animate-pulse"
          >
            <div className="h-7 w-7 bg-muted/20 rounded-lg mb-4" />
            <div className="h-7 w-14 bg-muted/20 rounded mb-2" />
            <div className="h-3 w-22 bg-muted/20 rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((stat) => {
        const Icon = stat.icon
        const isAlert = stat.threat && stat.value > 0

        return (
          <div
            key={stat.label}
            className={`rounded-xl border bg-card/50 p-5 transition-colors ${
              isAlert ? "border-red-500/30" : "border-border/80"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${isAlert ? "bg-red-500/10" : "bg-muted/20"}`}>
                <Icon className={`w-5 h-5 ${isAlert ? "text-red-400" : "text-muted-foreground"}`} />
              </div>
              {isAlert && (
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
              )}
            </div>

            <p className={`text-3xl font-semibold mb-1 ${isAlert ? "text-red-400" : "text-foreground"}`}>
              {stat.value}
            </p>

            <p className="text-sm text-muted-foreground flex items-center gap-2">
              {stat.label}
              {"sub" in stat && stat.sub && (
                <span className="text-xs font-mono text-primary">{stat.sub}</span>
              )}
            </p>
          </div>
        )
      })}
    </div>
  )
}