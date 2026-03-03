// app/dashboard/analysis/[id]/page.tsx
"use client"

import { useParams, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { useAnalysis } from "@/hooks/useAnalysis"
import { useAnalysisData } from "@/hooks/useAnalysisData"
import { NetworkBackground } from "@/components/3d/NetworkBackground"
import {
  Loader,
  FileJson,
  FileText,
  Brain,
  Layers,
  Download,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Copy,
  Shield,
  File,
  ExternalLink,
  AlertCircle,
  Globe
} from "lucide-react"
import { apiService } from "@/lib/api-service"
import { formatDistanceToNow } from "date-fns"

// Import modular components
import {
  OverviewDashboard,
  CapeAnalysisDashboard,
  ParsedAnalysisDashboard,
  AIAnalysisDashboard,
  ThreatIntelDashboard,  // New import
  extractFileHashes,
  getMalscore
} from "@/components/analysis"

// Import helper components
import ViewCard from "@/components/shared/ViewCard"
import StatCard from "@/components/shared/StatCard"

export default function AnalysisPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const analysisId = params.id as string
  const initialHash = searchParams.get('hash')

  const { analysis: originalAnalysis, loading: originalLoading, error: originalError } = useAnalysis(analysisId)
  const { overviewData, loading: overviewLoading, error: overviewError } = useAnalysisData(analysisId)

  const [activeView, setActiveView] = useState<"overview" | "cape" | "parsed" | "ai" | "threat-intel">("overview")
  const [components, setComponents] = useState<any>(null)
  const [capeData, setCapeData] = useState<any>(null)
  const [parsedData, setParsedData] = useState<any>(null)
  const [aiData, setAiData] = useState<any>(null)
  const [loadingComponents, setLoadingComponents] = useState(false)
  const [copied, setCopied] = useState(false)
  const [viewMode, setViewMode] = useState<"pretty" | "raw">("pretty")
  const [downloadProgress, setDownloadProgress] = useState(0)

  const loading = originalLoading || overviewLoading || loadingComponents
  const error = originalError || overviewError

  useEffect(() => {
    if (analysisId) {
      loadComponents()
    }
  }, [analysisId])

  const loadComponents = async () => {
    try {
      setLoadingComponents(true)
      const comps = await apiService.getAnalysisComponents(analysisId)
      setComponents(comps)

      // Load CAPE data if available
      if (comps.components?.cape) {
        try {
          const cape = await apiService.getCapeReport(analysisId)
          setCapeData(cape.data || cape)
        } catch (err) {
          console.warn("Failed to load CAPE data:", err)
        }
      }

      // Load parsed data if available
      if (comps.components?.parsed) {
        try {
          const parsed = await apiService.getParsedSection(analysisId, "all")
          setParsedData(parsed.data || parsed)
        } catch (err) {
          console.warn("Failed to load parsed data:", err)
        }
      }

      // Load AI data if available
      if (comps.components?.ai_analysis) {
        try {
          const ai = await apiService.getAiAnalysis(analysisId, "summary")
          const aiResponse = ai.data || ai

          if (aiResponse.results) {
            setAiData(aiResponse)
          } else if (aiResponse.sections) {
            const results: any = {}
            Object.entries(aiResponse.sections).forEach(([key, value]: [string, any]) => {
              if (value.analysis) {
                results[key] = value.analysis
              } else {
                results[key] = value
              }
            })
            setAiData({
              ...aiResponse,
              results,
              sections_analyzed: Object.keys(aiResponse.sections || {})
            })
          } else {
            setAiData(aiResponse)
          }
        } catch (err) {
          console.warn("Failed to load AI data:", err)
        }
      }
    } catch (err) {
      console.warn("Failed to load components:", err)
    } finally {
      setLoadingComponents(false)
    }
  }

  const handleDownload = async (format: string) => {
    try {
      setDownloadProgress(0)
      const interval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      const data = await apiService.downloadReport(analysisId, format as any)

      clearInterval(interval)
      setDownloadProgress(100)

      const jsonStr = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonStr], { type: "application/json" })
      const url = window.URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = `${analysisId}.${format}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)

      setTimeout(() => setDownloadProgress(0), 1000)
    } catch (err) {
      console.error("Download failed:", err)
      alert("Download failed. Please try again.")
      setDownloadProgress(0)
    }
  }

  const handleCopyJson = (data: any) => {
    try {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Copy failed:", err)
    }
  }

  // Extract file hashes from parsed data or use initial hash from upload
  const fileHashes = extractFileHashes(parsedData) || (initialHash ? {
    sha256: initialHash,
    md5: '',
    sha1: '',
    filename: originalAnalysis?.filename || 'Unknown'
  } : null)
  
  const malscore = getMalscore(capeData, overviewData, originalAnalysis, parsedData)

  const combinedAnalysis = originalAnalysis || overviewData ? {
    ...(originalAnalysis || {}),
    ...(overviewData || {}),
    analysis_id: analysisId,
    filename: fileHashes?.filename || originalAnalysis?.filename || overviewData?.filename || "Unknown",
    created_at: originalAnalysis?.created_at || overviewData?.created_at || new Date().toISOString(),
    status: originalAnalysis?.status || overviewData?.status || "completed",
    malscore: malscore,
    file_hashes: fileHashes,
    parsed_results: {
      sections: parsedData?.sections || {}
    }
  } : null

  // Determine which components are available
  const hasCape = components?.components?.cape || false
  const hasParsed = components?.components?.parsed || false
  const hasAi = components?.components?.ai_analysis || false
  const hasThreatIntel = !!fileHashes // Threat intel is available if we have hashes

  return (
    <div className="relative min-h-full bg-background">
      <NetworkBackground />

      <div className="relative z-10 p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-8 h-8 text-primary" />
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Analysis Results</h1>
                  <p className="text-muted-foreground text-sm">
                    {fileHashes?.filename || combinedAnalysis?.filename || "Malware analysis report"} • ID: <span className="font-mono">{analysisId.substring(0, 8)}...</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {activeView === "cape" && (
                <button
                  onClick={() => setViewMode(viewMode === "pretty" ? "raw" : "pretty")}
                  className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted/20 transition-colors flex items-center gap-2 text-sm"
                  disabled={downloadProgress > 0}
                >
                  {viewMode === "pretty" ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {viewMode === "pretty" ? "Raw View" : "Structured View"}
                </button>
              )}
              <button
                onClick={() => handleDownload("json")}
                disabled={downloadProgress > 0}
                className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm relative overflow-hidden"
              >
                {downloadProgress > 0 ? (
                  <>
                    <Loader className="w-3 h-3 animate-spin" />
                    <span className="text-xs">Downloading... {downloadProgress}%</span>
                    <div
                      className="absolute bottom-0 left-0 h-0.5 bg-primary/30 transition-all duration-300"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </>
                ) : (
                  <>
                    <Download className="w-3 h-3" />
                    <span className="text-xs">Export JSON</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="glass border border-border rounded-xl p-8 lg:p-12 flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <Loader className="w-10 h-10 text-primary animate-spin" />
              </div>
              <p className="text-muted-foreground">Loading analysis results...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="glass border border-destructive/50 rounded-xl p-4 lg:p-6 bg-destructive/5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-destructive mb-2">Error Loading Analysis</p>
                  <p className="text-sm text-foreground/80">{error}</p>
                </div>
              </div>
            </div>
          )}

          {combinedAnalysis && !loading && (
            <>
              {/* View Selector Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <ViewCard
                  icon={<Layers className="w-4 h-4" />}
                  label="Overview"
                  active={activeView === "overview"}
                  onClick={() => setActiveView("overview")}
                  color="green"
                  description="Summary & visualizations"
                />

                {hasThreatIntel && (
                  <ViewCard
                    icon={<Globe className="w-4 h-4" />}
                    label="Threat Intel"
                    active={activeView === "threat-intel"}
                    onClick={() => setActiveView("threat-intel")}
                    color="purple"
                    description="Real-time threat intelligence"
                  />
                )}

                {hasCape && (
                  <ViewCard
                    icon={<FileJson className="w-4 h-4" />}
                    label="Cape Report"
                    active={activeView === "cape"}
                    onClick={() => setActiveView("cape")}
                    color="blue"
                    description="Raw & structured CAPE data"
                  />
                )}

                {hasParsed && (
                  <ViewCard
                    icon={<FileText className="w-4 h-4" />}
                    label="Parsed"
                    active={activeView === "parsed"}
                    onClick={() => setActiveView("parsed")}
                    color="pink"
                    description="Structured analysis"
                  />
                )}

                {hasAi && (
                  <ViewCard
                    icon={<Brain className="w-4 h-4" />}
                    label="AI Analysis"
                    active={activeView === "ai"}
                    onClick={() => setActiveView("ai")}
                    color="accent"
                    description="AI-powered insights"
                  />
                )}
              </div>

              {/* Component Status */}
              {components && (
                <div className="glass border border-border rounded-xl p-4 bg-muted/5">
                  <p className="text-sm text-muted-foreground mb-3">Analysis Components</p>
                  <div className="flex flex-wrap gap-2">
                    {hasThreatIntel && (
                      <div className="px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 bg-purple-500/10 text-purple-500 border border-purple-500/20">
                        <CheckCircle className="w-3 h-3" />
                        <span>Threat Intel</span>
                      </div>
                    )}
                    {Object.entries(components.components || {}).map(([key, value]) => (
                      <div
                        key={key}
                        className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                          value
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "bg-muted/20 text-muted-foreground border border-border"
                        }`}
                      >
                        {value ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        <span className="capitalize">{key.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active View Content */}
              <div className="space-y-6">
                {activeView === "overview" && (
                  <div className="glass border border-border rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <Layers className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-foreground">Analysis Overview</h2>
                        <p className="text-sm text-muted-foreground">
                          Complete analysis summary and key findings
                        </p>
                      </div>
                    </div>
                    
                    <OverviewDashboard
                      combinedAnalysis={combinedAnalysis}
                      fileHashes={fileHashes}
                      malscore={malscore}
                      capeData={capeData}
                      parsedData={parsedData}
                      aiData={aiData}
                    />
                  </div>
                )}

                {activeView === "threat-intel" && (
                  <div className="glass border border-border rounded-xl p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                          <Globe className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-foreground">Threat Intelligence</h2>
                          <p className="text-sm text-muted-foreground">
                            Real-time threat intelligence from multiple sources
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      {fileHashes ? (
                        <ThreatIntelDashboard 
                          fileHashes={fileHashes}
                          onCopyJson={() => handleCopyJson({
                            virustotal: null, // We'll implement this later if needed
                            malwarebazaar: null,
                            hybridanalysis: null,
                            alienvault: null
                          })}
                          copied={copied}
                        />
                      ) : (
                        <div className="text-center py-8">
                          <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground">No file hashes available for threat intelligence lookup</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeView === "cape" && (
                  <div className="glass border border-border rounded-xl p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <FileJson className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-foreground">CAPE Analysis</h2>
                          <p className="text-sm text-muted-foreground">
                            Comprehensive behavioral analysis from CAPE sandbox
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyJson(capeData)}
                          className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted/20 transition-colors flex items-center gap-2 text-sm"
                        >
                          <Copy className="w-3 h-3" />
                          {copied ? "Copied!" : "Copy JSON"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-6">
                      {loadingComponents ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader className="w-6 h-6 text-primary animate-spin" />
                        </div>
                      ) : capeData ? (
                        <CapeAnalysisDashboard 
                          capeData={capeData} 
                          loading={loadingComponents}
                          onCopyJson={() => handleCopyJson(capeData)}
                          copied={copied}
                          onDownload={handleDownload}
                        />
                      ) : (
                        <div className="text-center py-8">
                          <FileJson className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground">No CAPE data available</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeView === "parsed" && (
                  <div className="glass border border-border rounded-xl p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-pink-500/10 rounded-lg">
                          <FileText className="w-5 h-5 text-pink-500" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-foreground">Parsed Analysis</h2>
                          <p className="text-sm text-muted-foreground">
                            Structured insights from CAPE sandbox analysis
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyJson(parsedData)}
                          className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted/20 transition-colors flex items-center gap-2 text-sm"
                        >
                          <Copy className="w-3 h-3" />
                          Copy All
                        </button>
                      </div>
                    </div>

                    <div className="mt-6">
                      {loadingComponents ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader className="w-6 h-6 text-primary animate-spin" />
                        </div>
                      ) : parsedData ? (
                        <ParsedAnalysisDashboard 
                          data={parsedData} 
                          loading={loadingComponents}
                          onCopyJson={() => handleCopyJson(parsedData)}
                          copied={copied}
                          onDownload={handleDownload}
                        />
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground">No parsed data available</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeView === "ai" && (
                  <div className="glass border border-border rounded-xl p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Brain className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-foreground">AI Analysis</h2>
                          <p className="text-sm text-muted-foreground">
                            AI-powered insights and threat intelligence
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyJson(aiData)}
                          className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted/20 transition-colors flex items-center gap-2 text-sm"
                        >
                          <Copy className="w-3 h-3" />
                          Copy All
                        </button>
                      </div>
                    </div>

                    <div className="mt-6">
                      {loadingComponents ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader className="w-6 h-6 text-primary animate-spin" />
                        </div>
                      ) : aiData ? (
                        <AIAnalysisDashboard 
                          data={aiData} 
                          loading={loadingComponents}
                          onCopyJson={() => handleCopyJson(aiData)}
                          copied={copied}
                          onDownload={handleDownload}
                        />
                      ) : (
                        <div className="text-center py-8">
                          <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground">No AI analysis available</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {!loading && !error && !combinedAnalysis && (
            <div className="glass border border-border rounded-xl p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-2">No analysis found</p>
              <p className="text-sm text-muted-foreground">
                The analysis with ID <span className="font-mono">{analysisId}</span> could not be found.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}