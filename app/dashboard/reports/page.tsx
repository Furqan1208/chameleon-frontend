"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { NetworkBackground } from "@/components/3d/NetworkBackground"
import { apiService } from "@/lib/api-service"
import { FileText, Clock, AlertTriangle, CheckCircle, Loader } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export default function ReportsPage() {
  const router = useRouter()
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setLoading(true)
      const data = await apiService.getAllReports()
      setReports(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-full bg-background">
      <NetworkBackground />

      <div className="relative z-10 p-6 lg:p-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Analysis Reports</h1>
            <p className="text-muted-foreground">Browse and manage your analysis reports</p>
          </div>

          {loading && (
            <div className="glass border border-border rounded-lg p-12 flex flex-col items-center justify-center gap-4">
              <Loader className="w-8 h-8 text-primary animate-spin" />
              <p className="text-muted-foreground">Loading reports...</p>
            </div>
          )}

          {error && (
            <div className="glass border border-destructive rounded-lg p-6 text-destructive">
              <p className="font-semibold mb-2">Error Loading Reports</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && reports.length === 0 && (
            <div className="glass border border-border rounded-lg p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No reports found</p>
              <button
                onClick={() => router.push("/dashboard/upload")}
                className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                Upload File
              </button>
            </div>
          )}

          {!loading && !error && reports.length > 0 && (
            <div className="grid grid-cols-1 gap-4">
              {reports.map((report) => (
                <ReportCard
                  key={report.analysis_id}
                  report={report}
                  onClick={() => router.push(`/dashboard/analysis/${report.analysis_id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ReportCard({ report, onClick }: { report: any; onClick: () => void }) {
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
    <div
      onClick={onClick}
      className="glass border border-border rounded-lg p-6 hover:glow-green cursor-pointer transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-primary flex-shrink-0" />
            <h3 className="text-lg font-semibold text-foreground truncate">{report.filename || "Unknown File"}</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Analysis ID</p>
              <p className="text-foreground font-mono">{report.analysis_id?.slice(0, 8)}...</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Status</p>
              <div className="flex items-center gap-1">
                {report.status === "completed" ? (
                  <CheckCircle className="w-4 h-4 text-primary" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-accent" />
                )}
                <span className="text-foreground capitalize">{report.status || "pending"}</span>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Threat Level</p>
              <p className={`font-semibold ${getThreatColor(report.malscore)}`}>{getThreatLabel(report.malscore)}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Created</p>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">
                  {report.created_at
                    ? formatDistanceToNow(new Date(report.created_at), { addSuffix: true })
                    : "Unknown"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
