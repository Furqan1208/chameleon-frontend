"use client"

import { Brain, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

interface AIAnalysisResultsProps {
  aiAnalysis: any
}

export function AIAnalysisResults({ aiAnalysis }: AIAnalysisResultsProps) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="glass border border-primary/30 rounded-lg p-6 glow-green">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-semibold text-foreground">AI Analysis</h2>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {expanded && (
        <div className="space-y-6">
          {aiAnalysis.final_synthesis && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Summary</h3>
              <div className="prose prose-invert max-w-none">
                <p className="text-foreground whitespace-pre-wrap">{aiAnalysis.final_synthesis}</p>
              </div>
            </div>
          )}

          {Object.keys(aiAnalysis)
            .filter((key) => key !== "final_synthesis")
            .map((key) => (
              <div key={key} className="border-t border-border pt-4">
                <h3 className="text-lg font-semibold text-foreground mb-3 capitalize">{key.replace(/_/g, " ")}</h3>
                <p className="text-foreground whitespace-pre-wrap">{aiAnalysis[key]}</p>
              </div>
            ))}
        </div>
      )}

      {!expanded && <p className="text-muted-foreground">Click to expand AI analysis</p>}
    </div>
  )
}
