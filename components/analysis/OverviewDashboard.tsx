"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Brain,
  CheckCircle,
  Copy,
  Download,
  File,
  FileCode,
  Folder,
  Key,
  Network,
  Shield,
  Sparkles,
  Terminal,
} from "lucide-react"

type AnyRecord = Record<string, any>

interface OverviewDashboardProps {
  combinedAnalysis: AnyRecord
  fileHashes: AnyRecord
  malscore: number
  capeData: AnyRecord
  parsedData: AnyRecord
  aiData: AnyRecord
  onCopyJson?: () => void
  copied?: boolean
  onDownload?: (format: string) => void
}

function getScoreColor(score: number): "green" | "amber" | "red" {
  if (score >= 6) return "red"
  if (score <= 2) return "green"
  return "amber"
}

function getRingColorClass(color: "green" | "amber" | "red"): string {
  if (color === "red") return "#ef4444"
  if (color === "green") return "#22c55e"
  return "#f59e0b"
}

function clampScore(score: number, max = 10): number {
  if (!Number.isFinite(score)) return 0
  return Math.max(0, Math.min(score, max))
}

function extractAiThreat(aiData: AnyRecord) {
  const finalAnalysis = aiData?.results?.final_synthesis?.analysis
  const aiThreatLevel = String(finalAnalysis?.overall_threat_level || "Unknown")
  const confidenceRaw = Number(finalAnalysis?.threat_confidence_score ?? aiData?.threat_confidence_score ?? 0)
  const confidence = Number.isFinite(confidenceRaw) ? Math.max(0, Math.min(confidenceRaw, 100)) : 0

  let normalizedThreatScore = confidence / 10
  const level = aiThreatLevel.toLowerCase()

  if (confidence === 0) {
    if (level.includes("critical")) normalizedThreatScore = 9
    else if (level.includes("high")) normalizedThreatScore = 7.5
    else if (level.includes("medium")) normalizedThreatScore = 5
    else if (level.includes("low")) normalizedThreatScore = 2.5
    else normalizedThreatScore = 0
  }

  return {
    aiThreatLevel,
    confidence,
    normalizedThreatScore: clampScore(normalizedThreatScore),
  }
}

function formatDate(date?: string) {
  if (!date) return "Unknown"
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return "Unknown"
  return d.toLocaleString()
}

function scoreLabel(score: number) {
  if (score >= 8) return "Critical"
  if (score >= 6) return "High"
  if (score >= 4) return "Medium"
  if (score >= 2) return "Low"
  return "Clean"
}

function ScoreRing({ score, max = 10, label, subtitle }: { score: number; max?: number; label: string; subtitle?: string }) {
  const clamped = clampScore(score, max)
  const percent = (clamped / max) * 100
  const colorType = getScoreColor(clamped)
  const ringColor = getRingColorClass(colorType)

  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4">
      <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3">{label}</p>
      <div className="flex items-center gap-4">
        <div
          className="relative h-24 w-24 rounded-full"
          style={{
            background: `conic-gradient(${ringColor} ${percent}%, rgba(255,255,255,0.08) ${percent}% 100%)`,
          }}
        >
          <div className="absolute inset-[8px] rounded-full bg-[#0a0a0a] border border-[#1f1f1f] flex items-center justify-center">
            <div className="text-center">
              <div className="text-xl font-bold text-white">{clamped.toFixed(1)}</div>
              <div className="text-[10px] text-muted-foreground">/ {max}</div>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-base font-semibold text-white">{scoreLabel(clamped)} Risk</p>
          <p className="text-sm text-muted-foreground">{subtitle || "Threat score"}</p>
          <div className="h-1.5 w-36 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: ringColor }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[#1a1a1a] bg-black/20 p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex items-center justify-center h-6 w-6 rounded-md border border-slate-400/20 bg-slate-400/10 text-slate-200">
          {icon}
        </span>
        <span className="text-xs uppercase tracking-wider text-slate-300">{label}</span>
      </div>
      <p className="text-2xl font-semibold text-white">{value}</p>
    </div>
  )
}

function PreviewListCard({ title, items, accent }: { title: string; items: string[]; accent: string }) {
  return (
    <div className="rounded-lg border border-[#1a1a1a] bg-black/20 p-3">
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{title}</p>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">No entries in this run.</p>
      ) : (
        <div className="space-y-1.5">
          {items.map((item, idx) => (
            <div key={idx} className="text-xs flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />
              <span className="text-foreground/90 break-all">{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function OverviewDashboard({
  combinedAnalysis,
  fileHashes,
  malscore,
  capeData,
  parsedData,
  aiData,
  onCopyJson,
  copied,
  onDownload,
}: OverviewDashboardProps) {
  const sandboxScore = clampScore(Number(malscore || capeData?.malscore || 0))
  const aiThreat = useMemo(() => extractAiThreat(aiData), [aiData])

  const capeMetrics = useMemo(() => {
    const summary = capeData?.behavior?.summary || {}
    return {
      processes: capeData?.behavior?.processes?.length || 0,
      signatures: capeData?.signatures?.length || 0,
      droppedFiles: capeData?.dropped?.length || 0,
      registryKeys: summary.keys?.length || 0,
      commands: summary.executed_commands?.length || 0,
      mutexes: summary.mutexes?.length || 0,
      writeFiles: summary.write_files?.length || 0,
      deleteFiles: summary.delete_files?.length || 0,
      ttps: capeData?.ttps?.length || 0,
      networkArtifacts: Object.keys(capeData?.network || {}).length || 0,
      timeout: Boolean(capeData?.info?.timeout),
      malstatus: String(capeData?.malstatus || "Unknown"),
      duration: Number(capeData?.info?.duration || 0),
    }
  }, [capeData])

  const aiInsights = useMemo(() => {
    const finalSummary = aiData?.results?.final_synthesis?.analysis?.report?.executive_summary
    const behaviorObs = aiData?.results?.behavior_analysis?.analysis?.ai_insights_summary?.key_observations?.[0]
    const memoryRisk = aiData?.results?.memory_analysis?.analysis?.process_memory_analysis?.filter(
      (p: AnyRecord) => p?.memory_forensic_indicators?.process_risk_profile === "High Risk"
    ).length || 0

    return [
      finalSummary ? { title: "Executive AI Summary", description: finalSummary } : null,
      behaviorObs ? { title: "Behavior Highlight", description: behaviorObs } : null,
      memoryRisk > 0
        ? { title: "Memory Forensics", description: `${memoryRisk} high-risk processes flagged by AI memory analysis.` }
        : null,
    ].filter(Boolean) as Array<{ title: string; description: string }>
  }, [aiData])

  const behaviorSignals = useMemo(() => {
    const summary = capeData?.behavior?.summary || {}
    return {
      package: String(capeData?.info?.package || "unknown"),
      route: String(capeData?.info?.route || "unknown"),
      timeout: Boolean(capeData?.info?.timeout),
      started: String(capeData?.info?.started || ""),
      ended: String(capeData?.info?.ended || ""),
      commands: (summary.executed_commands || []).slice(0, 6),
      written: (summary.write_files || []).slice(0, 6),
      deleted: (summary.delete_files || []).slice(0, 6),
      registry: (summary.keys || []).slice(0, 6),
      services: (summary.started_services || []).slice(0, 6),
      debugErrors: (capeData?.debug?.errors || []).slice(0, 4),
    }
  }, [capeData])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary mb-1">Overview Intelligence</p>
          <h2 className="text-2xl font-semibold text-white">Sandbox + AI Unified View</h2>
          <p className="text-sm text-muted-foreground mt-1">
            This overview intentionally uses sandbox and AI outputs only to avoid duplicated telemetry-derived signals.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {onCopyJson && (
            <button
              onClick={onCopyJson}
              className="px-3 py-1.5 border border-[#1a1a1a] rounded-lg hover:bg-muted/20 transition-colors flex items-center gap-2 text-sm"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? "Copied" : "Copy JSON"}
            </button>
          )}
          {onDownload && (
            <button
              onClick={() => onDownload("json")}
              className="px-3 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/20 transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          )}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ScoreRing
            score={sandboxScore}
            label="Sandbox Threat Score"
            subtitle={`Sandbox verdict: ${capeMetrics.malstatus}${capeMetrics.timeout ? " (analysis timeout)" : ""}`}
          />

          <ScoreRing
            score={aiThreat.normalizedThreatScore}
            label="AI Threat Score"
            subtitle={`AI level: ${aiThreat.aiThreatLevel} • confidence ${aiThreat.confidence.toFixed(1)}%`}
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Sandbox Activity Metrics</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <MetricTile icon={<Shield className="w-3.5 h-3.5" />} label="Signatures" value={capeMetrics.signatures} />
              <MetricTile icon={<File className="w-3.5 h-3.5" />} label="Processes" value={capeMetrics.processes} />
              <MetricTile icon={<Folder className="w-3.5 h-3.5" />} label="Dropped Files" value={capeMetrics.droppedFiles} />
              <MetricTile icon={<Key className="w-3.5 h-3.5" />} label="Registry Keys" value={capeMetrics.registryKeys} />
              <MetricTile icon={<Terminal className="w-3.5 h-3.5" />} label="Commands" value={capeMetrics.commands} />
              <MetricTile icon={<Network className="w-3.5 h-3.5" />} label="Network Artifacts" value={capeMetrics.networkArtifacts} />
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="rounded-lg border border-[#1a1a1a] p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Mutexes</p>
                <p className="text-white font-semibold mt-1">{capeMetrics.mutexes}</p>
              </div>
              <div className="rounded-lg border border-[#1a1a1a] p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Write Files</p>
                <p className="text-white font-semibold mt-1">{capeMetrics.writeFiles}</p>
              </div>
              <div className="rounded-lg border border-[#1a1a1a] p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Delete Files</p>
                <p className="text-white font-semibold mt-1">{capeMetrics.deleteFiles}</p>
              </div>
              <div className="rounded-lg border border-[#1a1a1a] p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">MITRE Mappings</p>
                <p className="text-white font-semibold mt-1">{capeMetrics.ttps}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileCode className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Execution & Behavior Signals</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              High-value behavior extracted from sandbox runtime output for quick triage.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
              <div className="rounded-lg border border-[#1a1a1a] p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Package</p>
                <p className="text-white font-semibold mt-1 break-all">{behaviorSignals.package}</p>
              </div>
              <div className="rounded-lg border border-[#1a1a1a] p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Route</p>
                <p className="text-white font-semibold mt-1 break-all">{behaviorSignals.route}</p>
              </div>
              <div className="rounded-lg border border-[#1a1a1a] p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Started</p>
                <p className="text-white font-semibold mt-1">{behaviorSignals.started || "Unknown"}</p>
              </div>
              <div className="rounded-lg border border-[#1a1a1a] p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Ended</p>
                <p className="text-white font-semibold mt-1">{behaviorSignals.ended || "Unknown"}</p>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-2 text-xs">
              {behaviorSignals.timeout ? (
                <span className="px-2 py-1 rounded-md bg-red-500/15 text-red-400 border border-red-500/30">Execution Timeout Observed</span>
              ) : (
                <span className="px-2 py-1 rounded-md bg-green-500/15 text-green-400 border border-green-500/30">Execution Completed in Time</span>
              )}
              {behaviorSignals.debugErrors.length > 0 && (
                <span className="px-2 py-1 rounded-md bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
                  {behaviorSignals.debugErrors.length} debug errors logged
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <PreviewListCard title="Executed Commands" items={behaviorSignals.commands} accent="#3b82f6" />
              <PreviewListCard title="Written Files" items={behaviorSignals.written} accent="#22c55e" />
              <PreviewListCard title="Registry Keys" items={behaviorSignals.registry} accent="#a855f7" />
              <PreviewListCard title="Started Services" items={behaviorSignals.services} accent="#f59e0b" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">AI Highlights</h3>
            </div>

            {aiInsights.length === 0 ? (
              <div className="text-sm text-muted-foreground border border-[#1a1a1a] rounded-lg p-3">
                AI insights are not available for this report yet.
              </div>
            ) : (
              <div className="space-y-3">
                {aiInsights.map((insight, idx) => (
                  <div key={idx} className="rounded-lg border border-[#1a1a1a] bg-black/20 p-3">
                    <p className="text-xs uppercase tracking-wider text-primary mb-1">{insight.title}</p>
                    <p className="text-sm text-foreground/90">{insight.description}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 border-t border-[#1a1a1a] pt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-[#1a1a1a] p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">AI Level</p>
                <p className="text-white font-semibold mt-1">{aiThreat.aiThreatLevel}</p>
              </div>
              <div className="rounded-lg border border-[#1a1a1a] p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Confidence</p>
                <p className="text-white font-semibold mt-1">{aiThreat.confidence.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Report Identity</h3>
            </div>

            <div className="space-y-3 text-sm">
              <div className="rounded-lg border border-[#1a1a1a] p-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Filename</p>
                <p className="text-white mt-1 break-all">{fileHashes?.filename || combinedAnalysis?.filename || "Unknown"}</p>
              </div>

              <div className="rounded-lg border border-[#1a1a1a] p-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Analysis Date</p>
                <p className="text-white mt-1">{formatDate(combinedAnalysis?.created_at || capeData?.info?.started)}</p>
              </div>

              <div className="rounded-lg border border-[#1a1a1a] p-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Engine</p>
                <p className="text-white mt-1">{capeData?.info?.version || "CAPE"}</p>
              </div>

              <div className="rounded-lg border border-[#1a1a1a] p-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Run Duration</p>
                <p className="text-white mt-1">{capeMetrics.duration ? `${capeMetrics.duration}s` : "Unknown"}</p>
              </div>
            </div>

            {(fileHashes?.sha256 || capeData?.target?.file?.sha256) && (
              <div className="mt-4 rounded-lg border border-[#1a1a1a] p-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">SHA256</p>
                <code className="text-xs text-primary block mt-1 break-all">
                  {fileHashes?.sha256 || capeData?.target?.file?.sha256}
                </code>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
