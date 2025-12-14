"use client"

import { Type, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

interface StringsAnalysisProps {
  strings: any
}

export function StringsAnalysis({ strings }: StringsAnalysisProps) {
  const [expanded, setExpanded] = useState(false)
  const stringsList = Array.isArray(strings) ? strings : []

  return (
    <div className="glass border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Type className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-semibold text-foreground">Strings Analysis</h2>
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
          <p className="text-muted-foreground">Found {stringsList.length} strings</p>
          <div className="border border-border rounded-lg p-4 bg-muted/5 max-h-96 overflow-y-auto">
            {stringsList.slice(0, 100).map((str: string, idx: number) => (
              <p key={idx} className="text-sm text-foreground font-mono py-1">
                {str}
              </p>
            ))}
            {stringsList.length > 100 && (
              <p className="text-sm text-muted-foreground italic mt-2">... and {stringsList.length - 100} more</p>
            )}
          </div>
        </div>
      )}

      {!expanded && <p className="text-muted-foreground">Click to expand strings details</p>}
    </div>
  )
}
