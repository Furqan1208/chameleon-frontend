// app/dashboard/upload/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DropZone } from "@/components/upload/DropZone"
import { FilePreview } from "@/components/upload/FilePreview"
import { UploadProgress } from "@/components/upload/UploadProgress"
import { apiService } from "@/services/api/api.service"
import { calculateFileHash, simpleHashExtraction } from "@/lib/hash-utils"
import { FileText, Brain, Shield, Zap, Info, Layers, Globe } from "lucide-react"

export default function UploadPage() {
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [analysisType, setAnalysisType] = useState<"complete" | "parse" | "parse_and_ai" | "ai">("complete")
  const [aiModel, setAiModel] = useState("gemini-2.5-flash")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStage, setUploadStage] = useState<"idle" | "uploading" | "analyzing" | "complete">("idle")
  const [error, setError] = useState<string | null>(null)
  const [fileHash, setFileHash] = useState<string | null>(null)

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

    setIsUploading(true)
    setUploadStage("uploading")
    setUploadProgress(0)
    setError(null)

    try {
      // Upload progress animation — phase 1
      for (let i = 0; i < 30; i += Math.random() * 10) {
        setUploadProgress(Math.min(i, 30))
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      setUploadStage("analyzing")

      // ✅ Use apiService.uploadFile — automatically attaches Bearer token
      const result = await apiService.uploadFile(selectedFile, analysisType, aiModel)

      // Upload progress animation — phase 2
      for (let i = 30; i < 90; i += Math.random() * 15) {
        setUploadProgress(Math.min(i, 90))
        await new Promise((resolve) => setTimeout(resolve, 150))
      }

      setUploadStage("complete")
      setUploadProgress(100)

      setTimeout(() => {
        router.push(`/dashboard/analysis/${result.analysis_id}?hash=${fileHash || ""}`)
      }, 1000)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Upload failed"
      setError(errorMsg)
      setIsUploading(false)
      setUploadStage("idle")
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
      case "ai":
        return "Upload already parsed JSON data for AI-powered analysis only"
      default:
        return ""
    }
  }

  const getAnalysisTypeIcon = (type: string) => {
    switch (type) {
      case "complete": return <Zap className="w-5 h-5" />
      case "parse":    return <FileText className="w-5 h-5" />
      case "parse_and_ai": return <Layers className="w-5 h-5" />
      case "ai":       return <Brain className="w-5 h-5" />
      default:         return <Zap className="w-5 h-5" />
    }
  }

  const getAnalysisTypeTitle = (type: string) => {
    switch (type) {
      case "complete":     return "Complete Analysis"
      case "parse":        return "Parse Only"
      case "parse_and_ai": return "Parse + AI Analysis"
      case "ai":           return "AI Only"
      default:             return "Complete Analysis"
    }
  }

  const getAnalysisTypeDescriptionCard = (type: string) => {
    switch (type) {
      case "complete":     return "File → CAPE → Parse → AI"
      case "parse":        return "CAPE JSON → Parse"
      case "parse_and_ai": return "CAPE JSON → Parse → AI"
      case "ai":           return "Parsed JSON → AI"
      default:             return "File → CAPE → Parse → AI"
    }
  }

  return (
    <div className="relative min-h-full bg-[#080808]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.028]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute -right-20 top-8 h-72 w-72 rounded-full bg-primary/8 blur-3xl" />
      </div>

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        <div className="space-y-8">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary mb-1">Intake</p>
            <h1 className="text-2xl font-semibold text-white mb-2">Upload & Analyze</h1>
            <p className="text-muted-foreground">
              Choose analysis type and submit file for comprehensive malware analysis
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {error && (
              <div className="rounded-lg border border-destructive/40 bg-[#0d0d0d] p-4 text-destructive text-sm shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
                {error}
              </div>
            )}

            <DropZone onFileDrop={handleFileDrop} selectedFile={selectedFile} />

            {selectedFile && !isUploading && (
              <FilePreview file={selectedFile} onClear={() => setSelectedFile(null)} />
            )}

            {selectedFile && fileHash && !isUploading && (
              <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">File hash calculated:</span>
                  <code className="font-mono text-xs bg-background px-2 py-1 rounded">
                    {fileHash.substring(0, 16)}...
                  </code>
                  <span className="text-xs text-muted-foreground ml-auto">
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
              />
            )}

            {selectedFile && !isUploading && (
              <div className="space-y-6">
                {/* Analysis Type Selection */}
                <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Analysis Type</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(["complete", "parse", "parse_and_ai", "ai"] as const).map((type) => (
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
                          type === "parse_and_ai" ? "pink" : "accent"
                        }
                        recommended={
                          (type === "complete" && !selectedFile.name.toLowerCase().endsWith(".json")) ||
                          (type === "parse_and_ai" && selectedFile.name.toLowerCase().endsWith(".json"))
                        }
                      />
                    ))}
                  </div>

                  <div className="mt-4 p-3 bg-black/20 border border-[#1a1a1a] rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      <p className="text-sm text-muted-foreground">{getAnalysisTypeDescription()}</p>
                    </div>
                  </div>
                </div>

                {/* Threat Intel Notice */}
                {fileHash && (
                  <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
                    <div className="flex items-start gap-3">
                      <Globe className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-foreground">Immediate Threat Intelligence</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          While your file is being analyzed, we'll immediately query threat intelligence
                          sources (VirusTotal, MalwareBazaar, Hybrid Analysis, AlienVault OTX) using the
                          file hash. Results will be available in the Threat Intel tab within seconds.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Model Selection */}
                {(analysisType === "complete" || analysisType === "parse_and_ai" || analysisType === "ai") && (
                  <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
                    <details className="cursor-pointer group" open>
                      <summary className="flex items-center justify-between font-medium text-foreground hover:text-primary transition-colors">
                        <div className="flex items-center gap-2">
                          <Shield className="w-5 h-5" />
                          <span>AI Model Selection</span>
                        </div>
                        <span className="group-open:rotate-90 transition-transform">→</span>
                      </summary>

                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            AI Model
                          </label>
                          <select
                            value={aiModel}
                            onChange={(e) => setAiModel(e.target.value)}
                            className="w-full px-3 py-2 bg-black/20 border border-[#1a1a1a] rounded-lg text-foreground focus:outline-none focus:border-primary/40"
                          >
                            <option value="gemini-2.5-flash">Gemini 2.5 Flash (recommended)</option>
                            <option value="gemini-2.5-pro">Gemini 2.5 Pro (high context)</option>
                            <option value="gemini-2.0-flash">Gemini 2.0 Flash (balanced)</option>
                            <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite (fast)</option>
                          </select>
                          <p className="text-xs text-muted-foreground mt-1">
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
                  className="w-full px-6 py-4 bg-gradient-to-r from-primary to-emerald-400 text-black font-semibold rounded-lg hover:brightness-105 transition-colors shadow-[0_10px_26px_rgba(0,255,136,0.18)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
  color: "green" | "blue" | "pink" | "accent"
  recommended?: boolean
}) {
  const borderColor = selected ? "border-primary/50" : "border-[#1a1a1a]"
  const iconColor = selected ? "text-primary" : "text-muted-foreground"

  return (
    <button
      onClick={onSelect}
      className={`relative text-left p-4 rounded-lg border transition-all duration-200 ${borderColor} shadow-[0_8px_22px_rgba(0,0,0,0.2)] hover:scale-[1.01] ${
        selected ? "bg-primary/5" : "bg-black/10 hover:bg-white/[0.02]"
      }`}
    >
      {selected && <span className="absolute left-0 top-0 h-full w-1 rounded-l-lg bg-primary" />}
      {recommended && (
        <span className="absolute -top-2 -right-2 px-2 py-1 bg-primary text-black text-xs font-semibold rounded-full">
          Recommended
        </span>
      )}

      <div className="flex items-start gap-3">
        <div className={iconColor}>{icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-foreground">{title}</h4>
            {selected && <span className="w-2 h-2 rounded-full bg-primary" />}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </button>
  )
}