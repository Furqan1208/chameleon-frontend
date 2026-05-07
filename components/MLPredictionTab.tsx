"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, CheckCircle2, Loader2, Shield, ShieldAlert, ShieldCheck, XCircle } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts"

type TopFamily = { family: string; confidence: number }

type MLPrediction = {
  ml_available: boolean
  is_malicious: boolean
  confidence: number
  malware_family: string
  family_confidence: number
  malware_type: string
  type_confidence: number
  top_3_families: TopFamily[]
  vt_insights?: {
    popular_threat_label?: string | null
    popular_threat_name?: string | null
    popular_threat_category?: string[]
    family_labels?: string[]
    suggested_family?: string | null
    suggested_type?: string | null
    threat_level?: string | null
    threat_score?: number | null
    detection_ratio?: string | null
    vt_url?: string | null
  } | null
  vt_assisted?: boolean
  model_used: string
  training_samples_count: number
  prediction_time_ms: number
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001"

const FAMILY_OPTIONS = [
  "unknown",
  "malware",
  "ransomware",
  "zeus",
  "agenttesla",
  "redline",
  "loki",
  "qakbot",
  "emotet",
  "trickbot",
  "dridex",
  "formbook",
  "vidar",
  "remcos",
  "cryptolocker",
  "wannacry",
  "ryuk",
  "lockbit",
  "conti",
  "darkside",
  "petya",
  "revil",
  "gandcrab",
  "loader",
  "backdoor",
  "worm",
  "spyware",
  "adware",
  "trojan",
]

const TYPE_OPTIONS = [
  "unknown",
  "malware",
  "ransomware",
  "banker",
  "trojan",
  "pws",
  "coinminer",
  "rat",
  "keylogger",
  "loader",
  "dropper",
  "backdoor",
  "worm",
  "spyware",
  "adware",
  "botnet",
  "stealer",
  "cryptor",
]

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

function threatBadge(prediction: MLPrediction) {
  if (!prediction.ml_available) {
    return {
      label: "UNKNOWN",
      className: "bg-slate-500/10 border-slate-500/30 text-slate-300",
      icon: Shield,
    }
  }
  if (prediction.is_malicious) {
    return {
      label: "MALICIOUS",
      className: "bg-red-500/10 border-red-500/30 text-red-300",
      icon: ShieldAlert,
    }
  }
  return {
    label: "BENIGN",
    className: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
    icon: ShieldCheck,
  }
}

export default function MLPredictionTab({ analysisId }: { analysisId: string }) {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [prediction, setPrediction] = useState<MLPrediction | null>(null)
  const [showCorrection, setShowCorrection] = useState(false)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [correctedFamily, setCorrectedFamily] = useState("unknown")
  const [correctedType, setCorrectedType] = useState("unknown")
  const [customFamily, setCustomFamily] = useState("")
  const [customType, setCustomType] = useState("")
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)

  const fetchPrediction = async () => {
    setLoading(true)
    setError(null)
    setFeedbackMessage(null)
    setFeedbackSubmitted(false)
    try {
      const token = getToken()
      const res = await fetch(`${API_BASE}/api/ml/predict/${analysisId}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      const data = await res.json()
      if (!res.ok || data.success === false) {
        throw new Error(data?.error || data?.detail || "Failed to get ML prediction")
      }

      setPrediction(data.data)
      setCorrectedFamily(data.data?.malware_family || "unknown")
      setCorrectedType(data.data?.malware_type || "unknown")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load ML prediction")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (analysisId) {
      void fetchPrediction()
    }
  }, [analysisId])

  const submitFeedback = async (family: string, type: string) => {
    setSubmitting(true)
    setError(null)
    setFeedbackMessage(null)
    try {
      const token = getToken()
      const res = await fetch(`${API_BASE}/api/ml/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          analysis_id: analysisId,
          corrected_family: (customFamily.trim() || family || "unknown").toLowerCase(),
          corrected_type: (customType.trim() || type || "unknown").toLowerCase(),
        }),
      })

      const data = await res.json()
      if (!res.ok || data.success === false) {
        throw new Error(data?.error || data?.detail || "Failed to submit feedback")
      }

      setFeedbackMessage("Feedback submitted successfully. Thank you.")
      setFeedbackSubmitted(true)
      setShowCorrection(false)
      setCustomFamily("")
      setCustomType("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit feedback")
    } finally {
      setSubmitting(false)
    }
  }

  const gaugeData = useMemo(() => {
    const value = Math.max(0, Math.min(100, Math.round((prediction?.confidence || 0) * 100)))
    return [
      { name: "Confidence", value },
      { name: "Remaining", value: 100 - value },
    ]
  }, [prediction])

  const alternatives = prediction?.top_3_families || []
  const badge = prediction ? threatBadge(prediction) : null

  return (
    <div className="space-y-4">
      {loading && (
        <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-8 flex items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading ML classification...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5" />
          <div>
            <p className="font-medium">ML prediction failed</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        </div>
      )}

      {!loading && prediction && !prediction.ml_available && (
        <div className="rounded-xl border border-slate-500/30 bg-slate-500/10 p-6 text-slate-200">
          <p className="font-medium mb-1">Model training in progress - check back in a few minutes</p>
          <p className="text-sm text-slate-300/90">Existing CAPE + Gemini analysis continues normally while ML models are unavailable.</p>
        </div>
      )}

      {!loading && prediction && prediction.ml_available && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4">
              <p className="text-sm font-semibold text-foreground mb-3">Confidence Gauge</p>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gaugeData}
                      dataKey="value"
                      innerRadius={55}
                      outerRadius={72}
                      startAngle={90}
                      endAngle={-270}
                      stroke="none"
                    >
                      <Cell fill="#00ff88" />
                      <Cell fill="#1f2937" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-center text-sm text-muted-foreground">Overall confidence: <span className="text-foreground font-semibold">{Math.round((prediction.confidence || 0) * 100)}%</span></p>
            </div>

            <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4 lg:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <p className="text-sm font-semibold text-foreground">Classification Verdict</p>
                {badge && (
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-semibold ${badge.className}`}>
                    <badge.icon className="w-3.5 h-3.5" />
                    {badge.label}
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Predicted Family</span>
                    <span className="text-foreground font-medium">{prediction.malware_family}</span>
                  </div>
                  <div className="h-2 rounded bg-slate-800 overflow-hidden">
                    <div className="h-full bg-cyan-400" style={{ width: `${Math.round(prediction.family_confidence * 100)}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Predicted Type</span>
                    <span className="text-foreground font-medium">{prediction.malware_type}</span>
                  </div>
                  <div className="h-2 rounded bg-slate-800 overflow-hidden">
                    <div className="h-full bg-fuchsia-400" style={{ width: `${Math.round(prediction.type_confidence * 100)}%` }} />
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground mb-2">Top 3 Alternative Families</p>
                  <div className="flex flex-wrap gap-2">
                    {alternatives.length ? (
                      alternatives.map((item) => (
                        <span
                          key={item.family}
                          className="px-2 py-1 rounded-full border border-slate-600 bg-slate-900 text-xs text-slate-200"
                        >
                          {item.family} ({Math.round(item.confidence * 100)}%)
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">No alternatives available</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {prediction.vt_assisted && prediction.vt_insights && (
            <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4">
              <p className="text-sm font-semibold text-foreground mb-3">VirusTotal Label Assist</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-[#1a1a1a] bg-black/20 p-3">
                  <p className="text-muted-foreground">Popular Threat Label</p>
                  <p className="text-foreground break-all">{prediction.vt_insights.popular_threat_label || "N/A"}</p>
                </div>
                <div className="rounded-lg border border-[#1a1a1a] bg-black/20 p-3">
                  <p className="text-muted-foreground">Threat Categories</p>
                  <p className="text-foreground">{prediction.vt_insights.popular_threat_category?.join(", ") || "N/A"}</p>
                </div>
                <div className="rounded-lg border border-[#1a1a1a] bg-black/20 p-3">
                  <p className="text-muted-foreground">Family Labels</p>
                  <p className="text-foreground">{prediction.vt_insights.family_labels?.join(", ") || "N/A"}</p>
                </div>
                <div className="rounded-lg border border-[#1a1a1a] bg-black/20 p-3">
                  <p className="text-muted-foreground">VT Threat Score</p>
                  <p className="text-foreground">{prediction.vt_insights.threat_score ?? 0}%</p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4">
            <p className="text-sm font-semibold text-foreground mb-3">Prediction Metadata</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg border border-[#1a1a1a] bg-black/20 p-3">
                <p className="text-muted-foreground">Model</p>
                <p className="text-foreground">{prediction.model_used}</p>
              </div>
              <div className="rounded-lg border border-[#1a1a1a] bg-black/20 p-3">
                <p className="text-muted-foreground">Training Samples</p>
                <p className="text-foreground">{prediction.training_samples_count}</p>
              </div>
              <div className="rounded-lg border border-[#1a1a1a] bg-black/20 p-3">
                <p className="text-muted-foreground">Prediction Time</p>
                <p className="text-foreground">{prediction.prediction_time_ms.toFixed(2)} ms</p>
              </div>
            </div>
          </div>

          {!feedbackSubmitted && (
          <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4">
            <p className="text-sm font-semibold text-foreground mb-3">Feedback</p>
            <div className="flex flex-wrap gap-2">
              <button
                disabled={submitting}
                onClick={() => void submitFeedback(prediction.malware_family, prediction.malware_type)}
                className="px-3 py-2 rounded-lg border border-emerald-500/35 bg-emerald-500/15 text-emerald-300 text-sm inline-flex items-center gap-2 disabled:opacity-60"
              >
                <CheckCircle2 className="w-4 h-4" />
                Correct Prediction
              </button>
              <button
                disabled={submitting}
                onClick={() => setShowCorrection((v) => !v)}
                className="px-3 py-2 rounded-lg border border-red-500/35 bg-red-500/15 text-red-300 text-sm inline-flex items-center gap-2 disabled:opacity-60"
              >
                <XCircle className="w-4 h-4" />
                Wrong Prediction
              </button>
            </div>

            {showCorrection && (
              <div className="mt-4 rounded-lg border border-[#1a1a1a] bg-black/20 p-4 space-y-3">
                <p className="text-sm text-muted-foreground">Provide corrected labels to improve the model over time.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Correct Family</label>
                    <select
                      value={correctedFamily}
                      onChange={(e) => setCorrectedFamily(e.target.value)}
                      className="w-full rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] px-3 py-2 text-sm"
                    >
                      {FAMILY_OPTIONS.map((family) => (
                        <option key={family} value={family}>{family}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Or enter custom family (e.g., cryptolocker)"
                      value={customFamily}
                      onChange={(e) => setCustomFamily(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Correct Type</label>
                    <select
                      value={correctedType}
                      onChange={(e) => setCorrectedType(e.target.value)}
                      className="w-full rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] px-3 py-2 text-sm"
                    >
                      {TYPE_OPTIONS.map((mtype) => (
                        <option key={mtype} value={mtype}>{mtype}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Or enter custom type (e.g., ransomware)"
                      value={customType}
                      onChange={(e) => setCustomType(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <button
                  disabled={submitting}
                  onClick={() => void submitFeedback(correctedFamily, correctedType)}
                  className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : "Submit Correction"}
                </button>
              </div>
            )}

            {feedbackMessage && (
              <p className="mt-3 text-sm text-emerald-300">{feedbackMessage}</p>
            )}
          </div>
          )}

          {feedbackSubmitted && feedbackMessage && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300 text-sm">
              {feedbackMessage}
            </div>
          )}
        </>
      )}
    </div>
  )
}
