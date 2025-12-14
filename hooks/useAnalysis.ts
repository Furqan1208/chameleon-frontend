"use client"

import { useState, useEffect } from "react"
import { apiService } from "@/lib/api-service"

export function useAnalysis(analysisId: string) {
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!analysisId) return

    const fetchAnalysis = async () => {
      try {
        setLoading(true)
        const data = await apiService.getAnalysis(analysisId)
        setAnalysis(data)
      } catch (err) {
        console.error("[v0] Failed to fetch analysis:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch analysis")
      } finally {
        setLoading(false)
      }
    }

    fetchAnalysis()
  }, [analysisId])

  return { analysis, loading, error }
}
