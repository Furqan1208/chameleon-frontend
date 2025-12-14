"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiService } from "@/lib/api-service"
import { FileText, Clock, Loader } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export function RecentAnalyses() {
  const router = useRouter()
  const [analyses, setAnalyses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalyses()
  }, [])

  const loadAnalyses = async () => {
    try {
      const data = await apiService.getAllReports()
      setAnalyses(data.slice(0, 5))
    } catch (err) {
      console.error("[v0] Failed to load analyses:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass border border-border rounded-lg p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">Recent Analyses</h2>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-6 h-6 text-primary animate-spin" />
        </div>
      )}

      {!loading && analyses.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No analyses yet</p>
        </div>
      )}

      {!loading && analyses.length > 0 && (
        <div className="space-y-3">
          {analyses.map((analysis) => (
            <div
              key={analysis.analysis_id}
              onClick={() => router.push(`/dashboard/analysis/${analysis.analysis_id}`)}
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/10 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-medium truncate">{analysis.filename || "Unknown"}</p>
                  <p className="text-sm text-muted-foreground font-mono">{analysis.analysis_id?.slice(0, 12)}...</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>
                  {analysis.created_at
                    ? formatDistanceToNow(new Date(analysis.created_at), { addSuffix: true })
                    : "Unknown"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
