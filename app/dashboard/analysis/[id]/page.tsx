// app/dashboard/analysis/[id]/page.tsx
"use client"

import { useParams, useSearchParams } from "next/navigation"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useAnalysis } from "@/hooks/useAnalysis"
import { useAnalysisData } from "@/hooks/useAnalysisData"
import { useUiPreferences } from "@/hooks/useUiPreferences"
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
  ChevronRight,
  Zap,
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  Clock,
  Hash,
  Server,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Settings,
  X,
  Menu,
  Grid3x3,
  List,
  PieChart,
  Database,
  Cpu,
  Network,
  Lock,
  Unlock,
  Fingerprint,
  Home,
  Info,
  ExternalLink,
  RefreshCw,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from "lucide-react"
import {
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
  RadialBarChart,
  RadialBar,
} from "recharts"
import { motion, AnimatePresence } from "framer-motion"
import { apiService } from "@/services/api/api.service"

// Import modular components
import {
  OverviewDashboard,
  CapeAnalysisDashboard,
  ParsedAnalysisDashboard,
  AIAnalysisDashboard,
  ThreatIntelDashboard,
  extractFileHashes,
  getMalscore,
} from "@/components/analysis"

// Import helper components
import ViewCard from "@/components/shared/ViewCard"

// ============================================================================
// Types
// ============================================================================

interface ComponentStatus {
  cape: boolean
  parsed: boolean
  ai_analysis: boolean
  threat_intel?: boolean
}

interface ComponentsResponse {
  components: ComponentStatus
  [key: string]: any
}

// ============================================================================
// Chart Configuration
// ============================================================================

const GREEN_CHART = {
  darkest: "#064e3b",
  dark: "#047857",
  base: "#10b981",
  light: "#34d399",
  pale: "#a7f3d0",
  grid: "rgba(16, 185, 129, 0.14)",
  tooltipBorder: "rgba(16, 185, 129, 0.22)",
  tooltipBg: "rgba(6, 78, 59, 0.95)",
}

const GreenTooltip = ({ active, payload, label, valueFormatter }: { active?: boolean; payload?: any[]; label?: string; valueFormatter?: (value: any, name?: string, payload?: any) => string }) => {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-[#062e22]/95 px-4 py-3 shadow-2xl backdrop-blur-md">
      {label && <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200/80">{label}</p>}
      <div className="space-y-2">
        {payload.map((entry, idx) => (
          <div key={`${entry.name}-${idx}`} className="flex items-center justify-between gap-4 text-xs text-slate-100">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color || GREEN_CHART.base }} />
              <span className="text-slate-200/90">{entry.name}</span>
            </div>
            <span className="font-semibold text-white">{valueFormatter ? valueFormatter(entry.value, entry.name, entry.payload) : entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const sectionCardClass = "rounded-3xl border border-border/80 bg-card/80 backdrop-blur-sm shadow-[0_18px_50px_-36px_rgba(16,185,129,0.22)]"
const innerSurfaceClass = "rounded-2xl border border-border/70 bg-background/35 backdrop-blur-sm"

// ============================================================================
// Helper Functions
// ============================================================================

const formatDuration = (seconds?: number): string => {
  if (!seconds || seconds <= 0) return "N/A"
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins > 0) return `${mins}m ${secs}s`
  return `${secs}s`
}

const formatDateRelative = (dateStr?: string): string => {
  if (!dateStr) return "Unknown"
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
}

const truncateHash = (hash?: string, length = 12): string => {
  if (!hash) return "N/A"
  if (hash.length <= length) return hash
  return `${hash.slice(0, length)}...`
}

// ============================================================================
// Custom Components
// ============================================================================

const AnimatedCard = ({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className={className}
  >
    {children}
  </motion.div>
)

const StatBadge = ({ label, value, icon, color, subtitle }: { label: string; value: string | number; icon: React.ReactNode; color: string; subtitle?: string }) => (
  <div className={`${innerSurfaceClass} relative overflow-hidden p-4`}>
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <div className={`rounded-lg p-1.5 bg-gradient-to-br ${color} bg-opacity-10`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {subtitle && <p className="text-[10px] text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  </div>
)

const ComponentBadge = ({ name, available, color }: { name: string; available: boolean; color: string }) => {
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    green: "bg-green-500/10 text-green-400 border border-green-500/20",
    teal: "bg-teal-500/10 text-teal-400 border border-teal-500/20",
    cyan: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
    lime: "bg-lime-500/10 text-lime-400 border border-lime-500/20",
    blue: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    pink: "bg-pink-500/10 text-pink-400 border border-pink-500/20",
    purple: "bg-purple-500/10 text-purple-400 border border-purple-500/20"
  }
  const colorClass = colorMap[color] || colorMap.emerald
  const badgeClass = available ? colorClass : "bg-muted/10 text-muted-foreground border border-border"
  return (
    <div className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${badgeClass}`}>
      {available ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
      <span className="capitalize">{name.replace('_', ' ')}</span>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export default function AnalysisPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const analysisId = params.id as string
  const initialHash = searchParams.get('hash')

  const { analysis: originalAnalysis, loading: originalLoading, error: originalError } = useAnalysis(analysisId)
  const { overviewData, loading: overviewLoading, error: overviewError } = useAnalysisData(analysisId)
  const { preferences: uiPreferences, updatePreferences } = useUiPreferences()
  
  const [activeView, setActiveView] = useState<"overview" | "threat-intel" | "cape" | "parsed" | "ai">("overview")
  const [components, setComponents] = useState<ComponentsResponse | null>(null)
  const [capeData, setCapeData] = useState<any>(null)
  const [parsedData, setParsedData] = useState<any>(null)
  const [aiData, setAiData] = useState<any>(null)
  const [loadingComponents, setLoadingComponents] = useState(false)
  const [copied, setCopied] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const loading = originalLoading || overviewLoading || loadingComponents
  const error = originalError || overviewError

  // Load components
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
            setAiData({ ...aiResponse, results, sections_analyzed: Object.keys(aiResponse.sections || {}) })
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

  // Extract data
  const fileHashes = extractFileHashes(parsedData, capeData, overviewData, originalAnalysis) || (initialHash ? {
    sha256: initialHash,
    md5: '',
    sha1: '',
    sha512: '',
    filename: originalAnalysis?.filename || 'Unknown',
    file_size: 0,
    file_type: 'N/A',
    file_path: 'N/A'
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
    parsed_results: { sections: parsedData?.sections || {} }
  } : null

  // Component availability - Check for valid (non-N/A) hashes for threat intel
  const hasCape = components?.components?.cape || false
  const hasParsed = components?.components?.parsed || false
  const hasAi = components?.components?.ai_analysis || false
  
  // Check if we have hash data from any source
  const hasHashFromCape = !!(capeData?.target?.file?.sha256 || capeData?.target?.file?.sha1 || capeData?.target?.file?.md5)
  const hasHashFromParsed = !!(parsedData?.sections?.target?.sha256 || parsedData?.sections?.target?.sha1 || parsedData?.sections?.target?.md5)
  const hasHashFromAISummary = !!(parsedData?.target?.ai_summary?.sha256 || parsedData?.target?.ai_summary?.sha1 || parsedData?.target?.ai_summary?.md5)
  const hasHashFromFileHashes = !!(fileHashes && (
    (fileHashes.sha256 && fileHashes.sha256 !== "N/A") ||
    (fileHashes.sha1 && fileHashes.sha1 !== "N/A") ||
    (fileHashes.md5 && fileHashes.md5 !== "N/A")
  ))
  
  const hasThreatIntel = hasHashFromFileHashes || hasHashFromCape || hasHashFromParsed || hasHashFromAISummary

  // Threat level styling
  const threatLevel = malscore >= 7 ? "Critical" : malscore >= 4 ? "High" : malscore >= 2 ? "Medium" : "Low"
  const threatColor = malscore >= 7 ? "red" : malscore >= 4 ? "amber" : malscore >= 2 ? "blue" : "green"

  // View definitions
  const views = [
    { id: "overview", label: "Overview", icon: <Layers className="w-4 h-4" />, available: true, color: "emerald", description: "Executive summary" },
    { id: "threat-intel", label: "Threat Intel", icon: <Globe className="w-4 h-4" />, available: hasThreatIntel, color: "green", description: "External intelligence" },
    { id: "cape", label: "Sandbox", icon: <FileJson className="w-4 h-4" />, available: hasCape, color: "teal", description: "Raw CAPE data" },
    { id: "parsed", label: "Structured", icon: <Database className="w-4 h-4" />, available: hasParsed, color: "cyan", description: "Parsed data" },
    { id: "ai", label: "AI Analysis", icon: <Brain className="w-4 h-4" />, available: true, color: "lime", description: "ML insights" },
  ]

  const availableViews = views.filter(v => v.available)

  // Chart data
  const componentHealthData = [
    { name: "Threat Intel", value: hasThreatIntel ? 1 : 0, color: "#a855f7" },
    { name: "CAPE", value: hasCape ? 1 : 0, color: "#3b82f6" },
    { name: "Parsed", value: hasParsed ? 1 : 0, color: "#ec4899" },
    { name: "AI", value: hasAi ? 1 : 0, color: "#06b6d4" },
  ]

  const densitySource = hasCape ? "cape" : "parsed"
  const densityCounts = {
    signatures: densitySource === "cape" ? (capeData?.signatures?.length || 0) : (parsedData?.sections?.signatures?.signatures?.length || 0),
    processes: densitySource === "cape" ? (capeData?.behavior?.processes?.length || 0) : (parsedData?.sections?.behavior?.data?.processes?.length || 0),
    indicators: densitySource === "cape" ? (capeData?.ttps?.length || 0) : (parsedData?.sections?.signatures?.ttps?.length || 0),
    iocs: densitySource === "cape" ? (capeData?.dropped?.length || 0) : (parsedData?.sections?.strings?.metadata?.total_strings_processed || 0)
  }

  const analysisVolumeData = [
    { name: "Signatures", value: densityCounts.signatures, color: "#2f8f83" },
    { name: "Processes", value: densityCounts.processes, color: "#3f9f8f" },
    { name: "Indicators", value: densityCounts.indicators, color: "#4fb0a0" },
    { name: "IOCs", value: densityCounts.iocs, color: "#63c2af" },
  ].filter(d => d.value > 0)

  const showCharts = uiPreferences?.showCharts ?? true
  const componentReadyCount = componentHealthData.filter(item => item.value === 1).length

  const displayFilename = (() => {
    const candidate = fileHashes?.filename || combinedAnalysis?.filename
    if (!candidate) return "Malware analysis report"
    const normalized = String(candidate).trim().toLowerCase()
    if (normalized === "n/a" || normalized === "na") {
      return "Malware analysis report"
    }
    return String(candidate)
  })()

  // Validate active view
  useEffect(() => {
    const currentView = views.find(v => v.id === activeView)
    if (currentView && !currentView.available) {
      setActiveView("overview")
    }
  }, [activeView, hasCape, hasParsed, hasThreatIntel])

  // Close mobile menu when view changes
  useEffect(() => {
    setShowMobileMenu(false)
  }, [activeView])

  return (
    <div className="relative min-h-full bg-[#080808]">
      {/* Animated Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}
        />
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-sky-500/5 blur-3xl animate-pulse delay-1000" />
      </div>
      <NetworkBackground />

      <div className="relative z-10 p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Header Section */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className={innerSurfaceClass + " p-2"}>
                  <Shield className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary mb-1">Investigation Workspace</p>
                  <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">Analysis Results</h1>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <p className="text-muted-foreground text-sm">{displayFilename}</p>
                    <span className="text-muted-foreground/30">•</span>
                    <p className="text-muted-foreground text-sm font-mono break-all">
                      ID: {analysisId}
                    </p>
                    {combinedAnalysis?.created_at && (
                      <>
                        <span className="text-muted-foreground/30">•</span>
                        <p className="text-muted-foreground text-sm flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDateRelative(combinedAnalysis.created_at)}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleDownload("json")}
                disabled={downloadProgress > 0}
                className="px-4 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/20 transition-colors flex items-center gap-2 text-sm relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloadProgress > 0 ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span className="text-xs">Downloading... {downloadProgress}%</span>
                    <div
                      className="absolute bottom-0 left-0 h-0.5 bg-emerald-400 transition-all duration-300"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span className="text-xs">Export JSON</span>
                  </>
                )}
              </button>

              <button
                onClick={handlePdfDownload}
                disabled={pdfLoading || (!hasCape && !hasAi)}
                className="px-4 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/20 transition-colors flex items-center gap-2 text-sm relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pdfLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>PDF Report</span>
                  </>
                )}
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden px-3 py-2 rounded-lg border border-border bg-card/50 hover:bg-muted/20 transition-colors"
              >
                {showMobileMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>

          {/* Stats Row */}
          {combinedAnalysis && !loading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <StatBadge
                label="Threat Score"
                value={`${malscore.toFixed(1)}/10`}
                icon={<Activity className="w-4 h-4" />}
                color={threatColor === "red" ? "from-red-500 to-red-600" : threatColor === "amber" ? "from-amber-500 to-amber-600" : "from-green-500 to-green-600"}
                subtitle={threatLevel}
              />
              <StatBadge
                label="Signatures"
                value={densityCounts.signatures}
                icon={<Shield className="w-4 h-4" />}
                color="from-blue-500 to-blue-600"
              />
              <StatBadge
                label="Processes"
                value={densityCounts.processes}
                icon={<Cpu className="w-4 h-4" />}
                color="from-cyan-500 to-cyan-600"
              />
              <StatBadge
                label="Indicators"
                value={densityCounts.indicators}
                icon={<Hash className="w-4 h-4" />}
                color="from-purple-500 to-purple-600"
              />
              <StatBadge
                label="IOCs"
                value={densityCounts.iocs}
                icon={<Database className="w-4 h-4" />}
                color="from-emerald-500 to-emerald-600"
              />
              <StatBadge
                label="Components"
                value={`${componentReadyCount}/4`}
                icon={<Layers className="w-4 h-4" />}
                color="from-orange-500 to-orange-600"
              />
            </motion.div>
          )}

          {/* Charts Row (toggleable) */}
          {combinedAnalysis && !loading && showCharts && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Component Health */}
              <div className={sectionCardClass + " p-4"}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-foreground flex items-center gap-2">
                    <PieChart className="w-3.5 h-3.5 text-primary" />
                    Component Health
                  </p>
                  <span className="text-[10px] text-muted-foreground">{componentReadyCount}/4 active</span>
                </div>
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <defs>
                        <linearGradient id="healthGradient1" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor={GREEN_CHART.base} />
                          <stop offset="100%" stopColor={GREEN_CHART.light} />
                        </linearGradient>
                        <linearGradient id="healthGradient2" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor={GREEN_CHART.dark} />
                          <stop offset="100%" stopColor={GREEN_CHART.base} />
                        </linearGradient>
                        <linearGradient id="healthGradient3" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor={GREEN_CHART.light} />
                          <stop offset="100%" stopColor={GREEN_CHART.pale} />
                        </linearGradient>
                        <linearGradient id="healthGradient4" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor={GREEN_CHART.darkest} />
                          <stop offset="100%" stopColor={GREEN_CHART.dark} />
                        </linearGradient>
                      </defs>
                      <Pie
                        data={componentHealthData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={50}
                        dataKey="value"
                        stroke="none"
                      >
                        {componentHealthData.map((entry, idx) => (
                          <Cell key={idx} fill={`url(#healthGradient${idx + 1})`} />
                        ))}
                      </Pie>
                      <Tooltip content={<GreenTooltip valueFormatter={(value) => value === 1 ? "Available" : "Not Available"} />} />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Analysis Volume */}
              <div className={sectionCardClass + " lg:col-span-2 p-4"}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-foreground flex items-center gap-2">
                    <BarChart3 className="w-3.5 h-3.5 text-primary" />
                    Analysis Volume
                  </p>
                  <span className="text-[10px] text-muted-foreground">From {densitySource === "cape" ? "CAPE" : "Parsed"} data</span>
                </div>
                <div className="h-36">
                  {analysisVolumeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analysisVolumeData} layout="vertical" margin={{ top: 4, right: 18, left: 6, bottom: 4 }} barCategoryGap={16}>
                        <defs>
                          <linearGradient id="volumeBarGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor={GREEN_CHART.darkest} />
                            <stop offset="45%" stopColor={GREEN_CHART.dark} />
                            <stop offset="100%" stopColor={GREEN_CHART.light} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" stroke={GREEN_CHART.grid} horizontal={true} vertical={false} />
                        <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#a7f3d0" }} />
                        <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#a7f3d0" }} width={55} />
                        <Tooltip content={<GreenTooltip />} cursor={{ fill: "rgba(16, 185, 129, 0.08)" }} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} fill="url(#volumeBarGradient)" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No volume data available</div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Toggle Charts Button */}
          {combinedAnalysis && !loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex justify-end">
              <button
                onClick={() => updatePreferences({ showCharts: !showCharts })}
                className={innerSurfaceClass + " px-3 py-1.5 hover:bg-muted/20 transition-colors text-xs text-muted-foreground flex items-center gap-1.5"}
              >
                {showCharts ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {showCharts ? "Hide Charts" : "Show Charts"}
              </button>
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={sectionCardClass + " p-12 flex flex-col items-center justify-center gap-4"}>
              <div className="relative">
                <Loader className="w-10 h-10 text-primary animate-spin" />
              </div>
              <p className="text-muted-foreground">Loading analysis results...</p>
            </motion.div>
          )}

          {/* Error State */}
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={sectionCardClass + " border-destructive/50 bg-destructive/5 p-6"}>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-destructive mb-2">Error Loading Analysis</p>
                  <p className="text-sm text-foreground/80">{error}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Main Content Area */}
          {combinedAnalysis && !loading && (
            <>
              {/* View Selector Cards - Always visible on desktop, toggleable on mobile */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className={`${showMobileMenu ? 'block' : 'hidden'} lg:block`}>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Investigation Views</p>
                    <p className="text-sm text-foreground/85">Switch between analysis perspectives</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {views.map((view) => (
                    <ViewCard
                      key={view.id}
                      icon={view.icon}
                      label={view.label}
                      active={activeView === view.id}
                      onClick={() => view.available && setActiveView(view.id as any)}
                      color={view.color as any}
                      description={view.description}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Component Status Badges */}
              {components && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} className={sectionCardClass + " p-4"}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Layers className="w-4 h-4 text-primary" />
                      Analysis Components
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <ComponentBadge name="threat_intel" available={hasThreatIntel} color="green" />
                    <ComponentBadge name="cape" available={hasCape} color="teal" />
                    <ComponentBadge name="parsed" available={hasParsed} color="cyan" />
                    <ComponentBadge name="ai_analysis" available={hasAi} color="lime" />
                  </div>
                </motion.div>
              )}

              {/* Active View Content */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
                {activeView === "overview" && (
                  <div className={sectionCardClass + " p-5"}>
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
                  <div className={sectionCardClass + " p-5"}>
                    <ThreatIntelDashboard 
                      fileHashes={fileHashes}
                      capeData={capeData}
                      parsedData={parsedData}
                      onCopyJson={() => handleCopyJson({})}
                      copied={copied}
                    />
                  </div>
                )}

                {activeView === "cape" && (
                  <div className={sectionCardClass + " p-5"}>
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
                )}

                {activeView === "parsed" && (
                  <div className={sectionCardClass + " p-5"}>
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
                        <Database className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">No parsed data available</p>
                      </div>
                    )}
                  </div>
                )}

                {activeView === "ai" && (
                  <div className={sectionCardClass + " p-5"}>
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
                )}
              </motion.div>
            </>
          )}

          {/* Not Found State */}
          {!loading && !error && !combinedAnalysis && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={sectionCardClass + " p-12 text-center"}>
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-2">No analysis found</p>
              <p className="text-sm text-muted-foreground">
                The analysis with ID <span className="font-mono">{analysisId}</span> could not be found.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}