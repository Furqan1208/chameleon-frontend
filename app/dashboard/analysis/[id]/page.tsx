// D:\FYP\Chameleon Frontend\app\dashboard\analysis\[id]\page.tsx
"use client"

import { useParams } from "next/navigation"
import { useState, useEffect, useMemo } from "react"
import { useAnalysis } from "@/hooks/useAnalysis"
import { useAnalysisData } from "@/hooks/useAnalysisData"
import { NetworkBackground } from "@/components/3d/NetworkBackground"
import { AnalysisOverview } from "@/components/analysis/AnalysisOverview"
import { BehaviorVisualizer } from "@/components/analysis/BehaviorVisualizer"
import { MemoryAnalysis } from "@/components/analysis/MemoryAnalysis"
import { StringsAnalysis } from "@/components/analysis/StringsAnalysis"
import { SignaturesAnalysis } from "@/components/analysis/SignaturesAnalysis"
import { AIAnalysisResults } from "@/components/analysis/AIAnalysisResults"
import { ThreatGauge } from "@/components/charts/ThreatGauge"
import { 
  Loader, 
  FileJson, 
  FileText, 
  Brain, 
  Layers, 
  ChevronDown, 
  ChevronUp,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  Copy,
  Shield,
  Activity,
  Database,
  Type,
  FileSignature,
  Search,
  Code,
  Cpu,
  Network,
  File,
  HardDrive,
  BarChart3,
  Hash,
  Fingerprint,
  Cpu as CpuIcon,
  Terminal,
  Globe,
  Server,
  Key,
  Users,
  Settings,
  Database as DatabaseIcon,
  Binary,
  FileCode,
  Package,
  FolderTree,
  FileArchive,
  DownloadCloud,
  ExternalLink
} from "lucide-react"
import { apiService } from "@/lib/api-service"
import { formatDistanceToNow } from "date-fns"

// Custom JSON viewer component with fallback - ALWAYS RAW for CAPE data
const CustomJSONViewer = ({ data, mode, isCapeData = false }: { data: any, mode: "pretty" | "raw", isCapeData?: boolean }) => {
  // Always use raw mode for CAPE data since it's too large for pretty view
  if (isCapeData || mode === "raw") {
    return (
      <pre className="text-sm text-foreground font-mono whitespace-pre-wrap break-words leading-relaxed">
        {JSON.stringify(data, null, 2)}
      </pre>
    )
  }

  // Pretty view for smaller data
  try {
    return (
      <div className="json-pretty-container">
        <pre className="text-sm text-foreground font-mono whitespace-pre-wrap break-words leading-relaxed">
          {JSON.stringify(data, null, 2)}
        </pre>
        <style jsx global>{`
          .json-pretty-container pre {
            font-family: 'Geist Mono', monospace;
            font-size: 13px;
          }
          .json-pretty-container .string { color: #f1fa8c; }
          .json-pretty-container .number { color: #bd93f9; }
          .json-pretty-container .boolean { color: #ff79c6; }
          .json-pretty-container .null { color: #ff5555; }
          .json-pretty-container .key { color: #8be9fd; }
        `}</style>
      </div>
    )
  } catch {
    return (
      <pre className="text-sm text-foreground font-mono whitespace-pre-wrap break-words">
        {JSON.stringify(data, null, 2)}
      </pre>
    )
  }
}

// Cape Report Structured Viewer
const CapeStructuredViewer = ({ data }: { data: any }) => {
  const [activeSection, setActiveSection] = useState<string>("file")

  const sections = useMemo(() => {
    if (!data || typeof data !== 'object') return []
    
    return Object.entries(data).map(([key, value]) => {
      let icon = <File className="w-4 h-4" />
      let description = ""
      
      switch(key) {
        case 'file':
          icon = <File className="w-4 h-4" />
          description = "File information and metadata"
          break
        case 'behavior':
          icon = <Activity className="w-4 h-4" />
          description = "Behavior analysis results"
          break
        case 'signatures':
          icon = <FileSignature className="w-4 h-4" />
          description = "Detection signatures"
          break
        case 'network':
          icon = <Globe className="w-4 h-4" />
          description = "Network activity"
          break
        case 'memory':
          icon = <HardDrive className="w-4 h-4" />
          description = "Memory analysis"
          break
        case 'target':
          icon = <Target className="w-4 h-4" />
          description = "Target information"
          break
        case 'statistics':
          icon = <BarChart3 className="w-4 h-4" />
          description = "Analysis statistics"
          break
        default:
          icon = <Code className="w-4 h-4" />
          description = "Additional data"
      }
      
      return { key, icon, description, value }
    })
  }, [data])

  const renderValue = (value: any, depth = 0) => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">null</span>
    }
    
    if (typeof value === 'string') {
      // Check if it looks like a hash
      if (/^[a-fA-F0-9]{32,64}$/.test(value)) {
        return (
          <div className="flex items-center gap-2">
            <Fingerprint className="w-3 h-3 text-primary" />
            <code className="text-primary font-mono text-sm">{value}</code>
          </div>
        )
      }
      
      // Check if it looks like a file path
      if (value.includes('/') || value.includes('\\')) {
        return (
          <div className="flex items-center gap-2">
            <FolderTree className="w-3 h-3 text-secondary" />
            <code className="text-foreground font-mono text-sm break-all">{value}</code>
          </div>
        )
      }
      
      return <span className="text-foreground">{value}</span>
    }
    
    if (typeof value === 'number') {
      return <span className="text-accent font-medium">{value}</span>
    }
    
    if (typeof value === 'boolean') {
      return (
        <span className={`px-2 py-1 rounded text-xs ${value ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
          {value.toString()}
        </span>
      )
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-muted-foreground italic">Empty array</span>
      }
      
      return (
        <div className="space-y-2">
          {value.slice(0, 5).map((item, index) => (
            <div key={index} className="pl-4 border-l border-border">
              {renderValue(item, depth + 1)}
            </div>
          ))}
          {value.length > 5 && (
            <div className="text-sm text-muted-foreground italic">
              + {value.length - 5} more items
            </div>
          )}
        </div>
      )
    }
    
    if (typeof value === 'object') {
      const entries = Object.entries(value)
      if (entries.length === 0) {
        return <span className="text-muted-foreground italic">Empty object</span>
      }
      
      return (
        <div className="space-y-3">
          {entries.map(([k, v]) => (
            <div key={k} className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-border" />
                <span className="text-sm font-medium text-muted-foreground capitalize">
                  {k.replace(/_/g, ' ')}:
                </span>
              </div>
              <div className="ml-4">
                {renderValue(v, depth + 1)}
              </div>
            </div>
          ))}
        </div>
      )
    }
    
    return <span className="text-foreground">{String(value)}</span>
  }

  if (!data || sections.length === 0) {
    return (
      <div className="text-center py-12">
        <FileJson className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No CAPE data available</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar */}
      <div className="lg:w-64 flex-shrink-0">
        <div className="glass border border-border rounded-lg p-4">
          <h4 className="font-semibold text-foreground mb-3">Sections</h4>
          <div className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors ${
                  activeSection === section.key
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'hover:bg-muted/20 text-muted-foreground'
                }`}
              >
                <div className={`${activeSection === section.key ? 'text-primary' : 'text-muted-foreground'}`}>
                  {section.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium capitalize truncate">
                    {section.key.replace(/_/g, ' ')}
                  </div>
                  <div className="text-xs opacity-70 truncate">
                    {section.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="glass border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              {sections.find(s => s.key === activeSection)?.icon || <FileJson className="w-6 h-6 text-blue-500" />}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground capitalize">
                {activeSection.replace(/_/g, ' ')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {sections.find(s => s.key === activeSection)?.description}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {renderValue(sections.find(s => s.key === activeSection)?.value)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AnalysisPage() {
  const params = useParams()
  const analysisId = params.id as string
  
  // Use both hooks
  const { analysis: originalAnalysis, loading: originalLoading, error: originalError } = useAnalysis(analysisId)
  const { overviewData, loading: overviewLoading, error: overviewError } = useAnalysisData(analysisId)
  
  const [activeView, setActiveView] = useState<"overview" | "cape" | "parsed" | "ai">("overview")
  const [components, setComponents] = useState<any>(null)
  const [capeData, setCapeData] = useState<any>(null)
  const [parsedData, setParsedData] = useState<any>(null)
  const [aiData, setAiData] = useState<any>(null)
  const [loadingComponents, setLoadingComponents] = useState(false)
  const [copied, setCopied] = useState(false)
  const [viewMode, setViewMode] = useState<"pretty" | "raw">("pretty")
  const [downloadProgress, setDownloadProgress] = useState(0)

  // Combine loading states
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
      
      // Load data for available components
      if (comps.components?.cape) {
        try {
          const cape = await apiService.getCapeReport(analysisId)
          setCapeData(cape.data || cape)
        } catch (err) {
          console.warn("Failed to load CAPE data:", err)
        }
      }
      
      if (comps.components?.parsed) {
        try {
          const parsed = await apiService.getParsedSection(analysisId, "all")
          setParsedData(parsed.data || parsed)
        } catch (err) {
          console.warn("Failed to load parsed data:", err)
        }
      }
      
      if (comps.components?.ai_analysis) {
        try {
          const ai = await apiService.getAiAnalysis(analysisId, "summary")
          const aiResponse = ai.data || ai
          
          // Transform data for consistent structure
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

      await apiService.downloadReport(analysisId, format as any)
      
      clearInterval(interval)
      setDownloadProgress(100)
      
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

  // Prepare combined analysis data for overview
  const combinedAnalysis = originalAnalysis || overviewData ? {
    ...(originalAnalysis || {}),
    ...(overviewData || {}),
    analysis_id: analysisId,
    filename: originalAnalysis?.filename || overviewData?.filename || "Unknown",
    created_at: originalAnalysis?.created_at || overviewData?.created_at || new Date().toISOString(),
    status: originalAnalysis?.status || overviewData?.status || "completed",
    malscore: originalAnalysis?.malscore || overviewData?.malscore || 0,
    parsed_results: {
      sections: parsedData?.sections || {}
    }
  } : null

  return (
    <div className="relative min-h-full bg-background">
      <NetworkBackground />

      <div className="relative z-10 p-6 lg:p-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-8 h-8 text-primary neon-text" />
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Analysis Results</h1>
                  <p className="text-muted-foreground">
                    {combinedAnalysis?.filename || "Malware analysis report"} • ID: <span className="font-mono text-sm">{analysisId}</span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {activeView === "cape" && (
                <button
                  onClick={() => setViewMode(viewMode === "pretty" ? "raw" : "pretty")}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted/20 transition-colors flex items-center gap-2"
                  disabled={downloadProgress > 0}
                >
                  {viewMode === "pretty" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {viewMode === "pretty" ? "Raw View" : "Structured View"}
                </button>
              )}
              <button
                onClick={() => handleDownload("json")}
                disabled={downloadProgress > 0}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 relative overflow-hidden"
              >
                {downloadProgress > 0 ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Downloading... {downloadProgress}%
                    <div 
                      className="absolute bottom-0 left-0 h-0.5 bg-primary/30 transition-all duration-300"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export JSON
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="glass border border-border rounded-xl p-12 flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <Loader className="w-12 h-12 text-primary animate-spin" />
                <div className="absolute inset-0 bg-primary/10 blur-lg"></div>
              </div>
              <p className="text-muted-foreground">Loading analysis results...</p>
              <p className="text-xs text-muted-foreground">This may take a moment</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="glass border border-destructive/50 rounded-xl p-6 bg-destructive/5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ViewCard
                  icon={<Layers className="w-5 h-5" />}
                  label="Overview"
                  active={activeView === "overview"}
                  onClick={() => setActiveView("overview")}
                  color="green"
                  description="Summary & visualizations"
                />
                
                {components?.components?.cape && (
                  <ViewCard
                    icon={<FileJson className="w-5 h-5" />}
                    label="Cape Report"
                    active={activeView === "cape"}
                    onClick={() => setActiveView("cape")}
                    color="blue"
                    description="Raw & structured CAPE data"
                  />
                )}
                
                {components?.components?.parsed && (
                  <ViewCard
                    icon={<FileText className="w-5 h-5" />}
                    label="Parsed"
                    active={activeView === "parsed"}
                    onClick={() => setActiveView("parsed")}
                    color="pink"
                    description="Structured analysis"
                  />
                )}
                
                {components?.components?.ai_analysis && (
                  <ViewCard
                    icon={<Brain className="w-5 h-5" />}
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
                    {Object.entries(components.components || {}).map(([key, value]) => (
                      <div
                        key={key}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                          value 
                            ? "bg-primary/10 text-primary border border-primary/20" 
                            : "bg-muted/20 text-muted-foreground border border-border"
                        }`}
                      >
                        {value ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <AlertTriangle className="w-4 h-4" />
                        )}
                        <span className="capitalize">{key.replace('_', ' ')}</span>
                        <span className={`w-2 h-2 rounded-full ${value ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`}></span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active View Content */}
              <div className="space-y-6">
                {activeView === "overview" && (
                  <>
                    <AnalysisOverview analysis={combinedAnalysis} />
                    
                    {/* Threat Gauge */}
                    {combinedAnalysis?.malscore !== undefined && (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                          <ThreatGauge 
                            score={combinedAnalysis.malscore} 
                            title="Threat Score"
                            size="md"
                          />
                        </div>
                        <div className="lg:col-span-2">
                          <div className="glass border border-border rounded-xl p-6 h-full">
                            <h3 className="text-lg font-semibold text-foreground mb-4">Quick Stats</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <StatCard 
                                label="Processes" 
                                value={parsedData?.sections?.behavior?.processes?.length || 0} 
                                icon={<Activity className="w-5 h-5" />}
                                color="blue"
                              />
                              <StatCard 
                                label="Signatures" 
                                value={parsedData?.sections?.signatures?.length || 0} 
                                icon={<FileSignature className="w-5 h-5" />}
                                color="pink"
                              />
                              <StatCard 
                                label="Strings" 
                                value={parsedData?.sections?.strings?.length || 0} 
                                icon={<Type className="w-5 h-5" />}
                                color="green"
                              />
                              <StatCard 
                                label="Duration" 
                                value={`${aiData?.duration_seconds?.toFixed(1)}s` || "N/A"} 
                                icon={<Clock className="w-5 h-5" />}
                                color="accent"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {parsedData?.sections?.behavior && (
                      <BehaviorVisualizer behavior={parsedData.sections.behavior} />
                    )}

                    {parsedData?.sections?.memory && (
                      <MemoryAnalysis memory={parsedData.sections.memory} />
                    )}

                    {parsedData?.sections?.strings && (
                      <StringsAnalysis strings={parsedData.sections.strings} />
                    )}

                    {parsedData?.sections?.signatures && (
                      <SignaturesAnalysis signatures={parsedData.sections.signatures} />
                    )}

                    {aiData && <AIAnalysisResults aiAnalysis={aiData} />}
                  </>
                )}

                {activeView === "cape" && (
                  <div className="glass border border-border rounded-xl p-0 overflow-hidden">
                    <div className="border-b border-border p-6 bg-muted/5">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-500/10 rounded-lg">
                            <FileJson className="w-6 h-6 text-blue-500" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-semibold text-foreground">CAPE Report</h2>
                            <p className="text-sm text-muted-foreground">
                              {viewMode === "raw" ? "Raw JSON data from CAPE sandbox" : "Structured CAPE analysis"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyJson(capeData)}
                            className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted/20 transition-colors flex items-center gap-2 text-sm"
                          >
                            <Copy className="w-4 h-4" />
                            {copied ? "Copied!" : "Copy JSON"}
                          </button>
                          <a
                            href={`${apiService.baseUrl}/analysis/${analysisId}/download?format=json`}
                            download
                            className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </a>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      {loadingComponents ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader className="w-8 h-8 text-primary animate-spin" />
                        </div>
                      ) : capeData ? (
                        viewMode === "raw" ? (
                          <div className="border border-border rounded-lg overflow-hidden">
                            <div className="border-b border-border p-4 bg-muted/5 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Code className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-medium text-foreground">Raw JSON Data</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {Object.keys(capeData).length} sections
                              </div>
                            </div>
                            <div className="max-h-[600px] overflow-y-auto p-4 bg-black/20">
                              <CustomJSONViewer data={capeData} mode="raw" isCapeData={true} />
                            </div>
                          </div>
                        ) : (
                          <CapeStructuredViewer data={capeData} />
                        )
                      ) : (
                        <div className="text-center py-12">
                          <FileJson className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No CAPE data available</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            This analysis does not contain CAPE report data
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeView === "parsed" && (
                  <div className="space-y-6">
                    <div className="glass border border-border rounded-xl p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-pink-500/10 rounded-lg">
                            <FileText className="w-6 h-6 text-pink-500" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-semibold text-foreground">Parsed Sections</h2>
                            <p className="text-sm text-muted-foreground">
                              Structured analysis extracted from CAPE report
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {parsedData?.sections ? Object.keys(parsedData.sections).length : 0} sections available
                        </div>
                      </div>
                      
                      {loadingComponents ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader className="w-8 h-8 text-primary animate-spin" />
                        </div>
                      ) : parsedData ? (
                        <div className="space-y-6">
                          {/* Parsed sections summary cards */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {Object.entries(parsedData.sections || {}).map(([key, value]) => (
                              <SectionCard
                                key={key}
                                name={key}
                                data={value}
                                icon={getSectionIcon(key)}
                              />
                            ))}
                          </div>
                          
                          {/* Section details */}
                          <div>
                            <h3 className="text-lg font-semibold text-foreground mb-4">Section Details</h3>
                            <div className="space-y-4">
                              {Object.entries(parsedData.sections || {}).map(([key, value]) => (
                                <ParsedSection 
                                  key={key} 
                                  name={key} 
                                  data={value} 
                                  viewMode={viewMode}
                                  onCopy={() => handleCopyJson(value)}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No parsed data available</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            This analysis does not contain parsed section data
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeView === "ai" && (
                  <div className="space-y-6">
                    <div className="glass border border-border rounded-xl p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Brain className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-semibold text-foreground">AI Analysis</h2>
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
                            <Copy className="w-4 h-4" />
                            Copy All
                          </button>
                        </div>
                      </div>
                      
                      {loadingComponents ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader className="w-8 h-8 text-primary animate-spin" />
                        </div>
                      ) : aiData ? (
                        <div className="space-y-6">
                          {/* AI Analysis Stats */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="glass border border-border rounded-lg p-4 hover:glow-blue transition-all">
                              <div className="flex items-center gap-3 mb-2">
                                <Cpu className="w-5 h-5 text-blue-500" />
                                <p className="text-sm text-muted-foreground">Sections Analyzed</p>
                              </div>
                              <p className="text-2xl font-bold text-foreground">
                                {aiData.sections_analyzed?.length || 0}
                              </p>
                            </div>
                            <div className="glass border border-border rounded-lg p-4 hover:glow-green transition-all">
                              <div className="flex items-center gap-3 mb-2">
                                <Clock className="w-5 h-5 text-green-500" />
                                <p className="text-sm text-muted-foreground">Duration</p>
                              </div>
                              <p className="text-2xl font-bold text-foreground">
                                {aiData.duration_seconds ? `${aiData.duration_seconds.toFixed(1)}s` : "N/A"}
                              </p>
                            </div>
                            <div className="glass border border-border rounded-lg p-4 hover:glow-pink transition-all">
                              <div className="flex items-center gap-3 mb-2">
                                <Network className="w-5 h-5 text-pink-500" />
                                <p className="text-sm text-muted-foreground">AI Model</p>
                              </div>
                              <p className="text-2xl font-bold text-foreground font-mono">
                                {aiData.model_used || "gemini-2.5-flash"}
                              </p>
                            </div>
                          </div>
                          
                          {/* AI Sections */}
                          <div>
                            <h3 className="text-lg font-semibold text-foreground mb-4">AI Analysis Sections</h3>
                            <div className="space-y-4">
                              {aiData.results && Object.entries(aiData.results).map(([section, data]: [string, any]) => (
                                <AISectionCard
                                  key={section}
                                  sectionName={section}
                                  data={data}
                                  viewMode={viewMode}
                                  onCopy={() => handleCopyJson(data)}
                                />
                              ))}
                            </div>
                          </div>
                          
                          {/* Model Usage Stats */}
                          {aiData.model_usage && Object.keys(aiData.model_usage).length > 0 && (
                            <div className="border border-border rounded-lg p-4 bg-muted/5">
                              <h3 className="font-semibold text-foreground mb-3">Model Usage Statistics</h3>
                              <div className="space-y-3">
                                {Object.entries(aiData.model_usage).map(([model, count]) => (
                                  <div key={model} className="flex items-center justify-between p-2 hover:bg-muted/10 rounded-lg transition-colors">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                      <span className="text-foreground font-mono text-sm">{model}</span>
                                    </div>
                                    <span className="text-muted-foreground bg-muted px-2 py-1 rounded text-sm">
                                      {count} request{Number(count) !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No AI analysis available</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            This analysis was performed without AI analysis or the AI analysis failed to load.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {!loading && !error && !combinedAnalysis && (
            <div className="glass border border-border rounded-xl p-12 text-center">
              <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
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

// Helper components
function ViewCard({
  icon,
  label,
  active,
  onClick,
  color,
  description
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
  color: "green" | "blue" | "pink" | "accent"
  description: string
}) {
  const activeClass = active 
    ? color === "green" 
      ? "bg-primary/10 border-primary text-primary" 
      : color === "blue"
        ? "bg-blue-500/10 border-blue-500 text-blue-500"
        : color === "pink"
          ? "bg-pink-500/10 border-pink-500 text-pink-500"
          : "bg-primary/10 border-primary text-primary"
    : "bg-muted/5 text-muted-foreground border-border hover:border-foreground/30"

  const glowClass = active 
    ? color === "green" ? "glow-green" 
    : color === "blue" ? "glow-blue" 
    : color === "pink" ? "glow-pink"
    : "glow-green" 
    : ""

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-start p-4 rounded-xl border transition-all duration-300 ${activeClass} ${glowClass} hover:scale-[1.02] group`}
    >
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="font-semibold">{label}</span>
      </div>
      <p className="text-xs text-left opacity-80 group-hover:opacity-100 transition-opacity">{description}</p>
    </button>
  )
}

function SectionCard({ name, data, icon }: { name: string; data: any; icon: React.ReactNode }) {
  const itemCount = Array.isArray(data) 
    ? data.length 
    : typeof data === 'object' 
      ? Object.keys(data).length 
      : 1

  const [isHovered, setIsHovered] = useState(false)

  return (
    <div 
      className="glass border border-border rounded-lg p-4 hover:bg-muted/10 transition-all duration-200 cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        const element = document.getElementById(`section-${name}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
          // Open the section
          const button = element.querySelector('button[data-expand]')
          if (button) {
            button.click()
          }
        }
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-muted rounded-lg group-hover:bg-muted/50 transition-colors">
          {icon}
        </div>
        <h4 className="font-medium text-foreground capitalize group-hover:text-primary transition-colors">{name}</h4>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </span>
        <div className={`transition-all duration-200 ${isHovered ? 'translate-x-1' : ''}`}>
          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    </div>
  )
}

function ParsedSection({ name, data, viewMode, onCopy }: { 
  name: string; 
  data: any; 
  viewMode: "pretty" | "raw";
  onCopy: () => void;
}) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  
  const handleCopy = () => {
    onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <div id={`section-${name}`} className="border border-border rounded-lg overflow-hidden">
      <div 
        className="p-4 bg-muted/5 hover:bg-muted/10 cursor-pointer flex items-center justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-muted rounded-lg">
            {getSectionIcon(name)}
          </div>
          <div>
            <h4 className="font-semibold text-foreground capitalize">{name}</h4>
            <p className="text-sm text-muted-foreground">
              {typeof data === 'object' ? Object.keys(data).length + ' properties' : 'data'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            data-expand
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
            className="p-2 rounded hover:bg-muted transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>
      
      {expanded && (
        <div className="border-t border-border">
          <div className="p-4 max-h-[400px] overflow-y-auto bg-black/20">
            <div className="flex justify-end mb-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1 text-xs border border-border rounded hover:bg-muted transition-colors flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <CustomJSONViewer data={data} mode={viewMode} />
          </div>
        </div>
      )}
    </div>
  )
}

function AISectionCard({ sectionName, data, viewMode, onCopy }: {
  sectionName: string;
  data: any;
  viewMode: "pretty" | "raw";
  onCopy: () => void;
}) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  
  const handleCopy = () => {
    onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  // Extract summary for preview
  const getPreview = () => {
    if (typeof data === 'string') {
      return data.slice(0, 150) + (data.length > 150 ? '...' : '')
    }
    if (data.analysis?.executive_summary?.overview) {
      return data.analysis.executive_summary.overview.slice(0, 150) + '...'
    }
    if (data.executive_summary?.overview) {
      return data.executive_summary.overview.slice(0, 150) + '...'
    }
    if (typeof data === 'object') {
      return 'Click to view detailed analysis'
    }
    return String(data).slice(0, 150) + '...'
  }
  
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-4 bg-muted/5 hover:bg-muted/10">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Search className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground capitalize">
                {sectionName.replace(/_/g, ' ')}
              </h4>
              <p className="text-sm text-muted-foreground">
                {sectionName === 'final_synthesis' ? 'Final comprehensive analysis' : 'Detailed section analysis'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-2 py-1 text-xs border border-border rounded hover:bg-muted transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded hover:bg-muted transition-colors"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        <div className="mt-3">
          <p className="text-sm text-foreground/80 line-clamp-2">
            {getPreview()}
          </p>
        </div>
      </div>
      
      {expanded && (
        <div className="border-t border-border">
          <div className="p-4 max-h-[500px] overflow-y-auto bg-black/20">
            <CustomJSONViewer data={data} mode={viewMode} />
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, color }: { 
  label: string; 
  value: string | number; 
  icon: React.ReactNode;
  color: "green" | "blue" | "pink" | "accent" 
}) {
  const colorClasses = {
    green: 'text-primary border-primary/20 bg-primary/5',
    blue: 'text-blue-500 border-blue-500/20 bg-blue-500/5',
    pink: 'text-pink-500 border-pink-500/20 bg-pink-500/5',
    accent: 'text-accent border-accent/20 bg-accent/5'
  }

  return (
    <div className={`border rounded-lg p-4 hover:scale-[1.02] transition-transform ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg ${colorClasses[color].split(' ')[0].replace('text-', 'bg-')} bg-opacity-10`}>
          {icon}
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className={`text-2xl font-bold mt-2 ${colorClasses[color].split(' ')[0]}`}>{value}</div>
    </div>
  )
}

function getSectionIcon(sectionName: string) {
  const lowerName = sectionName.toLowerCase()
  switch(lowerName) {
    case 'behavior':
      return <Activity className="w-4 h-4" />
    case 'memory':
      return <Database className="w-4 h-4" />
    case 'strings':
      return <Type className="w-4 h-4" />
    case 'signatures':
      return <FileSignature className="w-4 h-4" />
    case 'target':
      return <Shield className="w-4 h-4" />
    case 'info':
      return <FileText className="w-4 h-4" />
    case 'statistics':
      return <BarChart3 className="w-4 h-4" />
    case 'cape':
      return <FileJson className="w-4 h-4" />
    case 'network':
      return <Globe className="w-4 h-4" />
    case 'file':
      return <File className="w-4 h-4" />
    case 'process':
      return <CpuIcon className="w-4 h-4" />
    case 'registry':
      return <Settings className="w-4 h-4" />
    case 'dropped':
      return <DownloadCloud className="w-4 h-4" />
    default:
      return <Code className="w-4 h-4" />
  }
}

function Target({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}