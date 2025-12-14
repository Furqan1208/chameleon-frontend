"use client"

import { Activity, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

interface BehaviorVisualizerProps {
  behavior: any
}

export function BehaviorVisualizer({ behavior }: BehaviorVisualizerProps) {
  const [expanded, setExpanded] = useState(false)
  const processes = behavior?.processes || []

  return (
    <div className="glass border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-secondary" />
          <h2 className="text-2xl font-semibold text-foreground">Behavior Analysis</h2>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {expanded && (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Detected {processes.length} process{processes.length !== 1 ? "es" : ""}
          </p>

          {processes.slice(0, 5).map((process: any, idx: number) => (
            <div key={idx} className="border border-border rounded-lg p-4 bg-muted/5">
              <p className="text-foreground font-medium mb-2">{process.process_name || `Process ${idx + 1}`}</p>
              <p className="text-sm text-muted-foreground font-mono">PID: {process.process_id || "N/A"}</p>
            </div>
          ))}
        </div>
      )}

      {!expanded && <p className="text-muted-foreground">Click to expand behavior details</p>}
    </div>
  )
}
