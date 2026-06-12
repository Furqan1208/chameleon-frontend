"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"

import {
  Activity,
  AlertTriangle,
  Brain,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Copy,
  Cpu,
  Database,
  Download,
  FileText,
  Fingerprint,
  Folder,
  Globe,
  Key,
  Lock,
  MemoryStick,
  PieChart,
  Radar,
  Shield,
  Target,
  Terminal,
  Wifi,
  Zap,
} from "lucide-react"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart as RePieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface OverviewDashboardProps {
  combinedAnalysis?: any
  fileHashes?: any
  malscore?: number
  capeData?: any
  parsedData?: any
  aiData?: any
  onCopyJson?: () => void
  copied?: boolean
  onDownload?: (format: string) => void
}

/* -------------------------------------------------------------------------- */
/*                                   Utils                                    */
/* -------------------------------------------------------------------------- */

const safeArray = <T = any,>(value: any): T[] =>
  Array.isArray(value) ? value : []

const safeNumber = (value: any, defaultValue = 0): number => {
  const n = Number(value)
  return isNaN(n) ? defaultValue : n
}

const resolveString = (v: any) => {
  if (v === null || v === undefined) return undefined
  const s = String(v).trim()
  if (!s || s.toLowerCase() === "n/a" || s.toLowerCase() === "none" || s.toLowerCase() === "null") {
    return undefined
  }
  return s
}

const formatBytes = (bytes?: number): string => {
  if (!bytes || isNaN(bytes)) return "N/A"
  const units = ["B", "KB", "MB", "GB"]
  const idx = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / Math.pow(1024, idx)).toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`
}

const formatDate = (date?: string): string => {
  if (!date) return "Unknown"
  const d = new Date(date)
  return isNaN(d.getTime()) ? date : d.toLocaleString()
}

const truncate = (str?: string, maxLen = 80): string => {
  if (!str) return ""
  return str.length > maxLen ? `${str.slice(0, maxLen)}...` : str
}

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

/* -------------------------------------------------------------------------- */
/*                                   Expandable Section                       */
/* -------------------------------------------------------------------------- */

const ExpandableSection = ({ title, items, renderItem, initialCount = 4, step = 4, emptyMessage = "No items" }: { title: string; items: any[]; renderItem: (item: any, idx: number) => React.ReactNode; initialCount?: number; step?: number; emptyMessage?: string }) => {
  const [expanded, setExpanded] = useState(false)
  const visibleItems = expanded ? items : items.slice(0, initialCount)
  const hasMore = items.length > initialCount

  if (items.length === 0) return null

  return (
    <div className="rounded-xl border border-border bg-card/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{title}</p>
        <span className="text-[10px] text-muted-foreground">{items.length} total</span>
      </div>
      <div className="space-y-2">{visibleItems.map((item, idx) => renderItem(item, idx))}</div>
      {hasMore && (
        <button onClick={() => setExpanded(!expanded)} className="mt-3 text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? "Show less" : `Show ${Math.min(step, items.length - initialCount)} more`}
        </button>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                   Scores                                   */
/* -------------------------------------------------------------------------- */

const clampScore = (score: number, max = 10): number => {
  if (!isFinite(score)) return 0
  return Math.max(0, Math.min(score, max))
}

const scoreLabel = (score: number): string => {
  if (score >= 8) return "Critical"
  if (score >= 6) return "High"
  if (score >= 4) return "Medium"
  if (score >= 2) return "Low"
  return "Clean"
}

const getScoreColor = (score: number) => {
  if (score >= 8) return "#ef4444"
  if (score >= 5) return "#f59e0b"
  return "#22c55e"
}

/* -------------------------------------------------------------------------- */
/*                               Score Ring                                   */
/* -------------------------------------------------------------------------- */

const ScoreRing = ({ score, max = 10, label, subtitle }: { score: number; max?: number; label: string; subtitle?: string }) => {
  const clamped = clampScore(score, max)
  const percent = (clamped / max) * 100
  const ringColor = getScoreColor(clamped)

  return (
    <div className="rounded-3xl border border-border bg-card/80 backdrop-blur-sm p-5 shadow-lg">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-5">{label}</p>
      <div className="flex items-center gap-5">
        <div className="relative h-28 w-28 shrink-0 rounded-full" style={{ background: `conic-gradient(${ringColor} ${percent}%, rgba(255,255,255,0.08) ${percent}% 100%)` }}>
          <div className="absolute inset-[8px] rounded-full bg-background border border-border flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{clamped.toFixed(1)}</div>
              <div className="text-[10px] text-muted-foreground">/ {max}</div>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-xl font-semibold text-foreground">{scoreLabel(clamped)} Risk</p>
          <p className="text-sm text-muted-foreground mt-1 leading-6">{subtitle}</p>
          <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden mt-4">
            <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: ringColor }} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                               Metric Tile                                  */
/* -------------------------------------------------------------------------- */

const MetricTile = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
  <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-[0_18px_50px_-36px_rgba(16,185,129,0.16)] backdrop-blur-sm">
    <div className="mb-3 flex items-center justify-between gap-3">
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary">{icon}</div>
    </div>
    <p className="text-3xl font-bold text-foreground">{value}</p>
  </div>
)

/* -------------------------------------------------------------------------- */
/*                           Extract AI Threat (Fixed)                        */
/* -------------------------------------------------------------------------- */

const extractAiThreat = (aiData: any) => {
  // Safety check for empty/malformed data
  if (!aiData || typeof aiData !== 'object') {
    return { 
      aiThreatLevel: "Unknown", 
      confidencePercent: 0, 
      normalizedThreatScore: 0 
    }
  }

  // Helper to extract from malformed overview string
  const extractFromMalformedOverview = (overview: string) => {
    if (!overview || typeof overview !== 'string') return null
    
    // Try to extract one_liner, malware_family, final_verdict, confidence_score, summary_paragraph
    const patterns = {
      one_liner: /"one_liner":\s*"([^"]+)"/,
      malware_family: /"malware_family":\s*"([^"]+)"/,
      final_verdict: /"final_verdict":\s*"([^"]+)"/,
      confidence_score: /"confidence_score":\s*(\d+(?:\.\d+)?)/,
      summary_paragraph: /"summary_paragraph":\s*"([^"]+(?:\\"[^"]*\\"[^"]*)*)"/
    }
    
    const result: any = {}
    if (patterns.one_liner.test(overview)) {
      result.one_liner = overview.match(patterns.one_liner)?.[1]
    }
    if (patterns.malware_family.test(overview)) {
      result.malware_family = overview.match(patterns.malware_family)?.[1]
    }
    if (patterns.final_verdict.test(overview)) {
      result.final_verdict = overview.match(patterns.final_verdict)?.[1]
    }
    if (patterns.confidence_score.test(overview)) {
      result.confidence_score = parseFloat(overview.match(patterns.confidence_score)?.[1] || "0")
    }
    if (patterns.summary_paragraph.test(overview)) {
      result.summary_paragraph = overview.match(patterns.summary_paragraph)?.[1]?.replace(/\\n/g, ' ').replace(/\\"/g, '"')
    }
    
    return Object.keys(result).length > 0 ? result : null
  }

  // Try multiple paths to find the final synthesis analysis
  let finalAnalysis = null
  let executiveSummary = null
  
  // Path 1: Standard structure - results.final_synthesis.analysis
  if (aiData?.results?.final_synthesis?.analysis) {
    finalAnalysis = aiData.results.final_synthesis.analysis
    executiveSummary = finalAnalysis?.executive_summary
  }
  // Path 2: Direct final_synthesis.analysis
  else if (aiData?.final_synthesis?.analysis) {
    finalAnalysis = aiData.final_synthesis.analysis
    executiveSummary = finalAnalysis?.executive_summary
  }
  // Path 3: results.final_synthesis (analysis might be the object itself)
  else if (aiData?.results?.final_synthesis && typeof aiData.results.final_synthesis === 'object') {
    if (aiData.results.final_synthesis.executive_summary) {
      finalAnalysis = aiData.results.final_synthesis
      executiveSummary = finalAnalysis?.executive_summary
    }
  }

  // Handle the malformed structure where executive_summary.overview contains the data
  if (executiveSummary && executiveSummary.overview && typeof executiveSummary.overview === 'string') {
    const extracted = extractFromMalformedOverview(executiveSummary.overview)
    if (extracted) {
      // Create a properly formatted executive_summary from extracted data
      executiveSummary = {
        final_verdict: extracted.final_verdict,
        confidence_score: extracted.confidence_score,
        one_liner: extracted.one_liner,
        malware_family: extracted.malware_family,
        summary_paragraph: extracted.summary_paragraph
      }
    }
  }
  
  // Also check if the entire analysis object has an overview string
  if (finalAnalysis && finalAnalysis.overview && typeof finalAnalysis.overview === 'string') {
    const extracted = extractFromMalformedOverview(finalAnalysis.overview)
    if (extracted && !executiveSummary) {
      executiveSummary = {
        final_verdict: extracted.final_verdict,
        confidence_score: extracted.confidence_score,
        one_liner: extracted.one_liner,
        malware_family: extracted.malware_family,
        summary_paragraph: extracted.summary_paragraph
      }
    }
  }

  // If no final analysis yet, look for any section that contains executive_summary
  if (!finalAnalysis && aiData?.results) {
    for (const key of Object.keys(aiData.results)) {
      const section = aiData.results[key]
      // Check if section has analysis with executive_summary
      if (section?.analysis?.executive_summary) {
        finalAnalysis = section.analysis
        executiveSummary = finalAnalysis?.executive_summary
        break
      }
      // Check if section itself has executive_summary
      if (section?.executive_summary) {
        finalAnalysis = section
        executiveSummary = finalAnalysis?.executive_summary
        break
      }
    }
  }

  // If still no final analysis, try to get from behavior_analysis (which usually works)
  if (!finalAnalysis && aiData?.results?.behavior_analysis?.analysis) {
    finalAnalysis = aiData.results.behavior_analysis.analysis
    // Behavior analysis doesn't have executive_summary directly, so try to extract from risk_assessment
    if (finalAnalysis?.risk_assessment?.risk_level) {
      const riskMap: Record<string, { level: string; score: number }> = {
        "critical": { level: "MALICIOUS", score: 9 },
        "high": { level: "HIGH", score: 7 },
        "medium": { level: "MEDIUM", score: 5 },
        "low": { level: "LOW", score: 2 }
      }
      const risk = finalAnalysis.risk_assessment.risk_level?.toLowerCase()
      if (risk && riskMap[risk]) {
        executiveSummary = {
          final_verdict: riskMap[risk].level,
          confidence_score: riskMap[risk].score
        }
      }
    }
  }

  // Extract threat level
  let aiThreatLevel = "Unknown"
  if (executiveSummary?.final_verdict) {
    aiThreatLevel = executiveSummary.final_verdict
  } else if (executiveSummary?.threat_level) {
    aiThreatLevel = executiveSummary.threat_level
  } else if (finalAnalysis?.overall_threat_level) {
    aiThreatLevel = finalAnalysis.overall_threat_level
  } else if (finalAnalysis?.executive_summary?.final_verdict) {
    aiThreatLevel = finalAnalysis.executive_summary.final_verdict
  }

  // Extract confidence score - try multiple sources
  let confidenceNum = 0
  
  // Source 1: executive_summary.confidence_score
  if (executiveSummary?.confidence_score !== undefined && executiveSummary.confidence_score !== null) {
    confidenceNum = executiveSummary.confidence_score
  }
  // Source 2: executive_summary.confidence (alternative field name)
  else if (executiveSummary?.confidence !== undefined && executiveSummary.confidence !== null) {
    confidenceNum = executiveSummary.confidence
  }
  // Source 3: overall_confidence
  else if (finalAnalysis?.overall_confidence !== undefined && finalAnalysis.overall_confidence !== null) {
    const confMap: Record<string, number> = { "HIGH": 9, "MEDIUM": 6, "LOW": 3 }
    confidenceNum = confMap[String(finalAnalysis.overall_confidence).toUpperCase()] || 0
  }
  // Source 4: threat_confidence_score
  else if (finalAnalysis?.threat_confidence_score !== undefined && finalAnalysis.threat_confidence_score !== null) {
    confidenceNum = finalAnalysis.threat_confidence_score
  }
  // Source 5: From behavior analysis risk level (fallback)
  else if (aiData?.results?.behavior_analysis?.analysis?.risk_assessment?.risk_level) {
    const riskMap: Record<string, number> = { "critical": 9, "high": 7, "medium": 5, "low": 2, "none": 0 }
    const risk = String(aiData.results.behavior_analysis.analysis.risk_assessment.risk_level).toLowerCase()
    confidenceNum = riskMap[risk] || 0
    if (confidenceNum > 0) {
      aiThreatLevel = risk === "critical" ? "MALICIOUS" : risk === "high" ? "HIGH" : risk === "medium" ? "MEDIUM" : "LOW"
    }
  }

  // Normalize confidence to percentage and 0-10 scale
  let confidencePercent = 0
  let normalizedThreatScore = 0

  if (confidenceNum <= 1 && confidenceNum >= 0) {
    confidencePercent = Math.round(confidenceNum * 100)
    normalizedThreatScore = Number((confidenceNum * 10).toFixed(2))
  } else if (confidenceNum > 1 && confidenceNum <= 10) {
    confidencePercent = Math.round(confidenceNum * 10)
    normalizedThreatScore = Number(confidenceNum.toFixed(2))
  } else if (confidenceNum > 10 && confidenceNum <= 100) {
    confidencePercent = Math.round(confidenceNum)
    normalizedThreatScore = Number((confidenceNum / 10).toFixed(2))
  } else if (confidenceNum > 0) {
    normalizedThreatScore = Math.min(10, Math.max(0, confidenceNum))
    confidencePercent = Math.round(normalizedThreatScore * 10)
  }

  // If we have a confidence score but no threat level, derive one
  if (confidenceNum > 0 && aiThreatLevel === "Unknown") {
    if (confidenceNum >= 7) aiThreatLevel = "MALICIOUS"
    else if (confidenceNum >= 5) aiThreatLevel = "SUSPICIOUS"
    else if (confidenceNum >= 3) aiThreatLevel = "LOW RISK"
    else aiThreatLevel = "UNKNOWN"
  }

  // Clamp to valid ranges
  normalizedThreatScore = Math.max(0, Math.min(10, normalizedThreatScore))
  confidencePercent = Math.max(0, Math.min(100, confidencePercent))

  // If we still have 0 but the sample is clearly malicious (we can infer from malware_family)
  if (normalizedThreatScore === 0 && (executiveSummary?.malware_family || aiThreatLevel === "MALICIOUS")) {
    normalizedThreatScore = 8.5
    confidencePercent = 85
  }

  return { 
    aiThreatLevel, 
    confidencePercent, 
    normalizedThreatScore 
  }
}

/* -------------------------------------------------------------------------- */
/*                            Main Component                                  */
/* -------------------------------------------------------------------------- */

export default function OverviewDashboard({ capeData, aiData, parsedData, fileHashes, malscore, onCopyJson, copied, onDownload }: OverviewDashboardProps) {
  const [expandedInsights, setExpandedInsights] = useState(false)

  const aiThreat = useMemo(() => extractAiThreat(aiData), [aiData])
  const sandboxScore = clampScore(safeNumber(malscore || capeData?.malscore, 0))

  /* -------------------------------------------------------------------------- */
  /*                               CAPE Metrics                                 */
  /* -------------------------------------------------------------------------- */

  const capeMetrics = useMemo(() => {
    const behavior = capeData?.behavior || {}
    const summary = behavior.summary || {}
    const target = capeData?.target?.file || {}
    return {
      processes: safeArray(behavior.processes).length,
      signatures: safeArray(capeData?.signatures).length,
      droppedFiles: safeArray(capeData?.dropped).length,
      ttps: safeArray(capeData?.ttps).length,
      registryKeys: safeArray(summary.keys).length,
      writeFiles: safeArray(summary.write_files).length,
      deleteFiles: safeArray(summary.delete_files).length,
      networkDomains: safeArray(capeData?.network?.domains).length,
      memoryDumps: safeArray(capeData?.procmemory).length,
      malstatus: String(capeData?.malstatus || "Unknown"),
      timeout: Boolean(capeData?.info?.timeout),
      duration: safeNumber(capeData?.info?.duration, 0),
      package: String(capeData?.info?.package || "Unknown"),
      fileSize: target.size,
      fileType: target.type,
      capeType: target.cape_type,
      executedCommands: safeArray(summary.executed_commands),
      mutexes: safeArray(summary.mutexes),
      readFiles: safeArray(summary.read_files),
    }
  }, [capeData])

  /* -------------------------------------------------------------------------- */
  /*                            Parsed Metrics                                 */
  /* -------------------------------------------------------------------------- */

  const parsedMetrics = useMemo(() => {
    const parsedSignatures = parsedData?.signatures?.ai_summary || {}
    const rawSignatures = safeArray(capeData?.signatures)
    const totalSignatures = parsedSignatures.total_signatures || rawSignatures.length
    const criticalSignatures = parsedSignatures.critical_signatures || rawSignatures.filter((s: any) => s.severity >= 3).length
    const signatureText = rawSignatures.map((s: any) => `${s.name || ""} ${s.description || ""} ${s.categories?.join(" ") || ""}`.toLowerCase()).join(" ")
    const hasPersistence = parsedSignatures.has_persistence || signatureText.includes("persistence") || signatureText.includes("scheduled task") || signatureText.includes("autorun")
    const hasInjection = parsedSignatures.has_injection || signatureText.includes("injection") || signatureText.includes("shellcode")
    const hasAntiVm = parsedSignatures.has_anti_vm || signatureText.includes("anti-vm") || signatureText.includes("virtual machine")
    const detectedFamilies = parsedData?.target?.ai_summary?.detected_families || aiData?.results?.final_synthesis?.analysis?.integrated_findings?.confirmed_families || []

    return { totalSignatures, criticalSignatures, detectedFamilies, hasPersistence, hasInjection, hasAntiVm }
  }, [parsedData, capeData, aiData])

  /* -------------------------------------------------------------------------- */
  /*                              AI Insights                                   */
  /* -------------------------------------------------------------------------- */

  const aiInsights = useMemo(() => {
    const finalAnalysis = aiData?.results?.final_synthesis?.analysis || aiData?.final_synthesis?.analysis
    return {
      summary: finalAnalysis?.executive_summary?.summary_paragraph || "",
      detectedFamilies: finalAnalysis?.integrated_findings?.confirmed_families || [],
      persistenceMechanisms: finalAnalysis?.integrated_findings?.persistence_mechanisms || [],
      defenseEvasion: finalAnalysis?.integrated_findings?.defense_evasion_techniques || [],
      impactAssessment: finalAnalysis?.integrated_findings?.impact_assessment || {},
    }
  }, [aiData])

  /* -------------------------------------------------------------------------- */
  /*                               File Identity                                */
  /* -------------------------------------------------------------------------- */

  const fileName = resolveString(fileHashes?.filename) || resolveString(capeData?.target?.file?.name) || resolveString(parsedData?.target?.ai_summary?.file_name) || "Unknown Sample"
  const sha256 = resolveString(fileHashes?.sha256) || resolveString(capeData?.target?.file?.sha256) || resolveString(parsedData?.target?.ai_summary?.sha256)

  /* -------------------------------------------------------------------------- */
  /*                               Chart Data                                   */
  /* -------------------------------------------------------------------------- */

  const severityData = [{ name: "Critical", value: parsedMetrics.criticalSignatures, color: GREEN_CHART.darkest }, { name: "Other", value: Math.max(parsedMetrics.totalSignatures - parsedMetrics.criticalSignatures, 0), color: GREEN_CHART.light }].filter(x => x.value > 0)

  const behavioralData = [
    { name: "Registry", value: Math.min(capeMetrics.registryKeys, 500), fullValue: capeMetrics.registryKeys },
    { name: "Write Files", value: Math.min(capeMetrics.writeFiles, 500), fullValue: capeMetrics.writeFiles },
    { name: "Delete Files", value: Math.min(capeMetrics.deleteFiles, 500), fullValue: capeMetrics.deleteFiles },
    { name: "Read Files", value: Math.min(capeMetrics.readFiles.length, 500), fullValue: capeMetrics.readFiles.length },
    { name: "Commands", value: Math.min(capeMetrics.executedCommands.length, 500), fullValue: capeMetrics.executedCommands.length },
    { name: "Mutexes", value: Math.min(capeMetrics.mutexes.length, 500), fullValue: capeMetrics.mutexes.length },
  ]

  const totalSeveritySignatures = parsedMetrics.totalSignatures

  const apiCategoryData = useMemo(() => {
    const catCounts: Record<string, number> = {}
    safeArray(capeData?.behavior?.processes).forEach((proc: any) => {
      safeArray(proc.calls).forEach((call: any) => {
        const cat = call.category || "other"
        catCounts[cat] = (catCounts[cat] || 0) + 1
      })
    })
    return Object.entries(catCounts).map(([name, count]) => ({ name: name.replace(/_/g, " "), count })).sort((a, b) => b.count - a.count).slice(0, 6)
  }, [capeData])

  /* -------------------------------------------------------------------------- */
  /*                                  Render                                    */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col xl:flex-row justify-between gap-5">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-1 rounded-full bg-gradient-to-b from-primary to-primary/20" />
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary font-semibold">Unified Threat Intelligence</p>
          </div>
          <h2 className="text-3xl font-bold text-foreground">Sandbox + AI Unified Overview</h2>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-sm text-muted-foreground">{fileName}</span>
            {capeMetrics.fileSize && <span className="text-xs text-muted-foreground">• {formatBytes(capeMetrics.fileSize)}</span>}
            {capeMetrics.capeType && <span className="text-xs px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">{truncate(capeMetrics.capeType, 40)}</span>}
          </div>
        </div>
        <div className="flex gap-2">
          {onCopyJson && (
            <button onClick={onCopyJson} className="px-4 py-2 rounded-xl border border-border hover:bg-muted/20 transition-all flex items-center gap-2">
              <Copy className="w-4 h-4" /> {copied ? "Copied" : "Copy JSON"}
            </button>
          )}
          {onDownload && (
            <button onClick={() => onDownload("json")} className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center gap-2">
              <Download className="w-4 h-4" /> Export
            </button>
          )}
        </div>
      </div>

      {/* SCORE CARDS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <ScoreRing score={sandboxScore} label="Sandbox Threat Score" subtitle={`Verdict: ${capeMetrics.malstatus}${capeMetrics.timeout ? " • Timeout" : ""}`} />
        <ScoreRing score={aiThreat.normalizedThreatScore} label="AI Threat Assessment" subtitle={`${aiThreat.aiThreatLevel} • ${aiThreat.confidencePercent}% confidence`} />
      </div>

      {/* METRICS - 8 tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
        <MetricTile icon={<Shield className="w-4 h-4" />} label="Signatures" value={parsedMetrics.totalSignatures} />
        <MetricTile icon={<Cpu className="w-4 h-4" />} label="Processes" value={capeMetrics.processes} />
        <MetricTile icon={<Folder className="w-4 h-4" />} label="Dropped" value={capeMetrics.droppedFiles} />
        <MetricTile icon={<Globe className="w-4 h-4" />} label="Domains" value={capeMetrics.networkDomains} />
        <MetricTile icon={<MemoryStick className="w-4 h-4" />} label="Memory" value={capeMetrics.memoryDumps} />
        <MetricTile icon={<Target className="w-4 h-4" />} label="MITRE" value={capeMetrics.ttps} />
        <MetricTile icon={<Key className="w-4 h-4" />} label="Registry" value={capeMetrics.registryKeys} />
        <MetricTile icon={<Terminal className="w-4 h-4" />} label="Commands" value={capeMetrics.executedCommands.length} />
      </div>

      {/* MAIN GRID - Enhanced Left Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-6">
        {/* LEFT PANE - RICH CONTENT */}
        <div className="space-y-6">
          {/* Row 1: Two Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Signature Severity Pie */}
            <div className="rounded-3xl border border-border bg-card/80 p-5">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-foreground">Signature Severity</h3>
                </div>
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                  {totalSeveritySignatures} total
                </span>
              </div>
              <div className="relative">
                <ResponsiveContainer width="100%" height={250}>
                  <RePieChart>
                    <defs>
                      <linearGradient id="signatureSeverityCritical" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={GREEN_CHART.darkest} />
                        <stop offset="100%" stopColor={GREEN_CHART.base} />
                      </linearGradient>
                      <linearGradient id="signatureSeverityOther" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={GREEN_CHART.light} />
                        <stop offset="100%" stopColor={GREEN_CHART.pale} />
                      </linearGradient>
                    </defs>
                    <Pie data={severityData} cx="50%" cy="50%" innerRadius={60} outerRadius={92} dataKey="value" paddingAngle={4} cornerRadius={12} startAngle={90} endAngle={-270} stroke={"rgba(6, 78, 59, 0.9)"} strokeWidth={3}>
                      {severityData.map((entry, idx) => <Cell key={idx} fill={idx === 0 ? "url(#signatureSeverityCritical)" : "url(#signatureSeverityOther)"} />)}
                    </Pie>
                    <Tooltip content={<GreenTooltip valueFormatter={(value) => `${value} sigs`} />} />
                  </RePieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-200/70">Signature load</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">{totalSeveritySignatures}</p>
                  <p className="text-xs text-muted-foreground">detected signatures</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {severityData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2 rounded-full border border-border bg-background/30 px-3 py-1.5 text-[11px] text-slate-200">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span>{entry.name}</span>
                    <span className="font-semibold text-emerald-100">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* API Categories Bar Chart */}
            <div className="rounded-3xl border border-border bg-card/80 p-5">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-foreground">Top API Categories</h3>
                </div>
                <span className="text-[10px] uppercase tracking-[0.16em] text-emerald-300/80">Behavior focus</span>
              </div>
              {apiCategoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={apiCategoryData} layout="vertical" margin={{ top: 4, right: 18, left: 6, bottom: 4 }} barCategoryGap={16}>
                    <defs>
                      <linearGradient id="apiCategoryBar" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={GREEN_CHART.darkest} />
                        <stop offset="45%" stopColor={GREEN_CHART.dark} />
                        <stop offset="100%" stopColor={GREEN_CHART.light} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke={GREEN_CHART.grid} horizontal={false} />
                    <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#a7f3d0" }} />
                    <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#d1fae5" }} width={84} />
                    <Tooltip content={<GreenTooltip valueFormatter={(value) => `${value} calls`} />} />
                    <Bar dataKey="count" fill="url(#apiCategoryBar)" radius={[0, 12, 12, 0]} barSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[240px] text-muted-foreground">No API call data</div>
              )}
              {apiCategoryData.length > 0 && (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {apiCategoryData.slice(0, 4).map((item) => (
                    <div key={item.name} className="rounded-2xl border border-border bg-background/30 px-3 py-2">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-200/60">{item.name}</p>
                      <p className="mt-1 text-lg font-semibold text-foreground">{item.count}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Behavioral Activity Chart (Enhanced) */}
          <div className="rounded-3xl border border-border bg-card/80 p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-foreground">Behavioral Activity Distribution</h3>
              </div>
              <span className="text-[10px] uppercase tracking-[0.16em] text-emerald-300/80">Normalized trend</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={behavioralData}>
                <defs>
                  <linearGradient id="behavioralGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={GREEN_CHART.light} stopOpacity={0.72} />
                    <stop offset="95%" stopColor={GREEN_CHART.darkest} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke={GREEN_CHART.grid} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#d1fae5" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#a7f3d0" }} tickLine={false} axisLine={false} width={34} />
                <Tooltip content={<GreenTooltip valueFormatter={(value, _name, payload) => `${payload?.fullValue ?? value} events`} />} />
                <Area type="monotone" dataKey="value" stroke={GREEN_CHART.base} strokeWidth={2.5} fillOpacity={1} fill="url(#behavioralGreen)" dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: GREEN_CHART.pale }} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-3 mt-4 text-center">
              <div className="rounded-2xl border border-border bg-background/30 p-3"><p className="text-[10px] uppercase tracking-[0.18em] text-emerald-200/70">Registry</p><p className="mt-2 text-lg font-bold text-foreground">{capeMetrics.registryKeys}</p></div>
              <div className="rounded-2xl border border-border bg-background/30 p-3"><p className="text-[10px] uppercase tracking-[0.18em] text-emerald-200/70">Write Files</p><p className="mt-2 text-lg font-bold text-foreground">{capeMetrics.writeFiles}</p></div>
              <div className="rounded-2xl border border-border bg-background/30 p-3"><p className="text-[10px] uppercase tracking-[0.18em] text-emerald-200/70">Commands</p><p className="mt-2 text-lg font-bold text-foreground">{capeMetrics.executedCommands.length}</p></div>
            </div>
          </div>

          {/* Row 3: Executed Commands */}
          {capeMetrics.executedCommands.length > 0 && (
            <ExpandableSection title="Executed Commands" items={capeMetrics.executedCommands} initialCount={4} renderItem={(cmd, idx) => (
              <div key={idx} className="rounded-xl bg-muted/10 border border-border p-3">
                <code className="text-[11px] font-mono text-foreground break-all">{cmd}</code>
              </div>
            )} />
          )}

          {/* Row 4: Mutexes */}
          {capeMetrics.mutexes.length > 0 && (
            <ExpandableSection title="Mutexes" items={capeMetrics.mutexes} initialCount={5} renderItem={(mutex, idx) => (
              <div key={idx} className="text-xs text-primary font-mono break-all py-1 border-b border-border/50 last:border-0">{mutex}</div>
            )} />
          )}

          {/* Row 5: Detected Families & Capabilities */}
          {parsedMetrics.detectedFamilies.length > 0 && (
            <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <h3 className="text-sm font-semibold text-foreground">Detected Malware Families</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {parsedMetrics.detectedFamilies.map((family: string, idx: number) => (
                  <span key={idx} className="px-3 py-1.5 rounded-full border border-red-500/20 bg-red-500/10 text-red-300 text-xs font-medium shadow-sm">{family}</span>
                ))}
              </div>
            </div>
          )}

          {/* Capabilities */}
          {(parsedMetrics.hasPersistence || parsedMetrics.hasInjection || parsedMetrics.hasAntiVm) && (
            <div className="rounded-3xl border border-border bg-card/80 p-5">
              <div className="flex items-center gap-2 mb-5">
                <Zap className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Detected Capabilities</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {parsedMetrics.hasPersistence && <span className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2"><Lock className="w-3 h-3" />Persistence</span>}
                {parsedMetrics.hasInjection && <span className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2"><Activity className="w-3 h-3" />Process Injection</span>}
                {parsedMetrics.hasAntiVm && <span className="px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs flex items-center gap-2"><Shield className="w-3 h-3" />Anti-VM</span>}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANE - AI & Identity */}
        <div className="space-y-6">
          {/* AI Synthesis */}
          <div className="rounded-3xl border border-border bg-card/80 p-5">
            <div className="flex items-center gap-2 mb-5">
              <Brain className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">AI Synthesis</h3>
            </div>
            {aiInsights.summary ? (
              <div className="relative rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-4 overflow-hidden">
                <div className={`relative transition-all duration-500 ${expandedInsights ? "max-h-[1200px]" : "max-h-[180px]"} overflow-hidden`}>
                  <p className="text-sm leading-7 text-slate-200 whitespace-pre-wrap break-words">{aiInsights.summary}</p>
                  {!expandedInsights && <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-card to-transparent" />}
                </div>
                {aiInsights.summary.length > 300 && (
                  <button onClick={() => setExpandedInsights(!expandedInsights)} className="mt-4 text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-2">
                    {expandedInsights ? <><ChevronUp className="w-3 h-3" />Show less</> : <><ChevronDown className="w-3 h-3" />Read full synthesis</>}
                  </button>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No AI insights available.</p>
            )}
            {aiInsights.detectedFamilies.length > 0 && (
              <div className="mt-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">AI Confirmed Families</p>
                <div className="flex flex-wrap gap-2">
                  {aiInsights.detectedFamilies.map((family: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 rounded-full border border-red-500/20 bg-red-500/10 text-red-300 text-xs font-medium shadow-sm">{family}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 mt-5">
              <div className="rounded-2xl border border-border bg-background/30 p-4">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Confidence</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{aiThreat.confidencePercent}%</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/30 p-4">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">AI Verdict</p>
                <p className="mt-2 text-xl font-bold text-foreground">{aiThreat.aiThreatLevel}</p>
              </div>
            </div>
          </div>

          {/* Threat Intel */}
          <div className="rounded-3xl border border-border bg-card/80 p-5">
            <div className="flex items-center gap-2 mb-5">
              <Radar className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Threat Intelligence</h3>
            </div>
            <div className="space-y-5">
              {aiInsights.persistenceMechanisms.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Persistence</p>
                  <div className="space-y-2">
                    {aiInsights.persistenceMechanisms.slice(0, 3).map((item: string, idx: number) => (
                      <div key={idx} className="rounded-xl border border-amber-500/10 bg-amber-500/5 px-3 py-2 text-xs leading-6 text-slate-300">{item}</div>
                    ))}
                  </div>
                </div>
              )}
              {aiInsights.defenseEvasion.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Defense Evasion</p>
                  <div className="space-y-2">
                    {aiInsights.defenseEvasion.slice(0, 3).map((item: string, idx: number) => (
                      <div key={idx} className="rounded-xl border border-red-500/10 bg-red-500/5 px-3 py-2 text-xs leading-6 text-slate-300">{item}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* File Identity */}
          <div className="rounded-3xl border border-border bg-card/80 p-5">
            <div className="flex items-center gap-2 mb-5">
              <Fingerprint className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">File Identity</h3>
            </div>
            <div className="space-y-3">
              <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Filename</p>
                <p className="text-sm font-medium text-foreground break-all">{fileName}</p>
              </div>
              {capeMetrics.fileType && (
                <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">File Type</p>
                  <p className="text-xs leading-6 text-slate-300 break-words">{truncate(capeMetrics.fileType, 100)}</p>
                </div>
              )}
              <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Analysis Date</p>
                <p className="text-sm text-foreground">{formatDate(capeData?.info?.started)}</p>
              </div>
              {sha256 && (
                <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">SHA256</p>
                  <code className="block text-[11px] leading-6 break-all text-primary font-mono">{sha256}</code>
                </div>
              )}
            </div>
          </div>

          {/* Activity Summary */}
          <div className="rounded-3xl border border-border bg-card/80 p-5">
            <div className="flex items-center gap-2 mb-5">
              <Database className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Activity Summary</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Registry Keys", value: capeMetrics.registryKeys },
                { label: "Write Files", value: capeMetrics.writeFiles },
                { label: "Delete Files", value: capeMetrics.deleteFiles },
                { label: "Critical Sigs", value: parsedMetrics.criticalSignatures },
                { label: "Mutexes", value: capeMetrics.mutexes.length },
                { label: "Commands", value: capeMetrics.executedCommands.length },
              ].map((item, idx) => (
                <div key={idx} className="rounded-2xl border border-border bg-background/30 p-4">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{item.label}</p>
                  <p className="mt-3 text-3xl font-bold text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
