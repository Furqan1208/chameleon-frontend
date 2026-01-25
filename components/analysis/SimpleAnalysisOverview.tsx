"use client"

import { File, Clock, Shield, AlertTriangle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { getThreatColor, getThreatLabel } from "./utils"

interface SimpleAnalysisOverviewProps {
  analysis: any
}

export default function SimpleAnalysisOverview({ analysis }: SimpleAnalysisOverviewProps) {
  return (
    <div className="glass border border-border rounded-xl p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">Analysis Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <File className="w-4 h-4" />
            <span className="text-sm">Filename</span>
          </div>
          <p className="text-foreground font-medium truncate">{analysis.filename || "Unknown"}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Created</span>
          </div>
          <p className="text-foreground font-medium">
            {analysis.created_at ? formatDistanceToNow(new Date(analysis.created_at), { addSuffix: true }) : "Unknown"}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Shield className="w-4 h-4" />
            <span className="text-sm">Status</span>
          </div>
          <p className="text-foreground font-medium capitalize">{analysis.status || "pending"}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">Threat Level</span>
          </div>
          <p className={`font-semibold text-lg ${getThreatColor(analysis.malscore)}`}>
            {getThreatLabel(analysis.malscore)}
          </p>
        </div>
      </div>
    </div>
  )
}