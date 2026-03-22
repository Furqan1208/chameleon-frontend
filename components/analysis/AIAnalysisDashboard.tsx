"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle,
  ClipboardCheck,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileCode,
  FileJson,
  Globe,
  HardDrive,
  Radar,
  Search,
  Shield,
  Sparkles,
  Target,
  Zap,
} from "lucide-react"
import { motion } from "framer-motion"
import CustomJSONViewer from "./CustomJSONViewer"

interface AIAnalysisDashboardProps {
  data: any
  loading?: boolean
  onCopyJson?: () => void
  copied?: boolean
  onDownload?: (format: string) => void
}

type AiView = "cycle" | "evidence" | "response" | "raw"

function safeArray<T = any>(v: any): T[] {
  return Array.isArray(v) ? v : []
}

function asObject(v: any): Record<string, any> {
  return v && typeof v === "object" && !Array.isArray(v) ? v : {}
}

function normalizeInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
}

function cleanText(v: any): string {
  if (typeof v !== "string") return ""
  return normalizeInlineMarkdown(v).replace(/\s+/g, " ").trim()
}

function firstSentence(v: any): string {
  const text = cleanText(v)
  if (!text) return ""
  const parts = text.split(/(?<=[.!?])\s+/)
  return parts[0] || text
}

function splitActionText(text: string): string[] {
  if (!text) return []

  // Normalize markdown-ish formatting and flatten malformed numbering from AI output.
  const normalized = text
    .replace(/\r/g, "")
    .replace(/\*\*/g, "")
    .replace(/(?:^|\s)(\d+)\.\s+/g, "\n$1. ")
    .replace(/\n\s*\*\s*/g, "\n")
    .replace(/\n\s*-\s*/g, "\n")
    .replace(/\n\s*\d+\.\s*$/gm, "")

  const byLine = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^\d+\.\s+/, ""))
    .map((line) => normalizeInlineMarkdown(line).trim())
    .filter(Boolean)

  if (byLine.length > 1) {
    return dedupeStrings(byLine)
  }

  const numberedSplit = normalized
    .split(/\n\s*\d+\.\s+/)
    .map((s) => normalizeInlineMarkdown(s).trim())
    .filter(Boolean)

  if (numberedSplit.length > 1) return numberedSplit

  return normalized
    .split("\n")
    .map((s) => normalizeInlineMarkdown(s).trim())
    .filter(Boolean)
}

function dedupeStrings(items: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  items.forEach((item) => {
    const normalized = item.trim()
    if (!normalized) return
    const key = normalized.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    out.push(normalized)
  })
  return out
}

function confidenceTone(score: number): "low" | "medium" | "high" {
  if (score >= 75) return "high"
  if (score >= 40) return "medium"
  return "low"
}

function toneClasses(tone: "low" | "medium" | "high") {
  if (tone === "high") return "text-red-300 border-red-500/30 bg-red-500/10"
  if (tone === "medium") return "text-amber-300 border-amber-500/30 bg-amber-500/10"
  return "text-green-300 border-green-500/30 bg-green-500/10"
}

function ProgressiveList<T>({
  items,
  renderItem,
  initialCount = 8,
  step = 8,
  className = "space-y-2",
}: {
  items: T[]
  renderItem: (item: T, idx: number) => React.ReactNode
  initialCount?: number
  step?: number
  className?: string
}) {
  const [visibleCount, setVisibleCount] = useState(initialCount)

  useEffect(() => {
    setVisibleCount(initialCount)
  }, [items, initialCount])

  const visible = items.slice(0, visibleCount)
  const hasMore = visibleCount < items.length

  return (
    <div className="space-y-3">
      <div className={className}>{visible.map((item, idx) => renderItem(item, idx))}</div>
      {items.length > initialCount && (
        <div className="flex items-center gap-2">
          {hasMore && (
            <button
              onClick={() => setVisibleCount((v) => Math.min(v + step, items.length))}
              className="px-3 py-1.5 text-xs border border-[#1a1a1a] rounded-lg hover:bg-muted/20 transition-colors"
            >
              See more ({items.length - visibleCount} left)
            </button>
          )}
          {visibleCount > initialCount && (
            <button
              onClick={() => setVisibleCount(initialCount)}
              className="px-3 py-1.5 text-xs border border-[#1a1a1a] rounded-lg hover:bg-muted/20 transition-colors"
            >
              Show less
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-[#1a1a1a] bg-black/20 p-3">
      <div className="flex items-center gap-2 mb-2 text-xs uppercase tracking-wider">
        <span className="inline-flex items-center justify-center h-6 w-6 rounded-md border border-slate-400/20 bg-slate-400/10 text-slate-200">
          {icon}
        </span>
        <span className="text-slate-300">{label}</span>
      </div>
      <p className="text-2xl font-semibold text-white break-words">{value}</p>
    </div>
  )
}

export default function AIAnalysisDashboard({ data, loading = false, onCopyJson, copied = false, onDownload }: AIAnalysisDashboardProps) {
  const [activeView, setActiveView] = useState<AiView>("cycle")
  const [textFilter, setTextFilter] = useState("")
  const [displayMode, setDisplayMode] = useState<"structured" | "raw">("structured")

  const sectionContainer = useMemo(() => {
    if (asObject(data?.results) && Object.keys(data.results).length) return data.results
    if (asObject(data?.sections) && Object.keys(data.sections).length) return data.sections
    return asObject(data)
  }, [data])

  const getSection = (key: string): any => {
    const raw = sectionContainer[key]
    if (raw?.analysis && typeof raw.analysis === "object") return raw.analysis
    if (typeof raw === "object") return raw
    return null
  }

  const sections = useMemo(() => {
    const ctx = getSection("initial_combined_analysis")
    const staticIntel = getSection("target_analysis")
    const signatures = getSection("signatures_analysis")
    const memory = getSection("memory_analysis")
    const behavior = getSection("behavior_analysis")
    const network = getSection("network_analysis")
    const final = getSection("final_synthesis")

    return { ctx, staticIntel, signatures, memory, behavior, network, final }
  }, [sectionContainer])

  const cycleSteps = useMemo(() => {
    const items = [
      {
        key: "ctx",
        label: "Context Intake",
        icon: <Radar className="w-4 h-4" />,
        section: sections.ctx,
        summary:
          firstSentence(sections.ctx?.ai_insights_summary?.recommended_analysis_path) ||
          firstSentence(sections.ctx?.initial_anomaly_detection?.anomaly_summary),
      },
      {
        key: "staticIntel",
        label: "Binary Forensics",
        icon: <FileCode className="w-4 h-4" />,
        section: sections.staticIntel,
        summary:
          firstSentence(sections.staticIntel?.static_forensic_insights?.file_authenticity_assessment) ||
          firstSentence(sections.staticIntel?.file_identity_assessment?.file_authenticity_indicators?.file_integrity_assessment),
      },
      {
        key: "signatures",
        label: "Detection Intelligence",
        icon: <Shield className="w-4 h-4" />,
        section: sections.signatures,
        summary:
          firstSentence(sections.signatures?.signature_summary?.conclusion) ||
          firstSentence(sections.signatures?.analysis_stage),
      },
      {
        key: "memory",
        label: "Memory Forensics",
        icon: <HardDrive className="w-4 h-4" />,
        section: sections.memory,
        summary:
          firstSentence(sections.memory?.ai_forensic_insights?.most_significant_indicator) ||
          firstSentence(sections.memory?.forensic_quality_assessment?.analysis_sufficiency),
      },
      {
        key: "behavior",
        label: "Behavior Correlation",
        icon: <Activity className="w-4 h-4" />,
        section: sections.behavior,
        summary:
          firstSentence(sections.behavior?.ai_insights_summary?.most_concerning_behavior) ||
          firstSentence(sections.behavior?.threat_indicators?.risk_level),
      },
      {
        key: "network",
        label: "Network Operations",
        icon: <Globe className="w-4 h-4" />,
        section: sections.network,
        summary:
          firstSentence(sections.network?.network_forensic_insights?.most_significant_indicator) ||
          firstSentence(sections.network?.network_behavior_profile?.overall_network_behavior),
      },
      {
        key: "final",
        label: "Synthesis Engine",
        icon: <Brain className="w-4 h-4" />,
        section: sections.final,
        summary:
          firstSentence(sections.final?.report?.executive_summary) || firstSentence(sections.final?.overall_threat_level),
      },
    ]

    return items.map((item) => ({ ...item, available: !!item.section }))
  }, [sections])

  const unifiedThreat = useMemo(() => {
    const threatLevel =
      cleanText(sections.final?.overall_threat_level) ||
      cleanText(sections.behavior?.threat_indicators?.risk_level) ||
      cleanText(sections.ctx?.ai_insights_summary?.initial_risk_indication) ||
      "UNKNOWN"

    const confidence =
      Number(sections.final?.threat_confidence_score) ||
      Number(sections.behavior?.threat_indicators?.confidence_score) ||
      0

    const tone = confidenceTone(confidence)

    return { threatLevel, confidence, tone }
  }, [sections])

  const keyFindings = useMemo(() => {
    const fromCtx = safeArray(sections.ctx?.ai_insights_summary?.key_observations)
    const fromBehavior = safeArray(sections.behavior?.ai_insights_summary?.key_findings)
    const fromMemory = safeArray(sections.memory?.ai_forensic_insights?.key_memory_findings)
    const fromNetwork = safeArray(sections.network?.network_forensic_insights?.key_network_findings)

    const fromFinalReport = [
      firstSentence(sections.final?.report?.executive_summary),
      firstSentence(sections.final?.report?.integrated_threat_assessment),
      firstSentence(sections.final?.report?.cross_stage_evidence_correlation),
    ].filter(Boolean)

    const merged = dedupeStrings([
      ...fromCtx.map(String),
      ...fromBehavior.map(String),
      ...fromMemory.map(String),
      ...fromNetwork.map(String),
      ...fromFinalReport.map(String),
    ])

    if (!textFilter.trim()) return merged.slice(0, 24)
    const q = textFilter.toLowerCase()
    return merged.filter((item) => item.toLowerCase().includes(q)).slice(0, 24)
  }, [sections, textFilter])

  const responseActions = useMemo(() => {
    const explicit = [
      ...safeArray(sections.behavior?.ai_insights_summary?.recommended_next_steps),
      ...safeArray(sections.memory?.ai_forensic_insights?.recommended_memory_investigation),
      ...safeArray(sections.network?.network_forensic_insights?.recommended_investigation),
    ]
      .map((item) => cleanText(String(item)))
      .filter(Boolean)

    const narrative = [
      ...splitActionText(cleanText(sections.final?.report?.incident_response_guidance)),
      ...splitActionText(cleanText(sections.final?.report?.investigation_priority_matrix)),
    ]

    const all = dedupeStrings([...explicit.map(String), ...narrative])
    if (!textFilter.trim()) return all.slice(0, 30)
    const q = textFilter.toLowerCase()
    return all.filter((item) => item.toLowerCase().includes(q)).slice(0, 30)
  }, [sections, textFilter])

  const evidenceCards = useMemo(() => {
    const contextCard = {
      title: "Execution Context",
      icon: <Radar className="w-4 h-4 text-primary" />,
      lines: [
        `Environment: ${cleanText(sections.ctx?.execution_environment_analysis?.sandbox_platform) || "N/A"}`,
        `Package: ${cleanText(sections.ctx?.execution_environment_analysis?.package_used) || "N/A"}`,
        `Status: ${cleanText(sections.ctx?.execution_environment_analysis?.execution_completion_status) || "N/A"}`,
        `Anomaly: ${cleanText(sections.ctx?.initial_anomaly_detection?.anomaly_summary) || "None"}`,
      ],
    }

    const staticCard = {
      title: "Static Artifact Posture",
      icon: <FileCode className="w-4 h-4 text-primary" />,
      lines: [
        `Architecture: ${cleanText(sections.staticIntel?.architecture) || "N/A"}`,
        `Entry Point: ${cleanText(sections.staticIntel?.entry_point_characteristics?.entry_point_section) || "N/A"}`,
        `Checksum: ${cleanText(sections.staticIntel?.checksum_validation?.checksum_anomaly) || "N/A"}`,
        `Integrity: ${cleanText(sections.staticIntel?.file_identity_assessment?.file_authenticity_indicators?.file_integrity_assessment) || "N/A"}`,
      ],
    }

    const behaviorCard = {
      title: "Behavioral Risk Signals",
      icon: <Activity className="w-4 h-4 text-primary" />,
      lines: [
        `Risk Level: ${cleanText(sections.behavior?.threat_indicators?.risk_level) || "N/A"}`,
        `Confidence: ${sections.behavior?.threat_indicators?.confidence_score ?? "N/A"}`,
        `Key Concern: ${cleanText(sections.behavior?.ai_insights_summary?.most_concerning_behavior) || "N/A"}`,
        `Threat Category: ${cleanText(sections.behavior?.ai_insights_summary?.likely_threat_category) || "N/A"}`,
      ],
    }

    const networkCard = {
      title: "Network Activity Profile",
      icon: <Globe className="w-4 h-4 text-primary" />,
      lines: [
        `Hosts: ${sections.network?.network_traffic_overview?.total_hosts_contacted ?? "N/A"}`,
        `Domains: ${sections.network?.network_traffic_overview?.total_domains_queried ?? "N/A"}`,
        `C2 Confidence: ${cleanText(sections.network?.c2_and_exfiltration_analysis?.command_and_control_indicators?.c2_confidence) || "N/A"}`,
        `Network Risk: ${cleanText(sections.network?.network_forensic_insights?.network_risk_assessment) || "N/A"}`,
      ],
    }

    const memoryCard = {
      title: "Memory Forensic Posture",
      icon: <HardDrive className="w-4 h-4 text-primary" />,
      lines: [
        `Capture Quality: ${sections.memory?.memory_capture_assessment?.capture_quality_score ?? "N/A"}`,
        `Completeness: ${cleanText(sections.memory?.memory_capture_assessment?.capture_completeness) || "N/A"}`,
        `Readiness: ${cleanText(sections.memory?.memory_capture_assessment?.forensic_readiness) || "N/A"}`,
        `Forensic Value: ${cleanText(sections.memory?.forensic_quality_assessment?.analysis_sufficiency) || "N/A"}`,
      ],
    }

    const synthesisCard = {
      title: "Final Threat Decision",
      icon: <Target className="w-4 h-4 text-primary" />,
      lines: [
        `Threat Level: ${cleanText(sections.final?.overall_threat_level) || "N/A"}`,
        `Confidence Score: ${sections.final?.threat_confidence_score ?? "N/A"}`,
        `Convergence: ${cleanText(sections.final?.confidence_assessment?.evidence_convergence_level) || "N/A"}`,
        `Forensic Completeness: ${cleanText(sections.final?.confidence_assessment?.forensic_completeness) || "N/A"}`,
      ],
    }

    return [contextCard, staticCard, behaviorCard, networkCard, memoryCard, synthesisCard]
  }, [sections])

  const sectionCoverage = useMemo(() => cycleSteps.filter((s) => s.available).length, [cycleSteps])

  const synthesisNarrative = useMemo(() => {
    return [
      cleanText(sections.final?.report?.executive_summary),
      cleanText(sections.final?.report?.integrated_threat_assessment),
      cleanText(sections.final?.report?.threat_progression_and_kill_chain),
    ]
      .filter(Boolean)
      .join("\n\n")
  }, [sections])

  if (!data || Object.keys(asObject(data)).length === 0) {
    return (
      <div className="text-center py-12">
        <FileJson className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No AI analysis data available</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
        <p className="text-muted-foreground">Synthesizing AI threat analysis cycle...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary mb-1">Unified AI Threat Cycle</p>
          <h2 className="text-2xl font-semibold text-white">End-to-End Intelligence Narrative</h2>
          <p className="text-sm text-muted-foreground mt-1">One continuous AI investigation flow from context intake to final threat decision.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setDisplayMode((m) => (m === "structured" ? "raw" : "structured"))}
            className="px-3 py-1.5 border border-[#1a1a1a] rounded-lg hover:bg-muted/20 transition-colors text-sm flex items-center gap-2"
          >
            {displayMode === "structured" ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {displayMode === "structured" ? "Raw View" : "Structured View"}
          </button>

          {onCopyJson && (
            <button
              onClick={onCopyJson}
              className="px-3 py-1.5 border border-[#1a1a1a] rounded-lg hover:bg-muted/20 transition-colors text-sm flex items-center gap-2"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? "Copied" : "Copy JSON"}
            </button>
          )}

          {onDownload && (
            <button
              onClick={() => onDownload("json")}
              className="px-3 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/20 transition-colors text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          )}
        </div>
      </div>

      {displayMode === "raw" ? (
        <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4">
          <CustomJSONViewer data={data} mode="raw" />
        </div>
      ) : (
        <>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-xl border border-[#1a1a1a] bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3">Threat Decision Signal</p>
                <div className="flex items-center gap-4">
                  <div
                    className="relative h-24 w-24 rounded-full"
                    style={{
                      background: `conic-gradient(${unifiedThreat.tone === "high" ? "#ef4444" : unifiedThreat.tone === "medium" ? "#f59e0b" : "#22c55e"} ${Math.min(unifiedThreat.confidence, 100)}%, rgba(255,255,255,0.08) ${Math.min(unifiedThreat.confidence, 100)}% 100%)`,
                    }}
                  >
                    <div className="absolute inset-[8px] rounded-full bg-[#0a0a0a] border border-[#1f1f1f] flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-xl font-bold text-white">{Math.round(unifiedThreat.confidence)}</p>
                        <p className="text-[10px] text-muted-foreground">/ 100</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-white">{unifiedThreat.threatLevel}</p>
                    <p className="text-sm text-muted-foreground">Confidence-driven synthesis signal</p>
                    <span className={`inline-flex mt-2 text-[11px] px-2 py-0.5 rounded border ${toneClasses(unifiedThreat.tone)}`}>
                      {unifiedThreat.tone === "high" ? "High Risk Confidence" : unifiedThreat.tone === "medium" ? "Medium Risk Confidence" : "Low Risk Confidence"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#1a1a1a] bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3">Cycle Coverage</p>
                <div className="grid grid-cols-2 gap-3">
                  <StatTile icon={<Sparkles className="w-3.5 h-3.5" />} label="Cycle Segments" value={cycleSteps.length} />
                  <StatTile icon={<CheckCircle className="w-3.5 h-3.5" />} label="Available Data" value={`${sectionCoverage}/${cycleSteps.length}`} />
                  <StatTile icon={<Brain className="w-3.5 h-3.5" />} label="Model" value={cleanText(data?.model_used) || "Multi-run"} />
                  <StatTile icon={<Zap className="w-3.5 h-3.5" />} label="Duration" value={data?.duration_seconds ? `${Number(data.duration_seconds).toFixed(1)}s` : "N/A"} />
                </div>
              </div>
            </div>
          </motion.div>

          <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] px-2 md:px-3">
            <nav className="flex overflow-x-auto">
              {[
                { id: "cycle", label: "Cycle Flow", icon: <Brain className="w-4 h-4" /> },
                { id: "evidence", label: "Evidence Matrix", icon: <Shield className="w-4 h-4" /> },
                { id: "response", label: "Response Plan", icon: <ClipboardCheck className="w-4 h-4" /> },
                { id: "raw", label: "Raw Data", icon: <FileJson className="w-4 h-4" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id as AiView)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${
                    activeView === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={textFilter}
                onChange={(e) => setTextFilter(e.target.value)}
                placeholder="Filter insights and response actions"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#1a1a1a] bg-black/20 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
              />
            </div>

            {activeView === "cycle" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-7 gap-3">
                  {cycleSteps.map((step, idx) => (
                    <div
                      key={step.key}
                      className={`rounded-lg border p-3 ${step.available ? "border-primary/30 bg-primary/10" : "border-[#1a1a1a] bg-black/20"}`}
                    >
                      <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
                        <span>Step {idx + 1}</span>
                        {step.available ? <CheckCircle className="w-3.5 h-3.5 text-primary" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex items-center gap-2 mb-1 text-foreground">
                        {step.icon}
                        <p className="text-xs font-semibold">{step.label}</p>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-3">{step.summary || "No structured signal extracted."}</p>
                    </div>
                  ))}
                </div>

                {synthesisNarrative && (
                  <div className="rounded-xl border border-[#1a1a1a] bg-black/20 p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-2">Unified Narrative</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{synthesisNarrative}</p>
                  </div>
                )}

                <div className="rounded-xl border border-[#1a1a1a] bg-black/20 p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Key Findings Stream</h3>
                  {keyFindings.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No findings match current filter.</p>
                  ) : (
                    <ProgressiveList
                      items={keyFindings}
                      initialCount={8}
                      step={8}
                      className="space-y-2"
                      renderItem={(item: string, idx: number) => (
                        <div key={idx} className="rounded-md border border-[#1a1a1a] bg-black/20 p-2 text-sm text-foreground">
                          {item}
                        </div>
                      )}
                    />
                  )}
                </div>
              </div>
            )}

            {activeView === "evidence" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {evidenceCards.map((card) => (
                    <div key={card.title} className="rounded-xl border border-[#1a1a1a] bg-black/20 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        {card.icon}
                        <h3 className="text-sm font-semibold text-foreground">{card.title}</h3>
                      </div>
                      <div className="space-y-2">
                        {card.lines.map((line, idx) => (
                          <p key={idx} className="text-xs text-muted-foreground break-words">{line}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-[#1a1a1a] bg-black/20 p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">High-Signal Findings</h3>
                  {keyFindings.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No findings available.</p>
                  ) : (
                    <ProgressiveList
                      items={keyFindings}
                      initialCount={10}
                      step={10}
                      className="space-y-2"
                      renderItem={(item: string, idx: number) => (
                        <div key={idx} className="rounded-md border border-[#1a1a1a] bg-black/20 p-2 text-sm text-foreground">
                          {item}
                        </div>
                      )}
                    />
                  )}
                </div>
              </div>
            )}

            {activeView === "response" && (
              <div className="space-y-6">
                <div className="rounded-xl border border-[#1a1a1a] bg-black/20 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Operational Response Queue</h3>
                  </div>

                  {responseActions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No response actions extracted from current AI outputs.</p>
                  ) : (
                    <ProgressiveList
                      items={responseActions}
                      initialCount={10}
                      step={10}
                      className="space-y-2"
                      renderItem={(action: string, idx: number) => (
                        <div key={idx} className="rounded-md border border-[#1a1a1a] bg-black/20 p-2 text-sm text-foreground flex items-start gap-2">
                          <span className="mt-0.5 text-primary">{idx + 1}.</span>
                          <span>{action.replace(/^\d+\.\s+/, "")}</span>
                        </div>
                      )}
                    />
                  )}
                </div>

                <div className="rounded-xl border border-[#1a1a1a] bg-black/20 p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-2">Confidence and Limits</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="rounded-md border border-[#1a1a1a] p-3">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Evidence Convergence</p>
                      <p className="text-foreground mt-1">{cleanText(sections.final?.confidence_assessment?.evidence_convergence_level) || "N/A"}</p>
                    </div>
                    <div className="rounded-md border border-[#1a1a1a] p-3">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Forensic Completeness</p>
                      <p className="text-foreground mt-1">{cleanText(sections.final?.confidence_assessment?.forensic_completeness) || "N/A"}</p>
                    </div>
                    <div className="rounded-md border border-[#1a1a1a] p-3 md:col-span-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Analysis Limitations</p>
                      <p className="text-foreground mt-1">{cleanText(sections.final?.confidence_assessment?.analysis_limitations) || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeView === "raw" && (
              <div className="rounded-xl border border-[#1a1a1a] bg-black/20 p-3">
                <CustomJSONViewer data={data} mode="pretty" />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
