"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { Upload, FileText, Download } from "lucide-react"

export function QuickActions() {
  const router = useRouter()

  return (
    <div className="glass border border-border rounded-lg p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ActionButton
          icon={<Upload className="w-6 h-6" />}
          label="Upload File"
          description="Analyze new sample"
          onClick={() => router.push("/dashboard/upload")}
          color="green"
        />
        <ActionButton
          icon={<FileText className="w-6 h-6" />}
          label="View Reports"
          description="Browse analyses"
          onClick={() => router.push("/dashboard/reports")}
          color="blue"
        />
        <ActionButton
          icon={<Download className="w-6 h-6" />}
          label="Export Data"
          description="Download results"
          onClick={() => alert("Export functionality coming soon")}
          color="pink"
        />
      </div>
    </div>
  )
}

function ActionButton({
  icon,
  label,
  description,
  onClick,
  color,
}: {
  icon: React.ReactNode
  label: string
  description: string
  onClick: () => void
  color: "green" | "blue" | "pink"
}) {
  const iconColor = color === "green" ? "text-primary" : color === "blue" ? "text-secondary" : "text-accent"

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 p-4 rounded-lg border border-border bg-muted/5 hover:bg-muted/10 transition-all duration-200"
    >
      <div className={iconColor}>{icon}</div>
      <div className="text-left">
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </button>
  )
}
