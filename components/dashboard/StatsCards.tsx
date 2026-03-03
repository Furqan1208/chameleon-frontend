// D:\FYP\Chameleon Frontend\components\dashboard\StatsCards.tsx
"use client"

import { FileText, AlertTriangle, CheckCircle, Clock, AlertOctagon } from "lucide-react"
import { useEffect, useState } from "react"
import { apiService } from "@/lib/api-service"

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
        
        // Completed: status is "complete" or "completed"
        const completed = reports.filter((r: Report) => 
          r.status === "complete" || r.status === "completed"
        ).length
        
        // Pending: status is "created", "pending", or "processing"
        const pending = reports.filter((r: Report) => 
          r.status === "created" || r.status === "pending" || r.status === "processing"
        ).length
        
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
      color: "blue",
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-500",
      borderColor: "border-blue-500/20"
    },
    { 
      icon: CheckCircle, 
      label: "Completed", 
      value: stats.completed, 
      color: "green",
      bgColor: "bg-green-500/10",
      iconColor: "text-green-500",
      borderColor: "border-green-500/20"
    },
    { 
      icon: Clock, 
      label: "Pending", 
      value: stats.pending, 
      color: "yellow",
      bgColor: "bg-yellow-500/10",
      iconColor: "text-yellow-500",
      borderColor: "border-yellow-500/20"
    },
    { 
      icon: AlertOctagon, 
      label: "Threats Detected", 
      value: stats.threats, 
      color: "red",
      bgColor: "bg-red-500/10",
      iconColor: "text-red-500",
      borderColor: "border-red-500/20"
    },
  ]

  // Loading skeletons
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="glass border border-border rounded-lg p-6 animate-pulse"
          >
            <div className="h-8 w-8 bg-muted/20 rounded-lg mb-4" />
            <div className="h-8 w-16 bg-muted/20 rounded mb-2" />
            <div className="h-4 w-24 bg-muted/20 rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((stat) => {
        const Icon = stat.icon

        return (
          <div
            key={stat.label}
            className={`glass border ${stat.borderColor} rounded-lg p-6 transition-all duration-300`}
          >
            <div className={`flex items-center justify-between mb-4`}>
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <Icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              
              {/* Mini indicator for threats */}
              {stat.label === "Threats Detected" && stats.threats > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                </span>
              )}
            </div>
            
            {/* Value */}
            <p className="text-3xl font-bold text-foreground mb-1">
              {stat.value}
            </p>
            
            {/* Label with additional context */}
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              {stat.label}
              
              {stat.label === "Completed" && stats.total > 0 && (
                <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full">
                  {Math.round((stats.completed / stats.total) * 100)}%
                </span>
              )}
              {stat.label === "Threats Detected" && stats.total > 0 && (
                <span className="text-xs px-2 py-0.5 bg-red-500/10 text-red-500 rounded-full">
                  {Math.round((stats.threats / stats.total) * 100)}% of total
                </span>
              )}
              {stat.label === "Pending" && stats.pending === 0 && (
                <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full">
                  None
                </span>
              )}
            </p>
          </div>
        )
      })}
    </div>
  )
}