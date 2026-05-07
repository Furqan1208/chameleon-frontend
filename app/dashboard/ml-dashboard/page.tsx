"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw, Shield } from "lucide-react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001"

function getToken(): string | null {
  if (typeof window === "undefined") return null
  const cookieMatch = document.cookie
    .split("; ")
    .find((row) => row.startsWith("access_token="))
  if (cookieMatch) {
    return decodeURIComponent(cookieMatch.split("=").slice(1).join("="))
  }
  return localStorage.getItem("access_token")
}

type Health = {
  available: boolean
  models_loaded: boolean
  last_trained: string | null
  samples_count: number
}

type HistoryPoint = {
  timestamp: string
  source?: string
  binary_accuracy?: number
  family_accuracy?: number
  type_accuracy?: number
  training_samples_count?: number
}

export default function MLDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [retraining, setRetraining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [health, setHealth] = useState<Health | null>(null)
  const [history, setHistory] = useState<HistoryPoint[]>([])
  const [performance, setPerformance] = useState<HistoryPoint | null>(null)
  const [feedbackStats, setFeedbackStats] = useState<any>(null)
  const [message, setMessage] = useState<string | null>(null)

  const fetchAll = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const token = getToken()
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}

      const [hRes, sRes, fRes] = await Promise.all([
        fetch(`${API_BASE}/api/ml/health`, { headers }),
        fetch(`${API_BASE}/api/ml/stats`, { headers }),
        fetch(`${API_BASE}/api/ml/feedback/stats`, { headers }),
      ])

      const hJson = await hRes.json()
      const sJson = await sRes.json()
      const fJson = await fRes.json()

      if (!hRes.ok || hJson.success === false) {
        throw new Error(hJson?.error || hJson?.detail || "Failed to load ML health")
      }
      if (!sRes.ok || sJson.success === false) {
        throw new Error(sJson?.error || sJson?.detail || "Failed to load ML stats")
      }

      setHealth({
        available: !!hJson.available,
        models_loaded: !!hJson.models_loaded,
        last_trained: hJson.last_trained || null,
        samples_count: Number(hJson.samples_count || 0),
      })
      setHistory(Array.isArray(sJson.history) ? sJson.history : [])
      const perf = sJson?.performance
      setPerformance(perf && typeof perf === "object" && Object.keys(perf).length > 0 ? perf : null)
      setFeedbackStats(fJson?.data || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load ML dashboard")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchAll()
  }, [])

  const triggerRetrain = async () => {
    const ok = window.confirm("Are you sure you want to trigger manual retraining now?")
    if (!ok) return

    setRetraining(true)
    setError(null)
    setMessage(null)
    try {
      const token = getToken()
      const res = await fetch(`${API_BASE}/api/ml/retrain`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      const data = await res.json()
      if (!res.ok || data.success === false) {
        throw new Error(data?.error || data?.detail || "Manual retrain failed")
      }
      setMessage("Manual retraining triggered successfully.")
      await fetchAll()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Manual retrain failed")
    } finally {
      setRetraining(false)
    }
  }

  const chartData = useMemo(() => {
    const sourceRows = history.length > 0
      ? history
      : performance
        ? [
            {
              timestamp: health?.last_trained || new Date().toISOString(),
              binary_accuracy: performance.binary_accuracy,
              family_accuracy: performance.family_accuracy,
              type_accuracy: performance.type_accuracy,
              source: performance.source || "current_model",
              training_samples_count: performance.training_samples_count,
            },
          ]
        : []

    return sourceRows
      .slice()
      .reverse()
      .map((row, idx) => ({
        idx: idx + 1,
        label: row.timestamp ? new Date(row.timestamp).toLocaleDateString() : `Run ${idx + 1}`,
        binary: Math.round((Number(row.binary_accuracy) || 0) * 100),
        family: Math.round((Number(row.family_accuracy) || 0) * 100),
        type: Math.round((Number(row.type_accuracy) || 0) * 100),
      }))
  }, [health?.last_trained, history, performance])

  const topFamilies = useMemo(() => {
    const sourceRows = history.length > 0
      ? history
      : performance
        ? [{ source: performance.source || "current_model" }]
        : []

    const counts: Record<string, number> = {}
    for (const row of sourceRows) {
      const src = (row as any)?.source || "unknown"
      counts[src] = (counts[src] || 0) + 1
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [history, performance])

  const latestMetrics = useMemo(() => {
    return history[0] || performance || null
  }, [history, performance])

  return (
    <div className="relative min-h-full bg-[#080808] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary mb-1">Machine Learning</p>
            <h1 className="text-2xl font-semibold text-white">ML Classification Dashboard</h1>
            <p className="text-muted-foreground mt-1">Operational status, training quality, and feedback analytics</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => void fetchAll()}
              className="px-3 py-2 rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] text-slate-200 text-sm inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button
              onClick={() => void triggerRetrain()}
              disabled={retraining}
              className="px-3 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 text-sm inline-flex items-center gap-2 disabled:opacity-60"
            >
              {retraining ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Trigger Retrain
            </button>
          </div>
        </div>

        {loading && (
          <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-8 flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading ML dashboard...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {!loading && message && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300">
            {message}
          </div>
        )}

        {!loading && health && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4">
              <p className="text-xs text-muted-foreground mb-1">Model Available</p>
              <p className={`text-lg font-semibold ${health.available ? "text-emerald-300" : "text-amber-300"}`}>
                {health.available ? "Yes" : "No"}
              </p>
            </div>
            <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4">
              <p className="text-xs text-muted-foreground mb-1">Models Loaded</p>
              <p className="text-lg font-semibold text-white">{health.models_loaded ? "Loaded" : "Not Loaded"}</p>
            </div>
            <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4">
              <p className="text-xs text-muted-foreground mb-1">Samples Count</p>
              <p className="text-lg font-semibold text-white">{health.samples_count}</p>
            </div>
            <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4">
              <p className="text-xs text-muted-foreground mb-1">Last Trained</p>
              <p className="text-sm text-white">{health.last_trained ? new Date(health.last_trained).toLocaleString() : "N/A"}</p>
            </div>
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4">
              <p className="text-sm font-semibold text-foreground mb-3">Training Accuracy History</p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
                    <XAxis dataKey="label" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="binary" stroke="#00ff88" name="Binary %" strokeWidth={2} dot={chartData.length <= 1} />
                    <Line type="monotone" dataKey="family" stroke="#22d3ee" name="Family %" strokeWidth={2} dot={chartData.length <= 1} />
                    <Line type="monotone" dataKey="type" stroke="#f472b6" name="Type %" strokeWidth={2} dot={chartData.length <= 1} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4">
              <p className="text-sm font-semibold text-foreground mb-3">Top Training Sources</p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topFamilies}>
                    <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4">
              <p className="text-sm font-semibold text-foreground mb-3">Simplified Confusion Matrix</p>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-2 border border-[#1a1a1a] text-muted-foreground">Metric</th>
                    <th className="text-left p-2 border border-[#1a1a1a] text-muted-foreground">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border border-[#1a1a1a]">Family Accuracy</td>
                    <td className="p-2 border border-[#1a1a1a]">{latestMetrics?.family_accuracy != null ? `${Math.round((Number(latestMetrics.family_accuracy) || 0) * 100)}%` : "N/A"}</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-[#1a1a1a]">Type Accuracy</td>
                    <td className="p-2 border border-[#1a1a1a]">{latestMetrics?.type_accuracy != null ? `${Math.round((Number(latestMetrics.type_accuracy) || 0) * 100)}%` : "N/A"}</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-[#1a1a1a]">Binary Accuracy</td>
                    <td className="p-2 border border-[#1a1a1a]">{latestMetrics?.binary_accuracy != null ? `${Math.round((Number(latestMetrics.binary_accuracy) || 0) * 100)}%` : "N/A"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4">
              <p className="text-sm font-semibold text-foreground mb-3">Feedback Statistics</p>
              <div className="space-y-3 text-sm">
                <div className="rounded-lg border border-[#1a1a1a] bg-black/20 p-3">
                  <p className="text-muted-foreground">Total Corrections</p>
                  <p className="text-white font-semibold">{feedbackStats?.total_feedback ?? 0}</p>
                </div>
                <div className="rounded-lg border border-[#1a1a1a] bg-black/20 p-3">
                  <p className="text-muted-foreground">Overall Feedback Accuracy</p>
                  <p className="text-white font-semibold">{Math.round((feedbackStats?.overall_accuracy || 0) * 100)}%</p>
                </div>
                <div className="rounded-lg border border-[#1a1a1a] bg-black/20 p-3">
                  <p className="text-muted-foreground">Corrections Today</p>
                  <p className="text-white font-semibold">{feedbackStats?.feedback_today ?? 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
