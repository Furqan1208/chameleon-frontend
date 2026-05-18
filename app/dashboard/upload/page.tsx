// app/dashboard/upload/page.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { DropZone } from "@/components/upload/DropZone"
import { FilePreview } from "@/components/upload/FilePreview"
import { UploadProgress } from "@/components/upload/UploadProgress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { apiService } from "@/services/api/api.service"
import { calculateFileHash, simpleHashExtraction } from "@/lib/hash-utils"
import { isCompletedStatus, isFailedStatus } from "@/lib/analysis-status"
import { FileText, Shield, Zap, Info, Layers, Globe } from "lucide-react"

const ICON_TONES = {
  emerald: "text-emerald-300",
  sky: "text-sky-300",
  slate: "text-slate-300/90",
  violet: "text-violet-300",
}

export default function UploadPage() {
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [analysisType, setAnalysisType] = useState<"complete" | "parse" | "parse_and_ai">("complete")
  const [aiModel, setAiModel] = useState("gemini-2.5-flash")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStage, setUploadStage] = useState<"idle" | "uploading" | "analyzing" | "complete">("idle")
  const [uploadDetail, setUploadDetail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [fileHash, setFileHash] = useState<string | null>(null)

  const targetProgressRef = useRef(0)
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const trackedAnalysisIdRef = useRef<string | null>(null)
  const stageTimingRef = useRef<{ key: string; startedAt: number }>({
    key: "",
    startedAt: Date.now(),
  })

  useEffect(() => {
    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current)
      }
    }
  }, [])

  const setTargetProgress = (value: number) => {
    targetProgressRef.current = Math.max(targetProgressRef.current, Math.min(value, 99))
  }

  const startSmoothProgress = () => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current)
    }

    progressTimerRef.current = setInterval(() => {
      setUploadProgress((prev) => {
        const target = targetProgressRef.current
        if (prev >= target) return prev
        const delta = target - prev
        const step = delta > 15 ? 1.8 : delta > 6 ? 0.9 : 0.35
        return Math.min(target, prev + step)
      })
    }, 180)
  }

  const stepStageProgress = (
    key: string,
    label: string,
    base: number,
    max: number,
    perSecond: number,
  ) => {
    if (stageTimingRef.current.key !== key) {
      stageTimingRef.current = { key, startedAt: Date.now() }
    }

    const elapsedSeconds = (Date.now() - stageTimingRef.current.startedAt) / 1000
    const nextTarget = Math.min(max, base + elapsedSeconds * perSecond)

    setUploadDetail(label)
    setTargetProgress(nextTarget)
  }

  const extractReports = (payload: any): any[] => {
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.data)) return payload.data
    return []
  }

  const detectCurrentAnalysisId = async (fileName: string, startMs: number) => {
    const reportsPayload = await apiService.getAllReports()
    const reports = extractReports(reportsPayload)

    const candidates = reports
      .filter((report) => report?.filename === fileName)
      .filter((report) => {
        const createdAt = new Date(report?.created_at || 0).getTime()
        return createdAt >= startMs - 180000
      })
      .sort(
        (a, b) =>
          new Date(b?.created_at || 0).getTime() - new Date(a?.created_at || 0).getTime(),
      )

    return candidates[0]?.analysis_id || null
  }

  const updateProgressFromAnalysis = (analysis: any, type: "complete" | "parse" | "parse_and_ai") => {
    const components = analysis?.components || {}

    if (isCompletedStatus(analysis?.status)) {
      stepStageProgress("finalize", "Finalizing report and preparing dashboard...", 97, 99, 0.25)
      return
    }

    if (type === "parse") {
      if (!components.parsed) {
        stepStageProgress("parse_only_parse", "Parsing CAPE sections (target, behavior, signatures, strings)...", 42, 84, 1.1)
      } else {
        stepStageProgress("parse_only_finalize", "Saving parsed sections and indexing analysis...", 90, 96, 0.45)
      }
      return
    }

    if (type === "complete") {
      if (!components.cape) {
        stepStageProgress("complete_cape", "Running CAPE sandbox analysis...", 18, 50, 0.65)
        return
      }

      if (!components.parsed) {
        stepStageProgress("complete_parse", "Parsing CAPE report into structured sections...", 52, 76, 0.85)
        return
      }

      if (!components.ai_analysis) {
        stepStageProgress("complete_ai", "Running AI section analysis and final synthesis...", 78, 95, 0.4)
        return
      }

      stepStageProgress("complete_finalize", "Storing AI results and scoring threat confidence...", 96, 99, 0.25)
      return
    }

    if (!components.parsed) {
      stepStageProgress("parse_ai_parse", "Parsing CAPE report sections and extracting IOCs...", 40, 72, 0.9)
      return
    }

    if (!components.ai_analysis) {
      stepStageProgress("parse_ai_ai", "Running AI priorities and final synthesis...", 74, 95, 0.45)
      return
    }

    stepStageProgress("parse_ai_finalize", "Persisting AI output and preparing report...", 96, 99, 0.25)
  }

  const handleFileDrop = async (file: File) => {
    setSelectedFile(file)
    setError(null)

    try {
      const hash = await calculateFileHash(file)
      setFileHash(hash.sha256)
      console.log(`[Upload] File SHA256: ${hash.sha256}`)
    } catch (error) {
      console.error("[Upload] Failed to calculate hash:", error)
      const fallbackHash = await simpleHashExtraction(file)
      setFileHash(fallbackHash)
    }

    if (file.name.toLowerCase().endsWith(".json")) {
      setAnalysisType("parse_and_ai")
    }
  }

  const handleStartAnalysis = async () => {
    if (!selectedFile) return

    const fileToUpload = selectedFile
    const startedAt = Date.now()
    let monitorEnabled = true

    setIsUploading(true)
    setUploadStage("uploading")
    setUploadProgress(0)
    setUploadDetail("Uploading file and creating analysis job...")
    setError(null)
    targetProgressRef.current = 0
    trackedAnalysisIdRef.current = null
    stageTimingRef.current = { key: "", startedAt: Date.now() }
    startSmoothProgress()

    try {
      const uploadPromise = apiService.uploadFile(fileToUpload, analysisType, aiModel)

      const monitorPromise = (async () => {
        while (monitorEnabled) {
          try {
            if (!trackedAnalysisIdRef.current) {
              const discoveredId = await detectCurrentAnalysisId(fileToUpload.name, startedAt)
              if (discoveredId) {
                trackedAnalysisIdRef.current = discoveredId
                setUploadStage("analyzing")
              } else {
                stepStageProgress("discover", "Uploading file and preparing analysis workspace...", 6, 24, 0.8)
              }
            }

            if (trackedAnalysisIdRef.current) {
              const analysis = await apiService.getAnalysis(trackedAnalysisIdRef.current)

              if (isFailedStatus(analysis?.status)) {
                throw new Error(analysis?.error || "Analysis failed during processing")
              }

              setUploadStage("analyzing")
              updateProgressFromAnalysis(analysis, analysisType)
            }
          } catch (monitorError) {
            const message =
              monitorError instanceof Error
                ? monitorError.message
                : "Failed to monitor analysis progress"
            setError(message)
          }

          await new Promise((resolve) => setTimeout(resolve, 1600))
        }
      })()

      const result = await uploadPromise
      monitorEnabled = false
      await monitorPromise

      setUploadStage("complete")
      setUploadDetail("Analysis complete. Redirecting to results...")
      setUploadProgress(100)
      targetProgressRef.current = 100

      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current)
      }

      setTimeout(() => {
        router.push(`/dashboard/analysis/${result.analysis_id}?hash=${fileHash || ""}`)
      }, 1000)
    } catch (err) {
      monitorEnabled = false
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current)
      }

      const errorMsg = err instanceof Error ? err.message : "Upload failed"
      setError(errorMsg)
      setIsUploading(false)
      setUploadStage("idle")
      setUploadDetail("")
    }
  }

  const getAnalysisTypeDescription = () => {
    switch (analysisType) {
      case "complete":
        return "Upload any file for comprehensive analysis: CAPE sandbox → parsing → AI analysis"
      case "parse":
        return "Upload existing CAPE JSON report for parsing only (structured analysis)"
      case "parse_and_ai":
        return "Upload existing CAPE JSON report for parsing AND AI analysis"
      default:
        return ""
    }
  }

  const getAnalysisTypeIcon = (type: string) => {
    switch (type) {
      case "complete": return <Zap className="w-5 h-5" />
      case "parse":    return <FileText className="w-5 h-5" />
      case "parse_and_ai": return <Layers className="w-5 h-5" />
      default:         return <Zap className="w-5 h-5" />
    }
  }

  const getAnalysisTypeTitle = (type: string) => {
    switch (type) {
      case "complete":     return "Complete Analysis"
      case "parse":        return "Parse Only"
      case "parse_and_ai": return "Parse + AI Analysis"
      default:             return "Complete Analysis"
    }
  }

  const getAnalysisTypeDescriptionCard = (type: string) => {
    switch (type) {
      case "complete":     return "File → CAPE → Parse → AI"
      case "parse":        return "CAPE JSON → Parse"
      case "parse_and_ai": return "CAPE JSON → Parse → AI"
      default:             return "File → CAPE → Parse → AI"
    }
  }

  return (
    <div className="relative min-h-full bg-[#131313]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute -right-20 top-8 h-72 w-72 rounded-full bg-emerald-500/6 blur-3xl" />
        <div className="absolute -left-16 bottom-0 h-72 w-72 rounded-full bg-sky-500/4 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl p-6">
        <div className="space-y-8">
          <div className="rounded-3xl border border-border bg-card/50 p-6 shadow-2xl shadow-black/10 backdrop-blur-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.18em] text-emerald-400">Intake</p>
                <h1 className="text-3xl font-bold text-white">Upload &amp; Analyze</h1>
                <p className="mt-2 text-sm text-white/65">
                  Choose analysis type and submit a file for CAPE, parsing, and AI-assisted malware analysis.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:w-[320px]">
                <StatCard label="Modes" value={3} />
                <StatCard label="Threat Intel" value="Live" />
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {error && (
              <div className="rounded-2xl border border-destructive/30 bg-red-500/10 p-4 text-sm text-red-300 shadow-2xl shadow-black/10">
                {error}
              </div>
            )}

            <DropZone onFileDrop={handleFileDrop} selectedFile={selectedFile} />

            {selectedFile && !isUploading && (
              <FilePreview file={selectedFile} onClear={() => setSelectedFile(null)} />
            )}

            {selectedFile && fileHash && !isUploading && (
              <div className="rounded-2xl border border-border bg-card/50 p-4 shadow-2xl shadow-black/10 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className={`w-4 h-4 ${ICON_TONES.emerald}`} />
                  <span className="text-white/70">File hash calculated:</span>
                  <code className="rounded border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-xs text-white/85">
                    {fileHash.substring(0, 16)}...
                  </code>
                  <span className="ml-auto text-xs text-white/55">
                    Will be used for immediate threat intelligence
                  </span>
                </div>
              </div>
            )}

            {isUploading && (
              <UploadProgress
                progress={uploadProgress}
                stage={uploadStage}
                fileName={selectedFile?.name || ""}
                detail={uploadDetail}
              />
            )}

            {selectedFile && !isUploading && (
              <div className="space-y-6">
                {/* Analysis Type Selection */}
                <div className="rounded-3xl border border-border bg-card/50 p-6 shadow-2xl shadow-black/10 backdrop-blur-sm">
                  <h3 className="mb-4 text-lg font-bold text-white">Analysis Type</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(["complete", "parse", "parse_and_ai"] as const).map((type) => (
                      <AnalysisTypeCard
                        key={type}
                        type={type}
                        icon={getAnalysisTypeIcon(type)}
                        title={getAnalysisTypeTitle(type)}
                        description={getAnalysisTypeDescriptionCard(type)}
                        selected={analysisType === type}
                        onSelect={() => setAnalysisType(type)}
                        color={
                          type === "complete" ? "green" :
                          type === "parse" ? "blue" :
                          "pink"
                        }
                        recommended={
                          (type === "complete" && !selectedFile.name.toLowerCase().endsWith(".json")) ||
                          (type === "parse_and_ai" && selectedFile.name.toLowerCase().endsWith(".json"))
                        }
                      />
                    ))}
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/5 bg-white/[0.02] p-3">
                    <div className="flex items-start gap-2">
                      <Info className={`w-4 h-4 ${ICON_TONES.slate} mt-0.5 shrink-0`} />
                      <p className="text-sm text-white/65">{getAnalysisTypeDescription()}</p>
                    </div>
                  </div>
                </div>

                {/* Threat Intel Notice */}
                {fileHash && (
                  <div className="rounded-3xl border border-border bg-card/50 p-4 shadow-2xl shadow-black/10 backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                      <Globe className={`w-5 h-5 ${ICON_TONES.sky} shrink-0 mt-0.5`} />
                      <div>
                        <h4 className="font-semibold text-white">Immediate Threat Intelligence</h4>
                        <p className="mt-1 text-sm text-white/65">
                          While your file is being analyzed, we'll immediately query threat intelligence
                          sources (VirusTotal, MalwareBazaar, Hybrid Analysis, AlienVault OTX) using the
                          file hash. Results will be available in the Threat Intel tab within seconds.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Model Selection */}
                {(analysisType === "complete" || analysisType === "parse_and_ai") && (
                  <div className="rounded-3xl border border-border bg-card/50 p-6 shadow-2xl shadow-black/10 backdrop-blur-sm">
                    <details className="cursor-pointer group" open>
                      <summary className="flex items-center justify-between font-medium text-white transition-colors hover:text-emerald-300">
                        <div className="flex items-center gap-2">
                          <Shield className={`w-5 h-5 ${ICON_TONES.violet}`} />
                          <span>AI Model Selection</span>
                        </div>
                        <span className="transition-transform group-open:rotate-90">→</span>
                      </summary>

                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-white">
                            AI Model
                          </label>
                          <Select value={aiModel} onValueChange={setAiModel}>
                            <SelectTrigger className="h-10 w-full rounded-xl border-border bg-card px-3 text-foreground hover:border-primary/40 focus-visible:border-primary/40 focus-visible:ring-primary/20">
                              <SelectValue placeholder="Select AI model" />
                            </SelectTrigger>
                            <SelectContent className="border-border bg-card text-foreground">
                              <SelectItem className="focus:bg-primary/20 focus:text-foreground data-[state=checked]:bg-primary/20 data-[state=checked]:text-foreground" value="gemini-2.5-flash">Gemini 2.5 Flash (recommended)</SelectItem>
                              <SelectItem className="focus:bg-primary/20 focus:text-foreground data-[state=checked]:bg-primary/20 data-[state=checked]:text-foreground" value="gemini-2.5-pro">Gemini 2.5 Pro (high context)</SelectItem>
                              <SelectItem className="focus:bg-primary/20 focus:text-foreground data-[state=checked]:bg-primary/20 data-[state=checked]:text-foreground" value="gemini-2.0-flash">Gemini 2.0 Flash (balanced)</SelectItem>
                              <SelectItem className="focus:bg-primary/20 focus:text-foreground data-[state=checked]:bg-primary/20 data-[state=checked]:text-foreground" value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite (fast)</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="mt-1 text-xs text-white/55">
                            Model used for AI analysis section
                          </p>
                        </div>
                      </div>
                    </details>
                  </div>
                )}

                {/* Start Analysis Button */}
                <button
                  onClick={handleStartAnalysis}
                  disabled={isUploading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 px-6 py-4 font-semibold text-black shadow-[0_14px_30px_rgba(16,185,129,0.18)] transition-colors hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <span className="animate-spin">⟳</span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Start {getAnalysisTypeTitle(analysisType)}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function AnalysisTypeCard({
  type,
  icon,
  title,
  description,
  selected,
  onSelect,
  color,
  recommended = false,
}: {
  type: string
  icon: React.ReactNode
  title: string
  description: string
  selected: boolean
  onSelect: () => void
  color: "green" | "blue" | "pink"
  recommended?: boolean
}) {
  const borderColor = selected ? "border-emerald-500/40" : "border-white/5"
  const iconToneByType = {
    green: "bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-300/15",
    blue: "bg-sky-400/10 text-sky-300 ring-1 ring-sky-300/15",
    pink: "bg-rose-400/10 text-rose-300 ring-1 ring-rose-300/15",
  } as const
  const iconColor = selected
    ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25"
    : iconToneByType[color]

  return (
    <button
      onClick={onSelect}
      className={`relative text-left p-4 rounded-lg border transition-all duration-200 ${borderColor} shadow-[0_8px_22px_rgba(0,0,0,0.2)] hover:scale-[1.01] ${
        selected ? "bg-emerald-500/[0.06]" : "bg-white/[0.02] hover:bg-white/[0.04]"
      }`}
    >
      {selected && <span className="absolute left-0 top-0 h-full w-1 rounded-l-lg bg-emerald-400" />}
      {recommended && (
        <span className="absolute -top-2 -right-2 rounded-full bg-emerald-400 px-2 py-1 text-xs font-semibold text-black">
          Recommended
        </span>
      )}

      <div className="flex items-start gap-3">
        <div className={`p-1.5 rounded-md ${iconColor}`}>{icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-white">{title}</h4>
            {selected && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
          </div>
          <p className="text-sm text-white/60">{description}</p>
        </div>
      </div>
    </button>
  )
}

function StatCard({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-4 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-wide text-white/55">{label}</p>
      <h3 className="mt-1 text-xl font-semibold text-white">{value}</h3>
    </div>
  )
}