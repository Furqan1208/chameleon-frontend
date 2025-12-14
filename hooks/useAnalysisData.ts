// D:\FYP\Chameleon Frontend\hooks\useAnalysisData.ts
"use client"

import { useState, useEffect } from "react"
import { apiService } from "@/lib/api-service"

export function useAnalysisData(analysisId: string) {
  const [overviewData, setOverviewData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!analysisId) return

    const loadData = async () => {
      try {
        setLoading(true)
        
        // Get the main analysis
        const analysis = await apiService.getAnalysis(analysisId)
        
        // Get components
        const components = await apiService.getAnalysisComponents(analysisId)
        
        // Extract overview data
        const data = analysis.data || analysis
        
        const overview = {
          analysis_id: analysisId,
          filename: data.filename || data.metadata?.filename || "Unknown",
          created_at: data.created_at || data.timestamp || data.metadata?.created_at || new Date().toISOString(),
          status: data.status || data.metadata?.status || "completed",
          malscore: data.malscore || data.metadata?.malscore || 0,
          analysis_type: data.analysis_type || data.metadata?.analysis_type || "complete",
          components: components.components || {}
        }
        
        setOverviewData(overview)
        
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load analysis data")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [analysisId])

  return { overviewData, loading, error }
}