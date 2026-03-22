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
  Copy,
  Shield,
  Globe,
  Activity,
  BarChart3,
  Sparkles,
  ChevronRight
} from "lucide-react"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from "recharts"
import {apiService } from "@/services/api/api.service"

// Import modular components
import {
  OverviewDashboard,
  CapeAnalysisDashboard,
  ParsedAnalysisDashboard,
  AIAnalysisDashboard,
  ThreatIntelDashboard,
  extractFileHashes,
  getMalscore
} from "@/components/analysis"

// Import helper components
import ViewCard from "@/components/shared/ViewCard"

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
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [pdfLoading, setPdfLoading] = useState(false)

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

  const handlePdfDownload = async () => {
    try {
      setPdfLoading(true)
      await apiService.downloadPdfReport(analysisId)
    } catch (err) {
      console.error("PDF report download failed:", err)
      alert(err instanceof Error ? err.message : "Failed to download PDF report")
    } finally {
      setPdfLoading(false)
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

  const componentHealthData = [
    { name: "Overview", value: combinedAnalysis ? 1 : 0, color: "#00ff88" },
    { name: "Threat Intel", value: hasThreatIntel ? 1 : 0, color: "#a855f7" },
    { name: "CAPE", value: hasCape ? 1 : 0, color: "#3b82f6" },
    { name: "Parsed", value: hasParsed ? 1 : 0, color: "#ec4899" },
    { name: "AI", value: hasAi ? 1 : 0, color: "#22d3ee" }
  ]

  // Use one source only (prefer CAPE when both are present) to avoid duplicated counts.
  const densitySource: "cape" | "parsed" = hasCape ? "cape" : "parsed"
  const densitySourceLabel = densitySource === "cape" ? "CAPE only" : "Parsed only"

  const densityCounts = {
    signatures:
      densitySource === "cape"
        ? (capeData?.signatures?.length || 0)
        : (parsedData?.sections?.signatures?.signatures?.length || 0),
    processes:
      densitySource === "cape"
        ? (capeData?.behavior?.processes?.length || 0)
        : (parsedData?.sections?.behavior?.data?.processes?.length || 0),
    indicators:
      densitySource === "cape"
        ? (capeData?.ttps?.length || 0)
        : (parsedData?.sections?.signatures?.ttps?.length || 0),
    iocs:
      densitySource === "cape"
        ? (capeData?.dropped?.length || 0)
        : (parsedData?.sections?.strings?.metadata?.total_strings_processed || 0)
  }

  const analysisVolumeData = [
    {
      name: "Signatures",
      value: densityCounts.signatures,
      fill: "#2f8f83"
    },
    {
      name: "Processes",
      value: densityCounts.processes,
      fill: "#3f9f8f"
    },
    {
      name: "Indicators",
      value: densityCounts.indicators,
      fill: "#4fb0a0"
    },
    {
      name: "IOCs",
      value: densityCounts.iocs,
      fill: "#63c2af"
    }
  ].filter((d) => d.value > 0)

  const componentReady = componentHealthData.filter((item) => item.value === 1).length

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] px-3 py-2 text-xs shadow-xl">
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color ?? p.fill }} className="font-medium">
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className="relative min-h-full bg-[#080808]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}
        />
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-sky-500/5 blur-3xl" />
      </div>
      <NetworkBackground />

      <div className="relative z-10 p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg border border-[#1a1a1a] bg-[#0d0d0d]">
                  <Shield className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary mb-1">Investigation Workspace</p>
                  <h1 className="text-2xl lg:text-3xl font-semibold text-white">Analysis Results</h1>
                  <p className="text-muted-foreground text-sm">
                    {fileHashes?.filename || combinedAnalysis?.filename || "Malware analysis report"} • ID: <span className="font-mono">{analysisId.substring(0, 8)}...</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleDownload("json")}
                disabled={downloadProgress > 0}
                className="px-3 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/20 transition-colors flex items-center gap-2 text-sm relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
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

          {!loading && combinedAnalysis && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Component Health
                  </p>
                  <span className="text-xs text-muted-foreground">{componentReady}/5 ready</span>
                </div>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={componentHealthData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={58}
                        dataKey="value"
                        stroke="none"
                      >
                        {componentHealthData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4 lg:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-cyan-300" />
                    Data Density Snapshot
                  </p>
                  <span className="text-xs text-slate-300/90 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-teal-300" />
                    Live from {densitySourceLabel}
                  </span>
                </div>
                {analysisVolumeData.length > 0 ? (
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analysisVolumeData}>
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(79,176,160,0.10)" }} />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]} fillOpacity={0.86}>
                          {analysisVolumeData.map((entry) => (
                            <Cell key={entry.name} fill={entry.fill as string} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
                    Waiting for component data to populate this chart.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-8 lg:p-12 flex flex-col items-center justify-center gap-4">
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
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Investigation Views</p>
                  <p className="text-sm text-foreground/85">Switch between Sandbox and AI deep-dive analysis tabs.</p>
                </div>
                <button
                  onClick={handlePdfDownload}
                  disabled={pdfLoading || (!hasCape && !hasAi)}
                  className="px-3 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/20 transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {pdfLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Export PDF</span>
                    </>
                  )}
                </button>
              </div>

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
                    label="Sandbox Report"
                    active={activeView === "cape"}
                    onClick={() => setActiveView("cape")}
                    color="blue"
                    description="Raw & structured sandbox data"
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
                <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-300" />
                      Analysis Components
                    </p>
                    <p className="text-xs text-slate-300/90 flex items-center gap-1">
                      Deep-dive views
                      <ChevronRight className="w-3 h-3 text-indigo-300" />
                    </p>
                  </div>
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
                            : "bg-slate-500/10 text-slate-300 border border-slate-500/25"
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
                  <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4 lg:p-5">
                    <OverviewDashboard
                      combinedAnalysis={combinedAnalysis}
                      fileHashes={fileHashes || {}}
                      malscore={malscore}
                      capeData={capeData}
                      parsedData={parsedData}
                      aiData={aiData}
                    />
                  </div>
                )}

                {activeView === "threat-intel" && (
                  <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4 lg:p-5">
                    <div>
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
                  <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4 lg:p-5">
                    <div>
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
                  <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4 lg:p-5">
                    <div>
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
                  <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4 lg:p-5">
                    <div>
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