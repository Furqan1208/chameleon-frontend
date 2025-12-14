"use client"

import { FileSignature, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

interface SignaturesAnalysisProps {
  signatures: any
}

export function SignaturesAnalysis({ signatures }: SignaturesAnalysisProps) {
  const [expanded, setExpanded] = useState(false)
  const sigList = Array.isArray(signatures) ? signatures : []

  return (
    <div className="glass border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileSignature className="w-6 h-6 text-secondary" />
          <h2 className="text-2xl font-semibold text-foreground">Signatures & Detection</h2>
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
          <p className="text-muted-foreground">Detected {sigList.length} signatures</p>
          {sigList.map((sig: any, idx: number) => (
            <div key={idx} className="border border-border rounded-lg p-4 bg-muted/5">
              <p className="text-foreground font-medium">{sig.name || `Signature ${idx + 1}`}</p>
              <p className="text-sm text-muted-foreground mt-1">{sig.description || "No description"}</p>
              {sig.severity && <p className="text-sm text-accent mt-2">Severity: {sig.severity}</p>}
            </div>
          ))}
        </div>
      )}

      {!expanded && <p className="text-muted-foreground">Click to expand signature details</p>}
    </div>
  )
}
