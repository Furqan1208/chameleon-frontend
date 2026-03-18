"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { Upload, FileText, Download } from "lucide-react"

export function QuickActions() {
  const router = useRouter()

  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
      <h2 className="text-sm font-semibold text-foreground mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <ActionButton
          icon={<Upload className="w-4 h-4" />}
          label="Upload File"
          description="Analyze new sample"
          onClick={() => router.push("/dashboard/upload")}
          primary
        />
        <ActionButton
          icon={<FileText className="w-4 h-4" />}
          label="View Reports"
          description="Browse analyses"
          onClick={() => router.push("/dashboard/reports")}
        />
        <ActionButton
          icon={<Download className="w-4 h-4" />}
          label="Export Data"
          description="Download results"
          onClick={() => alert("Export functionality coming soon")}
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
  primary,
}: {
  icon: React.ReactNode
  label: string
  description: string
  onClick: () => void
  primary?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 p-4 rounded-lg border transition-colors text-left ${
        primary
          ? "border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50"
          : "border-[#1a1a1a] bg-transparent hover:bg-white/[0.03] hover:border-[#2a2a2a]"
      }`}
    >
      <div className={primary ? "text-primary" : "text-muted-foreground"}>{icon}</div>
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </button>
  )
}
