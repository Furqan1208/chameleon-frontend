// app/dashboard/upload/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DropZone } from "@/components/upload/DropZone"
import { FilePreview } from "@/components/upload/FilePreview"
import { UploadProgress } from "@/components/upload/UploadProgress"
import { NetworkBackground } from "@/components/3d/NetworkBackground"
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
    <div className="relative min-h-full bg-background">
      <NetworkBackground />

      <div className="relative z-10 p-6 lg:p-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Upload & Analyze</h1>
            <p className="text-muted-foreground">
              Choose analysis type and submit file for comprehensive malware analysis
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {error && (
              <div className="glass border border-destructive rounded-lg p-4 text-destructive text-sm">
                {error}
              </div>
            )}

            <DropZone onFileDrop={handleFileDrop} selectedFile={selectedFile} />

            {selectedFile && !isUploading && (
              <FilePreview file={selectedFile} onClear={() => setSelectedFile(null)} />
            )}

            {selectedFile && fileHash && !isUploading && (
              <div className="glass border border-primary/20 bg-primary/5 rounded-lg p-4">
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
                <div className="glass border border-border rounded-lg p-6">
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

                  <div className="mt-4 p-3 bg-muted/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      <p className="text-sm text-muted-foreground">{getAnalysisTypeDescription()}</p>
                    </div>
                  </div>
                </div>

                {/* Threat Intel Notice */}
                {fileHash && (
                  <div className="glass border border-purple-500/20 bg-purple-500/5 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Globe className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
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
                  <div className="glass border border-border rounded-lg p-6">
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
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
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
                  className="w-full px-6 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors neon-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
  const borderColor = selected
    ? color === "green" ? "border-primary"
    : color === "blue"  ? "border-secondary"
    : color === "pink"  ? "border-accent"
    : "border-primary"
    : "border-border"

  const glowClass = selected
    ? color === "green" ? "glow-green"
    : color === "blue"  ? "glow-blue"
    : color === "pink"  ? "glow-pink"
    : "glow-green"
    : ""

  const iconColor =
    color === "green" ? "text-primary"
    : color === "blue"  ? "text-secondary"
    : color === "pink"  ? "text-accent"
    : "text-primary"

  return (
    <button
      onClick={onSelect}
      className={`relative text-left p-4 rounded-lg border-2 transition-all duration-200 ${borderColor} ${glowClass} hover:scale-[1.02] ${
        selected ? "bg-muted/20" : "bg-muted/5"
      }`}
    >
      {recommended && (
        <span className="absolute -top-2 -right-2 px-2 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
          Recommended
        </span>
      )}

      <div className="flex items-start gap-3">
        <div className={iconColor}>{icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-foreground">{title}</h4>
            {selected && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </button>
  )
}