"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { Upload, FileText, Download, ChevronRight, Radar, Layers, Plug } from "lucide-react"

export function QuickActions() {
  const router = useRouter()

  return (
    <div className="h-full rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
      <h2 className="text-sm font-semibold text-foreground mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <ActionButton
          icon={<Upload className="w-4 h-4" />}
          label="Upload File"
          description="Analyze new sample"
          onClick={() => router.push("/dashboard/upload")}
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
        <ActionButton
          icon={<Radar className="w-4 h-4" />}
          label="Unified Scan"
          description="Search all intel sources"
          onClick={() => router.push("/dashboard/threat-intel/unified")}
        />
        <ActionButton
          icon={<Layers className="w-4 h-4" />}
          label="Frameworks"
          description="MITRE and mappings"
          onClick={() => router.push("/dashboard/frameworks")}
        />
        <ActionButton
          icon={<Plug className="w-4 h-4" />}
          label="Integrations"
          description="Manage connectors"
          onClick={() => router.push("/dashboard/integrations")}
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
}: {
  icon: React.ReactNode
  label: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between gap-3 p-4 rounded-lg border transition-colors text-left border-[#1a1a1a] bg-transparent hover:bg-white/[0.03] hover:border-[#2a2a2a]"
    >
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground">{icon}</div>
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground/60" />
    </button>
  )
}
