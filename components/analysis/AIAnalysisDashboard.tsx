"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Copy,
  Cpu,
  Database,
  Download,
  Eye,
  EyeOff,
  FileCode,
  FileJson,
  FileText,
  Fingerprint,
  Globe,
  HardDrive,
  Info,
  Layers,
  Lock,
  Maximize2,
  MemoryStick,
  Minimize2,
  Network,
  Radar,
  Search,
  Shield,
  Sparkles,
  Target,
  Terminal,
  TrendingUp,
  Type,
  Wifi,
  WifiOff,
  XCircle,
  Zap,
} from "lucide-react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar as ReRadar,
} from "recharts"

interface AIAnalysisDashboardProps {
  data: any
  loading?: boolean
  onCopyJson?: () => void
  copied?: boolean
  onDownload?: (format: string) => void
}

type TabId = "overview" | "cycle" | "target" | "signatures" | "memory" | "behavior" | "network" | "synthesis" | "raw"

// Utility functions
const safeArray = <T = any,>(value: any): T[] => Array.isArray(value) ? value : []
const safeObject = (value: any): Record<string, any> => value && typeof value === "object" && !Array.isArray(value) ? value : {}
const safeNumber = (value: any, defaultValue = 0): number => {
  const n = Number(value)
  return isNaN(n) ? defaultValue : n
}
const cleanText = (value: any): string => {
  if (!value || typeof value !== "string") return ""
  return value.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/__([^_]+)__/g, "$1").replace(/`([^`]+)`/g, "$1").trim()
}
const firstSentence = (text: string): string => {
  const cleaned = cleanText(text)
  if (!cleaned) return ""
  const match = cleaned.match(/^[^.!?]+[.!?]/)
  return match ? match[0] : cleaned.split(/\s+/).slice(0, 15).join(" ")
}
const formatBytes = (bytes?: number): string => {
  if (!bytes || isNaN(bytes)) return "N/A"
  const units = ["B", "KB", "MB", "GB"]
  const idx = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / Math.pow(1024, idx)).toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`
}

const GREEN_CHART = {
  darkest: "#064e3b",
  dark: "#047857",
  base: "#10b981",
  light: "#34d399",
  pale: "#a7f3d0",
  grid: "rgba(16, 185, 129, 0.14)",
}

const sectionCardClass = "rounded-2xl border border-border/70 bg-card/80 backdrop-blur-sm shadow-[0_18px_50px_-36px_rgba(16,185,129,0.18)]"
const innerSurfaceClass = "rounded-xl border border-border/60 bg-background/35 backdrop-blur-sm"

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

// Severity colors
const severityColors = {
  CRITICAL: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", badge: "bg-red-500/20 text-red-400" },
  HIGH: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", badge: "bg-amber-500/20 text-amber-400" },
  MEDIUM: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400", badge: "bg-blue-500/20 text-blue-400" },
  LOW: { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-400", badge: "bg-green-500/20 text-green-400" },
  INFORMATIONAL: { bg: "bg-slate-500/10", border: "border-slate-500/30", text: "text-slate-400", badge: "bg-slate-500/20 text-slate-400" },
}

const StageCard = ({ stage, index, isActive, onClick, summary }: { stage: { key: string; label: string; icon: React.ReactNode; available: boolean }; index: number; isActive: boolean; onClick: () => void; summary: string }) => (
  <motion.div
    onClick={onClick}
    className={`relative ${sectionCardClass} p-3 cursor-pointer transition-colors ${isActive ? "border-primary/40 bg-primary/10" : "hover:border-primary/30"} ${!stage.available && "opacity-60"}`}
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-[10px] text-muted-foreground">Stage {index + 1}</span>
      {stage.available ? <CheckCircle className="w-3.5 h-3.5 text-primary" /> : <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground" />}
    </div>
    <div className="flex items-center gap-2 mb-1">
      {stage.icon}
      <p className="text-xs font-semibold text-foreground">{stage.label}</p>
    </div>
    <p className="text-[10px] text-muted-foreground line-clamp-2">{summary || "No data available"}</p>
  </motion.div>
)

const ExpandableSection = ({ title, items, renderItem, initialCount = 5, step = 5, emptyMessage = "No items" }: { title: string; items: any[]; renderItem: (item: any, idx: number) => React.ReactNode; initialCount?: number; step?: number; emptyMessage?: string }) => {
  const [expanded, setExpanded] = useState(false)
  const visibleItems = expanded ? items : items.slice(0, initialCount)
  const hasMore = items.length > initialCount

  if (items.length === 0) return null

  return (
    <div className={`${sectionCardClass} p-4`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        <span className="text-xs text-muted-foreground">{items.length} total</span>
      </div>
      <div className="space-y-2">
        {visibleItems.map((item, idx) => renderItem(item, idx))}
      </div>
      {hasMore && (
        <button onClick={() => setExpanded(!expanded)} className="mt-3 flex items-center gap-1 text-xs text-primary transition-colors hover:text-primary/80">
          {expanded ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? "Show less" : `Show ${Math.min(step, items.length - initialCount)} more`}
        </button>
      )}
    </div>
  )
}

const StatTile = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
  <div className={`${sectionCardClass} p-4`}>
    <div className="mb-2 flex items-center justify-between gap-3">
      <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary">{icon}</span>
    </div>
    <p className="text-2xl font-bold text-foreground">{value}</p>
  </div>
)

// Main Component
export default function AIAnalysisDashboard({ data, loading = false, onCopyJson, copied = false, onDownload }: AIAnalysisDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview")
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")

  // Extract all stages from the analysis data
  const stages = useMemo(() => {
    const results = data?.results || data || {}
    
    const getStageData = (key: string) => {
      const stage = results[key]
      if (stage?.analysis && typeof stage.analysis === "object") return stage.analysis
      if (typeof stage === "object") return stage
      return null
    }

    return {
      initial: getStageData("initial_combined_analysis"),
      target: getStageData("target_analysis"),
      signatures: getStageData("signatures_analysis"),
      memory: getStageData("memory_analysis"),
      behavior: getStageData("behavior_analysis"),
      network: getStageData("network_analysis"),
      synthesis: getStageData("final_synthesis"),
    }
  }, [data])

  // Stage definitions
  const stageDefs = useMemo(() => [
    { key: "initial", label: "Initial Intake", icon: <Radar className="w-3.5 h-3.5" />, available: !!stages.initial, data: stages.initial, summary: firstSentence(stages.initial?.executive_summary?.summary_paragraph) || firstSentence(stages.initial?.analysis_quality?.quality_assessment) || "" },
    { key: "target", label: "Binary Forensics", icon: <FileText className="w-3.5 h-3.5" />, available: !!stages.target, data: stages.target, summary: firstSentence(stages.target?.summary) || firstSentence(stages.target?.target_classification?.cape_type) || "" },
    { key: "signatures", label: "Signature Intel", icon: <Shield className="w-3.5 h-3.5" />, available: !!stages.signatures, data: stages.signatures, summary: firstSentence(stages.signatures?.executive_summary?.summary_paragraph) || `Malscore: ${stages.signatures?.assessment?.malscore || "N/A"}` },
    { key: "memory", label: "Memory Forensics", icon: <MemoryStick className="w-3.5 h-3.5" />, available: !!stages.memory, data: stages.memory, summary: firstSentence(stages.memory?.executive_summary?.summary_paragraph) || `${stages.memory?.memory_forensics?.total_dumps || 0} memory dumps` },
    { key: "behavior", label: "Behavior Analysis", icon: <Activity className="w-3.5 h-3.5" />, available: !!stages.behavior, data: stages.behavior, summary: firstSentence(stages.behavior?.executive_summary?.summary_paragraph) || firstSentence(stages.behavior?.risk_assessment?.key_drivers?.join(", ")) || "" },
    { key: "network", label: "Network Ops", icon: <Globe className="w-3.5 h-3.5" />, available: !!stages.network, data: stages.network, summary: firstSentence(stages.network?.executive_summary?.summary_paragraph) || `${stages.network?.dns_analysis?.total_queries || 0} DNS queries` },
    { key: "synthesis", label: "Final Synthesis", icon: <Brain className="w-3.5 h-3.5" />, available: !!stages.synthesis, data: stages.synthesis, summary: firstSentence(stages.synthesis?.executive_summary?.summary_paragraph) || stages.synthesis?.executive_summary?.one_liner || "" },
  ], [stages])

  const availableStages = stageDefs.filter(s => s.data !== null)
  const synthesis = stages.synthesis

  // Threat assessment
  const threatAssessment = useMemo(() => {
    const verdict = synthesis?.executive_summary?.final_verdict || "INCONCLUSIVE"
    const confidence = safeNumber(synthesis?.executive_summary?.confidence_score, 0)
    const threatLevel = synthesis?.executive_summary?.threat_level || 
                       stages.behavior?.executive_summary?.threat_level || 
                       stages.initial?.executive_summary?.threat_level || "UNKNOWN"
    
    let color = severityColors.INFORMATIONAL
    if (verdict === "MALICIOUS") color = severityColors.CRITICAL
    else if (verdict === "SUSPICIOUS") color = severityColors.HIGH
    else if (verdict === "CLEAN") color = severityColors.LOW
    
    return { verdict, confidence, threatLevel, color }
  }, [synthesis, stages])

  // Radar chart data for confidence breakdown
  const radarData = useMemo(() => {
    const breakdown = synthesis?.integrated_findings?.confidence_breakdown || {}
    return [
      { category: "CAPE Extraction", value: breakdown.cape_extraction === "HIGH" ? 100 : breakdown.cape_extraction === "MEDIUM" ? 60 : 20, full: breakdown.cape_extraction },
      { category: "Target Analysis", value: breakdown.target_analysis === "HIGH" ? 100 : breakdown.target_analysis === "MEDIUM" ? 60 : 20, full: breakdown.target_analysis },
      { category: "Signatures", value: breakdown.signature_analysis === "HIGH" ? 100 : breakdown.signature_analysis === "MEDIUM" ? 60 : 20, full: breakdown.signature_analysis },
      { category: "Memory", value: breakdown.memory_forensics === "HIGH" ? 100 : breakdown.memory_forensics === "MEDIUM" ? 60 : 20, full: breakdown.memory_forensics },
      { category: "Behavior", value: breakdown.behavioral_analysis === "HIGH" ? 100 : breakdown.behavioral_analysis === "MEDIUM" ? 60 : 20, full: breakdown.behavioral_analysis },
      { category: "Network", value: breakdown.network_analysis === "HIGH" ? 100 : breakdown.network_analysis === "MEDIUM" ? 60 : 20, full: breakdown.network_analysis },
    ]
  }, [synthesis])

  // MITRE ATT&CK techniques
  const mitreTechniques = useMemo(() => {
    const techniques = synthesis?.mitre_attack?.techniques || []
    const techniqueDetails = synthesis?.mitre_attack?.technique_details || []
    return { techniques, techniqueDetails }
  }, [synthesis])

  // C2 Infrastructure
  const c2Infra = useMemo(() => {
    const infra = synthesis?.integrated_findings?.c2_infrastructure || {}
    return {
      extracted: safeArray(infra.extracted_from_config),
      observed: safeArray(infra.observed_in_network),
      dead: safeArray(infra.dead_hosts),
      functional: infra.c2_functional || "UNKNOWN",
    }
  }, [synthesis])

  // IOCs consolidated
  const iocs = useMemo(() => {
    const consolidated = synthesis?.iocs_consolidated || {}
    return {
      sha256: safeArray(consolidated.sha256).slice(0, 15),
      md5: safeArray(consolidated.md5).slice(0, 10),
      domains: safeArray(consolidated.domains).slice(0, 20),
      ips: safeArray(consolidated.ip_addresses).slice(0, 15),
      mutexes: safeArray(consolidated.mutexes).slice(0, 10),
      filePaths: safeArray(consolidated.file_paths).slice(0, 15),
      yaraRules: safeArray(consolidated.yara_rules).slice(0, 10),
    }
  }, [synthesis])

  // Incident response actions
  const responseActions = useMemo(() => {
    const ir = synthesis?.incident_response || {}
    return {
      immediate: safeArray(ir.immediate_actions),
      containment: safeArray(ir.containment_steps),
      eradication: safeArray(ir.eradication_steps),
      recovery: safeArray(ir.recovery_steps),
    }
  }, [synthesis])

  // Hunting queries
  const huntingQueries = useMemo(() => {
    return safeArray(synthesis?.investigation_priority?.suggested_hunting_queries)
  }, [synthesis])

  // Filtered data
  const filteredFindings = useMemo(() => {
    const findings = synthesis?.investigation_priority?.key_findings_for_hunting || []
    if (!searchQuery) return findings.slice(0, 15)
    const q = searchQuery.toLowerCase()
    return findings.filter((f: string) => f.toLowerCase().includes(q)).slice(0, 15)
  }, [synthesis, searchQuery])

  const toggleStage = (key: string) => {
    const newSet = new Set(expandedStages)
    if (newSet.has(key)) newSet.delete(key)
    else newSet.add(key)
    setExpandedStages(newSet)
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="p-4 rounded-full bg-muted/20 mb-4">
          <Brain className="w-12 h-12 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">No AI analysis data available</p>
        <p className="text-xs text-muted-foreground mt-1">Run the Chameleon AI pipeline first</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-4">Synthesizing AI analysis pipeline...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-7 bg-gradient-to-b from-primary to-primary/40 rounded-full" />
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary font-semibold">Chameleon AI • Stage 7 Final Synthesis</p>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Unified Threat Intelligence Report</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full ${threatAssessment.color.badge}`}>{threatAssessment.verdict}</span>
            <span className="text-xs text-muted-foreground">Confidence: {threatAssessment.confidence}%</span>
            <span className="text-xs text-muted-foreground">Model: {data?.ai_model || "gemini-2.5-flash"}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {onCopyJson && (
            <button onClick={onCopyJson} className="px-3 py-2 border border-border rounded-lg hover:bg-muted/20 transition-colors text-sm flex items-center gap-2">
              <Copy className="w-3.5 h-3.5" />
              {copied ? "Copied" : "Copy JSON"}
            </button>
          )}
          {onDownload && (
            <button onClick={() => onDownload("json")} className="px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-sm flex items-center gap-2">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          )}
        </div>
      </div>

      {/* Main Tabs */}
      <div className="rounded-2xl border border-border/80 bg-card/75 p-1.5 overflow-x-auto backdrop-blur-sm">
        <div className="flex min-w-max gap-0.5">
          {[
            { id: "overview", label: "Overview", icon: <Layers className="w-4 h-4" /> },
            { id: "cycle", label: "Analysis Cycle", icon: <Brain className="w-4 h-4" /> },
            { id: "target", label: "Target", icon: <FileText className="w-4 h-4" /> },
            { id: "signatures", label: "Signatures", icon: <Shield className="w-4 h-4" /> },
            { id: "memory", label: "Memory", icon: <MemoryStick className="w-4 h-4" /> },
            { id: "behavior", label: "Behavior", icon: <Activity className="w-4 h-4" /> },
            { id: "network", label: "Network", icon: <Globe className="w-4 h-4" /> },
            { id: "synthesis", label: "Synthesis", icon: <Target className="w-4 h-4" /> },
            { id: "raw", label: "Raw", icon: <FileJson className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabId)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === tab.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      {(activeTab === "overview" || activeTab === "synthesis") && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search findings, IOCs, or hunting queries..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-border/80 bg-card/75 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-all backdrop-blur-sm"
          />
        </div>
      )}

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
          
          {/* ==================== OVERVIEW TAB ==================== */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Executive Summary */}
              <div className={`${sectionCardClass} p-5 ${threatAssessment.color.border} ${threatAssessment.color.bg}`}>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-background/50">
                    {threatAssessment.verdict === "MALICIOUS" ? <AlertTriangle className="w-5 h-5 text-red-400" /> : <Brain className="w-5 h-5 text-primary" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground mb-1">{synthesis?.executive_summary?.one_liner || "No summary available"}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{synthesis?.executive_summary?.summary_paragraph || "No detailed summary available"}</p>
                    {synthesis?.executive_summary?.malware_family && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Malware Family:</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">{synthesis.executive_summary.malware_family}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Confidence Radar */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={`${sectionCardClass} p-5`}>
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Radar className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">Confidence Breakdown</h3>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-primary/70">Assessment Signal</span>
                  </div>
                  <ResponsiveContainer width="100%" height={290}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke={GREEN_CHART.grid} />
                      <PolarAngleAxis dataKey="category" tick={{ fontSize: 10, fill: "#d1fae5" }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: "#a7f3d0" }} />
                      <ReRadar name="Confidence" dataKey="value" stroke={GREEN_CHART.base} fill={GREEN_CHART.base} fillOpacity={0.28} strokeWidth={2.5} />
                      <Tooltip content={<GreenTooltip valueFormatter={(value) => `${value}%`} />} />
                    </RadarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {radarData.map((item) => (
                      <div key={item.category} className={`${innerSurfaceClass} px-3 py-2`}>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-200/60">{item.category}</p>
                        <p className="mt-1 text-lg font-semibold text-foreground">{item.value}%</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`${sectionCardClass} p-5`}>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">Impact Assessment</h3>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className={`${innerSurfaceClass} flex items-center justify-between p-3`}>
                      <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Data Theft Likelihood</span>
                      <span className={`text-xs font-semibold ${synthesis?.integrated_findings?.impact_assessment?.data_theft_likelihood === "HIGH" ? "text-red-400" : "text-amber-400"}`}>
                        {synthesis?.integrated_findings?.impact_assessment?.data_theft_likelihood || "N/A"}
                      </span>
                    </div>
                    <div className={`${innerSurfaceClass} flex items-center justify-between p-3`}>
                      <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">System Compromise</span>
                      <span className="text-xs font-semibold text-red-400">{synthesis?.integrated_findings?.impact_assessment?.system_compromise_level || "N/A"}</span>
                    </div>
                    <div className={`${innerSurfaceClass} flex items-center justify-between p-3`}>
                      <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Lateral Movement</span>
                      <span className={`text-xs font-semibold ${synthesis?.integrated_findings?.impact_assessment?.lateral_movement_indicators ? "text-red-400" : "text-green-400"}`}>
                        {synthesis?.integrated_findings?.impact_assessment?.lateral_movement_indicators ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className={`${innerSurfaceClass} flex items-center justify-between p-3`}>
                      <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Ransomware Indicators</span>
                      <span className={`text-xs font-semibold ${synthesis?.integrated_findings?.impact_assessment?.ransomware_indicators ? "text-red-400" : "text-green-400"}`}>
                        {synthesis?.integrated_findings?.impact_assessment?.ransomware_indicators ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* C2 Infrastructure */}
              {c2Infra.extracted.length > 0 && (
                <div className={`${sectionCardClass} border-red-500/20 bg-red-500/5 p-5`}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">C2 Infrastructure</h3>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c2Infra.functional === "LIKELY" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"}`}>
                      {c2Infra.functional === "LIKELY" ? "Active" : c2Infra.functional === "PARTIAL" ? "Partial" : "Unlikely"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Extracted from Config</p>
                      <div className="space-y-1">
                        {c2Infra.extracted.slice(0, 5).map((c2, idx) => (
                          <div key={idx} className={`${innerSurfaceClass} px-3 py-1.5 text-xs font-mono text-red-400 break-all`}>{c2}</div>
                        ))}
                        {c2Infra.extracted.length > 5 && <p className="text-xs text-muted-foreground">+{c2Infra.extracted.length - 5} more</p>}
                      </div>
                    </div>
                    {c2Infra.observed.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Observed in Network</p>
                        <div className="space-y-1">
                          {c2Infra.observed.slice(0, 5).map((c2, idx) => (
                            <div key={idx} className={`${innerSurfaceClass} px-3 py-1.5 text-xs font-mono text-primary break-all`}>{c2}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* MITRE ATT&CK */}
              {mitreTechniques.techniques.length > 0 && (
                <div className={`${sectionCardClass} p-5`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">MITRE ATT&CK Techniques</h3>
                  </div>
                  <div className="space-y-2">
                    {mitreTechniques.techniques.slice(0, 20).map((ttp: string, idx: number) => (
                      <span key={idx} className="inline-block mr-2 mb-2 px-3 py-1.5 rounded bg-primary/15 text-primary text-xs font-mono border border-primary/30">{ttp}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Findings for Hunting */}
              {filteredFindings.length > 0 && (
                <div className={`${sectionCardClass} p-5`}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">Key Findings</h3>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-primary/70">Hunting</span>
                  </div>
                  <div className="space-y-2">
                    {filteredFindings.map((finding: string, idx: number) => (
                      <div key={idx} className={`${innerSurfaceClass} p-3 text-xs text-foreground leading-relaxed`}>{finding}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== ANALYSIS CYCLE TAB ==================== */}
          {activeTab === "cycle" && (
            <div className="space-y-6">
              {/* Stage Navigation */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2">
                {stageDefs.map((stage, idx) => (
                  <StageCard
                    key={stage.key}
                    stage={stage}
                    index={idx}
                    isActive={expandedStages.has(stage.key)}
                    onClick={() => toggleStage(stage.key)}
                    summary={stage.summary}
                  />
                ))}
              </div>

              {/* Expanded Stage Details */}
              <AnimatePresence>
                {stageDefs.map((stage) => {
                  if (!expandedStages.has(stage.key) || !stage.data) return null
                  const data = stage.data
                  return (
                    <motion.div key={stage.key} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className={`${sectionCardClass} overflow-hidden`}>
                      <div className="border-b border-border p-4 bg-muted/10">
                        <div className="flex items-center gap-2">
                          {stage.icon}
                          <h3 className="text-base font-semibold text-foreground">{stage.label}</h3>
                          <span className="text-xs text-muted-foreground ml-auto">{data.analysis_stage || stage.key}</span>
                        </div>
                      </div>
                      <div className="p-4 space-y-4">
                        {/* Executive Summary */}
                        {data.executive_summary && (
                          <div className={`${innerSurfaceClass} border-primary/20 bg-primary/5 p-3`}>
                            <p className="text-sm font-semibold text-primary mb-1">Executive Summary</p>
                            <p className="text-sm text-foreground">{data.executive_summary.summary_paragraph || data.executive_summary.one_liner}</p>
                            {data.executive_summary.malware_family && (
                              <div className="mt-2 flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Family:</span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">{data.executive_summary.malware_family}</span>
                                <span className="text-xs text-muted-foreground">Threat Level: {data.executive_summary.threat_level}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Stage-specific content */}
                        {stage.key === "initial" && data.key_findings && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div><p className="text-xs text-muted-foreground">Detected Family</p><p className="text-sm text-foreground">{data.key_findings.detected_family || "N/A"}</p></div>
                            <div><p className="text-xs text-muted-foreground">Injection Observed</p><p className="text-sm text-foreground">{data.key_findings.injection_observed ? "Yes" : "No"}</p></div>
                            <div><p className="text-xs text-muted-foreground">Config Extracted</p><p className="text-sm text-foreground">{data.key_findings.config_extracted ? "Yes" : "No"}</p></div>
                            <div><p className="text-xs text-muted-foreground">Quality Score</p><p className="text-sm text-foreground">{data.analysis_quality?.quality_score || "N/A"}</p></div>
                          </div>
                        )}

                        {stage.key === "target" && data.target_classification && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div><p className="text-xs text-muted-foreground">File Name</p><p className="text-sm text-foreground break-all">{data.file_identity?.file_name || "N/A"}</p></div>
                            <div><p className="text-xs text-muted-foreground">File Size</p><p className="text-sm text-foreground">{formatBytes(data.file_identity?.file_size)}</p></div>
                            <div><p className="text-xs text-muted-foreground">CAPE Type</p><p className="text-sm text-foreground">{data.target_classification?.cape_type || "N/A"}</p></div>
                            <div><p className="text-xs text-muted-foreground">Is Packed</p><p className="text-sm text-foreground">{data.packing_indicators?.is_packed ? "Yes" : "No"}</p></div>
                          </div>
                        )}

                        {stage.key === "signatures" && data.assessment && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className={`${innerSurfaceClass} p-3 text-center`}><p className="text-xs text-muted-foreground">Malscore</p><p className="text-lg font-bold text-foreground">{data.assessment.malscore}</p></div>
                            <div className={`${innerSurfaceClass} p-3 text-center`}><p className="text-xs text-muted-foreground">Critical</p><p className="text-lg font-bold text-red-400">{data.assessment.critical_count}</p></div>
                            <div className={`${innerSurfaceClass} p-3 text-center`}><p className="text-xs text-muted-foreground">Total</p><p className="text-lg font-bold text-foreground">{data.assessment.total_signatures}</p></div>
                            <div className={`${innerSurfaceClass} p-3 text-center`}><p className="text-xs text-muted-foreground">Status</p><p className="text-sm font-semibold text-amber-400">{data.assessment.malstatus}</p></div>
                          </div>
                        )}

                        {stage.key === "memory" && data.memory_forensics && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className={`${innerSurfaceClass} p-3 text-center`}><p className="text-xs text-muted-foreground">Memory Dumps</p><p className="text-lg font-bold text-foreground">{data.memory_forensics.total_dumps}</p></div>
                            <div className={`${innerSurfaceClass} p-3 text-center`}><p className="text-xs text-muted-foreground">With YARA</p><p className="text-lg font-bold text-foreground">{data.memory_forensics.dumps_with_yara}</p></div>
                            <div className={`${innerSurfaceClass} p-3 text-center`}><p className="text-xs text-muted-foreground">Shellcode</p><p className="text-lg font-bold text-red-400">{data.memory_forensics.shellcode_detected ? "Yes" : "No"}</p></div>
                            <div className={`${innerSurfaceClass} p-3 text-center`}><p className="text-xs text-muted-foreground">Extracted PE</p><p className="text-lg font-bold text-foreground">{data.memory_forensics.extracted_pe_count}</p></div>
                          </div>
                        )}

                        {stage.key === "behavior" && data.process_analysis && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div className={`${innerSurfaceClass} p-3`}><p className="text-xs text-muted-foreground">Processes</p><p className="text-sm font-semibold text-foreground">{data.process_analysis.total_processes}</p></div>
                            <div className={`${innerSurfaceClass} p-3`}><p className="text-xs text-muted-foreground">API Calls</p><p className="text-sm font-semibold text-foreground">{data.api_behavior?.total_api_calls?.toLocaleString()}</p></div>
                            <div className={`${innerSurfaceClass} p-3`}><p className="text-xs text-muted-foreground">Risk Level</p><p className="text-sm font-semibold text-red-400">{data.risk_assessment?.risk_level}</p></div>
                          </div>
                        )}

                        {stage.key === "network" && data.dns_analysis && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div className={`${innerSurfaceClass} p-3`}><p className="text-xs text-muted-foreground">DNS Queries</p><p className="text-sm font-semibold text-foreground">{data.dns_analysis.total_queries}</p></div>
                            <div className={`${innerSurfaceClass} p-3`}><p className="text-xs text-muted-foreground">TCP Conn</p><p className="text-sm font-semibold text-foreground">{data.network_indicators?.total_tcp_connections}</p></div>
                            <div className={`${innerSurfaceClass} p-3`}><p className="text-xs text-muted-foreground">C2 Match</p><p className="text-sm font-semibold text-amber-400">{data.c2_correlation?.c2_match_found ? "Yes" : "No"}</p></div>
                          </div>
                        )}

                        {stage.key === "synthesis" && data.integrated_findings && (
                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                              {data.integrated_findings.confirmed_families?.map((f: string, idx: number) => (
                                <span key={idx} className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs">{f}</span>
                              ))}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div><p className="text-xs text-muted-foreground">Persistence Mechanisms</p><ul className="list-disc list-inside text-xs text-foreground">{data.integrated_findings.persistence_mechanisms?.slice(0, 3).map((m: string, i: number) => <li key={i}>{m}</li>)}</ul></div>
                              <div><p className="text-xs text-muted-foreground">Defense Evasion Techniques</p><ul className="list-disc list-inside text-xs text-foreground">{data.integrated_findings.defense_evasion_techniques?.slice(0, 3).map((t: string, i: number) => <li key={i}>{t}</li>)}</ul></div>
                            </div>
                          </div>
                        )}

                        {/* Analyst Notes */}
                        {data.analyst_notes && (
                          <div className="rounded-lg border border-border bg-muted/10 p-3">
                            <p className="text-xs text-muted-foreground mb-1">Analyst Notes</p>
                            <p className="text-xs text-foreground">{data.analyst_notes}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}

          {/* ==================== TARGET TAB ==================== */}
          {activeTab === "target" && stages.target && (
            <div className="space-y-6">
              <div className={`${sectionCardClass} p-5`}>
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Target Classification</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <HashRow label="SHA256" value={stages.target.target_classification?.sha256} />
                    {stages.target.target_classification?.detected_families && (
                      <div><p className="text-xs text-muted-foreground">Detected Families</p><div className="flex flex-wrap gap-1 mt-1">{stages.target.target_classification.detected_families.map((f: string, i: number) => <span key={i} className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">{f}</span>)}</div></div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div><p className="text-xs text-muted-foreground">File Identity</p><p className="text-sm text-foreground">{stages.target.file_identity?.file_name}</p><p className="text-xs text-muted-foreground">{stages.target.file_identity?.file_type}</p></div>
                    <div><p className="text-xs text-muted-foreground">PE Indicators</p><p className="text-sm text-foreground">IMPHASH: {stages.target.pe_indicators?.imphash || "N/A"}</p><p className="text-xs text-muted-foreground">Compile: {stages.target.pe_indicators?.compile_timestamp || "N/A"}</p></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`${sectionCardClass} p-5`}>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Lock className="w-4 h-4" />Signing & Legitimacy</h3>
                  <div className="space-y-2">
                      <div className={`${innerSurfaceClass} flex items-center justify-between p-3`}>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Signed</p>
                        <p className={`text-xs font-semibold ${stages.target.signing_and_legitimacy?.is_signed ? "text-green-400" : "text-red-400"}`}>{stages.target.signing_and_legitimacy?.is_signed ? "Yes" : "No"}</p>
                      </div>
                    {stages.target.signing_and_legitimacy?.company_name && <div className={`${innerSurfaceClass} flex items-center justify-between p-3`}><span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Company</span><span className="text-xs text-foreground">{stages.target.signing_and_legitimacy.company_name}</span></div>}
                    {stages.target.signing_and_legitimacy?.product_name && <div className={`${innerSurfaceClass} flex items-center justify-between p-2`}><span className="text-xs">Product</span><span className="text-xs text-foreground">{stages.target.signing_and_legitimacy.product_name}</span></div>}
                    <div className={`${innerSurfaceClass} p-2`}><span className="text-xs text-muted-foreground">Likely Legitimate:</span> <span className="text-xs">{stages.target.signing_and_legitimacy?.likely_legitimate ? "Yes" : "No"}</span></div>
                  </div>
                </div>

                <div className={`${sectionCardClass} p-5`}>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Box className="w-4 h-4 text-primary" />Packing & Self-Extract</h3>
                  <div className="space-y-2">
                    <div className={`${innerSurfaceClass} flex items-center justify-between p-3`}><span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Packed</span><span className={`text-xs font-semibold ${stages.target.packing_indicators?.is_packed ? "text-amber-400" : "text-green-400"}`}>{stages.target.packing_indicators?.is_packed ? "Yes" : "No"}</span></div>
                    {stages.target.packing_indicators?.detected_packers?.length > 0 && <div className={`${innerSurfaceClass} p-3`}><span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2 block">Detected Packers</span><div className="flex flex-wrap gap-1">{stages.target.packing_indicators.detected_packers.map((p: string, i: number) => <span key={i} className="rounded bg-muted/30 border border-border px-2 py-0.5 text-xs text-muted-foreground">{p}</span>)}</div></div>}
                    <div className={`${innerSurfaceClass} flex items-center justify-between p-3`}><span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Self-Extract</span><span className="text-xs font-medium">{stages.target.self_extraction?.has_self_extract ? "Yes" : "No"}</span></div>
                    {stages.target.self_extraction?.method && <div className={`${innerSurfaceClass} flex items-center justify-between p-3`}><span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Method</span><span className="text-xs font-medium text-foreground">{stages.target.self_extraction.method}</span></div>}
                  </div>
                </div>
              </div>

              {stages.target.integrated_risk_assessment && (
                <div className={`${sectionCardClass} p-5`}>
                  <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    {stages.target.integrated_risk_assessment.risk_level === "critical" ? <AlertTriangle className="w-4 h-4 text-red-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
                    Integrated Risk Assessment
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">{stages.target.summary}</p>
                  <div className="flex flex-wrap gap-2">
                    {stages.target.integrated_risk_assessment.key_factors?.map((factor: string, idx: number) => (
                      <span key={idx} className="text-xs px-3 py-1.5 rounded-full bg-muted/20 border border-border text-muted-foreground">{factor}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== SIGNATURES TAB ==================== */}
          {activeTab === "signatures" && stages.signatures && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <StatTile icon={<Shield className="w-4 h-4" />} label="Malscore" value={stages.signatures.assessment?.malscore || 0} />
                <StatTile icon={<AlertTriangle className="w-4 h-4" />} label="Critical" value={stages.signatures.assessment?.critical_count || 0} />
                <StatTile icon={<Activity className="w-4 h-4" />} label="Suspicious" value={stages.signatures.assessment?.high_count || 0} />
                <StatTile icon={<Target className="w-4 h-4" />} label="TTPs" value={stages.signatures.mitre_attack?.techniques?.length || 0} />
                <StatTile icon={<Terminal className="w-4 h-4" />} label="Commands" value={stages.signatures.iocs_extracted?.commands?.length || 0} />
              </div>

              <div className={`${sectionCardClass} p-5`}>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Capabilities Detected
                </h3>
                <div className="flex flex-wrap gap-2">
                  {stages.signatures.capabilities_detected?.persistence && <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-xs">Persistence</span>}
                  {stages.signatures.capabilities_detected?.defense_evasion && <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs">Defense Evasion</span>}
                  {stages.signatures.capabilities_detected?.credential_access && <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 text-xs">Credential Access</span>}
                  {stages.signatures.capabilities_detected?.discovery && <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs">Discovery</span>}
                  {stages.signatures.capabilities_detected?.lateral_movement && <span className="px-2 py-1 rounded bg-orange-500/20 text-orange-400 text-xs">Lateral Movement</span>}
                </div>
              </div>

              {stages.signatures.key_behavior_findings && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ExpandableSection title="Process Injection" items={stages.signatures.key_behavior_findings.injection_techniques || []} renderItem={(item, idx) => <div key={idx} className="text-xs text-red-400 break-all py-1">{item}</div>} />
                  <ExpandableSection title="Persistence Mechanisms" items={stages.signatures.key_behavior_findings.persistence_mechanisms || []} renderItem={(item, idx) => <div key={idx} className="text-xs text-amber-400 break-all py-1">{item}</div>} />
                  <ExpandableSection title="Defense Evasion" items={stages.signatures.key_behavior_findings.defense_evasion_techniques || []} renderItem={(item, idx) => <div key={idx} className="text-xs text-red-400 break-all py-1">{item}</div>} />
                </div>
              )}

              {stages.signatures.iocs_extracted?.commands?.length > 0 && (
                <ExpandableSection title="Commands" items={stages.signatures.iocs_extracted.commands} renderItem={(cmd, idx) => <div key={idx} className={`${innerSurfaceClass} p-2 text-xs font-mono text-foreground break-all`}>{cmd}</div>} />
              )}
            </div>
          )}

          {/* ==================== MEMORY TAB ==================== */}
          {activeTab === "memory" && stages.memory && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <StatTile icon={<MemoryStick className="w-4 h-4" />} label="Memory Dumps" value={stages.memory.memory_forensics?.total_dumps || 0} />
                <StatTile icon={<Shield className="w-4 h-4" />} label="With YARA" value={stages.memory.memory_forensics?.dumps_with_yara || 0} />
                <StatTile icon={<FileCode className="w-4 h-4" />} label="Extracted PE" value={stages.memory.memory_forensics?.extracted_pe_count || 0} />
                <StatTile icon={<AlertTriangle className="w-4 h-4" />} label="Shellcode" value={stages.memory.memory_forensics?.shellcode_detected ? "Yes" : "No"} />
                <StatTile icon={<Database className="w-4 h-4" />} label="Dropped Files" value={stages.memory.dropped_files_analysis?.total_files || 0} />
              </div>

              {stages.memory.yara_hits_summary?.critical_rules?.length > 0 && (
                <div className={`${sectionCardClass} border-red-500/20 bg-red-500/5 p-5`}>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Critical YARA Matches</h3>
                  <div className="flex flex-wrap gap-2">
                    {stages.memory.yara_hits_summary.critical_rules.map((rule: string, idx: number) => (
                      <span key={idx} className="px-3 py-1.5 rounded border border-border bg-red-500/10 text-red-400 text-xs font-mono">{rule}</span>
                    ))}
                  </div>
                </div>
              )}

              {stages.memory.procdump_analysis?.extracted_families?.length > 0 && (
                <div className={`${sectionCardClass} p-5`}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">Extracted Malware Families</h3>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {stages.memory.procdump_analysis.extracted_families.map((family: string, idx: number) => (
                      <span key={idx} className="px-3 py-1.5 rounded border border-border bg-primary/10 text-primary text-xs font-medium">{family}</span>
                    ))}
                  </div>
                </div>
              )}

              {stages.memory.dropped_files_analysis?.notable_dropped?.length > 0 && (
                <ExpandableSection title="Notable Dropped Files" items={stages.memory.dropped_files_analysis.notable_dropped} renderItem={(file: any, idx) => (
                  <div key={idx} className={`${innerSurfaceClass} p-3`}>
                    <p className="text-xs font-mono text-foreground break-all">{file.name}</p>
                    {file.path && <p className="text-[10px] text-muted-foreground break-all mt-1">{file.path}</p>}
                  </div>
                )} />
              )}
            </div>
          )}

          {/* ==================== BEHAVIOR TAB ==================== */}
          {activeTab === "behavior" && stages.behavior && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatTile icon={<Cpu className="w-4 h-4" />} label="Processes" value={stages.behavior.process_analysis?.total_processes || 0} />
                <StatTile icon={<Activity className="w-4 h-4" />} label="API Calls" value={stages.behavior.api_behavior?.total_api_calls?.toLocaleString() || 0} />
                <StatTile icon={<Terminal className="w-4 h-4" />} label="Commands" value={stages.behavior.execution_commands?.commands?.length || 0} />
                <StatTile icon={<Database className="w-4 h-4" />} label="Registry Keys" value={stages.behavior.registry_behavior?.total_keys_accessed || 0} />
              </div>

              {stages.behavior.process_analysis?.notable_parent_child_relationships?.length > 0 && (
                <div className={`${sectionCardClass} p-5`}>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-primary" />
                  Process Tree Relationships
                </h3>
                <div className="space-y-1">
                    {stages.behavior.process_analysis.notable_parent_child_relationships.map((rel: string, idx: number) => (
                      <div key={idx} className={`${innerSurfaceClass} px-3 py-2 text-xs text-muted-foreground`}>{rel}</div>
                    ))}
                  </div>
                </div>
              )}

              {stages.behavior.api_behavior?.top_categories && Object.keys(stages.behavior.api_behavior.top_categories).length > 0 && (
                <div className={`${sectionCardClass} p-5`}>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    Top API Categories
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(stages.behavior.api_behavior.top_categories).slice(0, 8).map(([cat, count]) => (
                      <span key={cat} className="px-2 py-1 rounded bg-muted/20 text-xs text-muted-foreground">{cat}: {count as number}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ExpandableSection title="Files Written" items={stages.behavior.file_behavior?.files_written || []} renderItem={(f, idx) => <div key={idx} className="text-xs text-amber-400 break-all py-1">{f}</div>} />
                <ExpandableSection title="Files Deleted" items={stages.behavior.file_behavior?.files_deleted || []} renderItem={(f, idx) => <div key={idx} className="text-xs text-red-400 break-all py-1">{f}</div>} />
                <ExpandableSection title="Suspicious Writes" items={stages.behavior.file_behavior?.suspicious_writes || []} renderItem={(f, idx) => <div key={idx} className="text-xs text-red-400 break-all py-1">{f}</div>} />
              </div>

              {stages.behavior.execution_commands?.commands?.length > 0 && (
                <ExpandableSection title="Executed Commands" items={stages.behavior.execution_commands.commands} renderItem={(cmd, idx) => <div key={idx} className={`${innerSurfaceClass} p-2 text-xs font-mono text-foreground break-all`}>{cmd}</div>} />
              )}

              {stages.behavior.indicators?.mutexes?.length > 0 && (
                <ExpandableSection title="Mutexes" items={stages.behavior.indicators.mutexes} renderItem={(mutex, idx) => <div key={idx} className="text-xs text-primary break-all py-1">{mutex}</div>} />
              )}
            </div>
          )}

          {/* ==================== NETWORK TAB ==================== */}
          {activeTab === "network" && stages.network && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <StatTile icon={<Globe className="w-4 h-4" />} label="Domains" value={stages.network.dns_analysis?.domains_queried?.length || 0} />
                <StatTile icon={<Wifi className="w-4 h-4" />} label="DNS Queries" value={stages.network.dns_analysis?.total_queries || 0} />
                <StatTile icon={<Activity className="w-4 h-4" />} label="TCP Conn" value={stages.network.network_indicators?.total_tcp_connections || 0} />
                <StatTile icon={<WifiOff className="w-4 h-4" />} label="Dead Hosts" value={stages.network.network_indicators?.dead_hosts?.length || 0} />
                <StatTile icon={<Shield className="w-4 h-4" />} label="C2 Match" value={stages.network.c2_correlation?.c2_match_found ? "Yes" : "No"} />
              </div>

              {stages.network.c2_correlation?.c2_from_config?.length > 0 && (
                <div className={`${sectionCardClass} border-red-500/20 bg-red-500/5 p-5`}>
                  <h3 className="text-sm font-semibold text-foreground mb-2">C2 from Configuration (Not Observed)</h3>
                  <div className="space-y-1">
                    {stages.network.c2_correlation.c2_from_config.slice(0, 10).map((c2: string, idx: number) => (
                      <div key={idx} className="text-xs text-red-400 break-all font-mono">{c2}</div>
                    ))}
                  </div>
                  {stages.network.c2_correlation.notes && <p className="text-xs text-muted-foreground mt-2">{stages.network.c2_correlation.notes}</p>}
                </div>
              )}

              {stages.network.dns_analysis?.domains_queried?.length > 0 && (
                <ExpandableSection title="DNS Queries" items={stages.network.dns_analysis.domains_queried} renderItem={(domain, idx) => <div key={idx} className="text-xs text-primary break-all py-1">{domain}</div>} />
              )}

              {stages.network.network_indicators?.dead_hosts?.length > 0 && (
                <ExpandableSection title="Dead Hosts (Failed Connections)" items={stages.network.network_indicators.dead_hosts} renderItem={(host: any, idx) => <div key={idx} className="text-xs text-red-400 break-all py-1">{host.ip}:{host.port}</div>} />
              )}
            </div>
          )}

          {/* ==================== SYNTHESIS TAB ==================== */}
          {activeTab === "synthesis" && stages.synthesis && (
            <div className="space-y-6">
              {/* IOC Cards */}
              <div className={`${sectionCardClass} p-5`}>
                <div className="flex items-center gap-2 mb-4">
                  <Database className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Consolidated IOCs</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-foreground">SHA256 Hashes</p>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {iocs.sha256.map((hash, idx) => <div key={idx} className="text-[10px] font-mono text-muted-foreground break-all">{hash}</div>)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-foreground">MD5 Hashes</p>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {iocs.md5.map((hash, idx) => <div key={idx} className="text-[10px] font-mono text-muted-foreground break-all">{hash}</div>)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-foreground">Domains</p>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {iocs.domains.map((domain, idx) => <div key={idx} className="text-xs text-primary break-all">{domain}</div>)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-foreground">IP Addresses</p>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {iocs.ips.map((ip, idx) => <div key={idx} className="text-xs text-primary break-all">{ip}</div>)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-foreground">Mutexes</p>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {iocs.mutexes.map((mutex, idx) => <div key={idx} className="text-xs text-muted-foreground break-all">{mutex}</div>)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-foreground">YARA Rules</p>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {iocs.yaraRules.map((rule, idx) => <div key={idx} className="text-xs text-primary break-all">{rule}</div>)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Incident Response */}
              {responseActions.immediate.length > 0 && (
                <div className={`${sectionCardClass} p-5`}>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-primary" />
                    Incident Response Actions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><p className="text-xs font-semibold text-red-400 mb-1">Immediate Actions</p><ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">{responseActions.immediate.map((action, idx) => <li key={idx}>{action}</li>)}</ul></div>
                    <div><p className="text-xs font-semibold text-amber-400 mb-1">Containment Steps</p><ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">{responseActions.containment.map((action, idx) => <li key={idx}>{action}</li>)}</ul></div>
                    <div><p className="text-xs font-semibold text-blue-400 mb-1">Eradication Steps</p><ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">{responseActions.eradication.map((action, idx) => <li key={idx}>{action}</li>)}</ul></div>
                    <div><p className="text-xs font-semibold text-green-400 mb-1">Recovery Steps</p><ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">{responseActions.recovery.map((action, idx) => <li key={idx}>{action}</li>)}</ul></div>
                  </div>
                </div>
              )}

              {/* Hunting Queries */}
              {huntingQueries.length > 0 && (
                <div className={`${sectionCardClass} p-5`}>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Search className="w-4 h-4 text-primary" />
                    Suggested Hunting Queries
                  </h3>
                  <div className="space-y-2">
                    {huntingQueries.map((query, idx) => (
                      <div key={idx} className={`${innerSurfaceClass} p-2 text-xs font-mono text-foreground break-all`}>{query}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== RAW TAB ==================== */}
          {activeTab === "raw" && (
            <div className={`${sectionCardClass} p-4 overflow-auto max-h-[70vh]`}>
              <pre className="text-xs text-foreground font-mono whitespace-pre-wrap break-all">{JSON.stringify(data, null, 2)}</pre>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// HashRow component
const HashRow = ({ label, value }: { label: string; value?: string }) => {
  if (!value) return null
  return (
    <div className={`${innerSurfaceClass} flex items-center gap-2 p-2 group`}>
      <span className="text-[10px] text-muted-foreground uppercase w-14 shrink-0">{label}</span>
      <code className="text-xs text-foreground flex-1 truncate font-mono">{value.length > 20 ? `${value.slice(0, 20)}...` : value}</code>
      <button onClick={() => navigator.clipboard.writeText(value)} className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted/20 shrink-0">
        <Copy className="w-3 h-3" />
      </button>
    </div>
  )
}

const Box = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>