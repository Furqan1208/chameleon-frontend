"use client"

import { FileText, Calendar, Shield, AlertTriangle } from "lucide-react"
import { format } from "date-fns"

interface AnalysisOverviewProps {
  analysis: any
}

export function AnalysisOverview({ analysis }: AnalysisOverviewProps) {
  const getThreatColor = (score?: number) => {
    if (!score) return "text-muted-foreground"
    if (score >= 7) return "text-destructive"
    if (score >= 4) return "text-accent"
    return "text-primary"
  }

  const getThreatLabel = (score?: number) => {
    if (!score) return "Unknown"
    if (score >= 7) return "High Risk"
    if (score >= 4) return "Medium Risk"
    return "Low Risk"
  }

  return (
    <div className="glass border border-border rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-foreground mb-6">Analysis Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <FileText className="w-4 h-4" />
            <span className="text-sm">Filename</span>
          </div>
          <p className="text-foreground font-medium">{analysis.filename || "Unknown"}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Created</span>
          </div>
          <p className="text-foreground font-medium">
            {analysis.created_at ? format(new Date(analysis.created_at), "PPpp") : "Unknown"}
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

      {analysis.parsed_results?.sections?.info && (
        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">File Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">MD5:</span>
              <p className="text-foreground font-mono">{analysis.parsed_results.sections.info.md5 || "N/A"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">SHA256:</span>
              <p className="text-foreground font-mono break-all">
                {analysis.parsed_results.sections.info.sha256 || "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
