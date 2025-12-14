"use client"

import { Database, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

interface MemoryAnalysisProps {
  memory: any
}

export function MemoryAnalysis({ memory }: MemoryAnalysisProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="glass border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-semibold text-foreground">Memory Analysis</h2>
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
          <p className="text-muted-foreground">Memory dump analysis results</p>
          <div className="border border-border rounded-lg p-4 bg-muted/5">
            <pre className="text-sm text-foreground font-mono overflow-x-auto">{JSON.stringify(memory, null, 2)}</pre>
          </div>
        </div>
      )}

      {!expanded && <p className="text-muted-foreground">Click to expand memory details</p>}
    </div>
  )
}
