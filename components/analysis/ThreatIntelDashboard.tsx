"use client"

import { useState, useCallback } from "react"
import {
  Shield, AlertTriangle, CheckCircle, XCircle, Globe,
  Database, Brain, RefreshCw, ChevronDown, ChevronUp,
  Copy, ExternalLink, FileText, Hash, Tag,
  Activity, Bug, AlertCircle, Play, Search,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { apiService } from "@/services/api/api.service"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface FileHashes {
  md5: string
  sha1: string
  sha256: string
  sha512?: string
  filename: string
}

type ServiceKey = "virustotal" | "malwarebazaar" | "hybridanalysis" | "alienvault"
type ScanStatus = "idle" | "loading" | "complete" | "error"

interface ServiceState {
  status: ScanStatus
  data: any
  error?: string
}

type ServicesState = Record<ServiceKey, ServiceState>

interface ThreatIntelDashboardProps {
  fileHashes: FileHashes | null
  onCopyJson?: () => void
  copied?: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Service config
// ─────────────────────────────────────────────────────────────────────────────

const SERVICE_CFG: Record<
  ServiceKey,
  {
    label: string
    color: string        // text colour class
    ringColor: string    // ring/border accent
    icon: React.ReactNode
    call: (hash: string) => Promise<any>
  }
> = {
  virustotal: {
    label: "VirusTotal",
    color: "text-blue-400",
    ringColor: "border-blue-400/30",
    icon: <Shield className="w-4 h-4" />,
    call: (hash) =>
      apiService.scanVirusTotal({ indicator: hash, type: "hash", include_relationships: true }),
  },
  malwarebazaar: {
    label: "MalwareBazaar",
    color: "text-purple-400",
    ringColor: "border-purple-400/30",
    icon: <Database className="w-4 h-4" />,
    call: (hash) =>
      apiService.searchMalwareBazaar({ query: hash, type: "hash" }),
  },
  hybridanalysis: {
    label: "Hybrid Analysis",
    color: "text-yellow-400",
    ringColor: "border-yellow-400/30",
    icon: <Brain className="w-4 h-4" />,
    call: (hash) =>
      apiService.scanHybridAnalysis({ indicator: hash, type: "hash", include_summary: true }),
  },
  alienvault: {
    label: "AlienVault OTX",
    color: "text-green-400",
    ringColor: "border-green-400/30",
    icon: <Globe className="w-4 h-4" />,
    call: (hash) =>
      apiService.scanAlienVaultOTX({ indicator: hash, type: "hash" }),
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const formatBytes = (bytes?: number) => {
  if (!bytes) return "N/A"
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`
}

const formatDate = (ds?: string) => {
  if (!ds) return "N/A"
  try {
    return new Date(ds).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    })
  } catch { return "N/A" }
}

const verdictStyle = (verdict?: string) => {
  if (!verdict) return { label: "Unknown", cls: "text-muted-foreground", bg: "bg-muted/10", icon: <Shield className="w-4 h-4" /> }
  const v = verdict.toLowerCase()
  if (v.includes("malicious") || v.includes("malware"))
    return { label: "Malicious", cls: "text-destructive", bg: "bg-destructive/10", icon: <AlertTriangle className="w-4 h-4 text-destructive" /> }
  if (v.includes("suspicious"))
    return { label: "Suspicious", cls: "text-amber-400", bg: "bg-amber-400/10", icon: <AlertCircle className="w-4 h-4 text-amber-400" /> }
  if (v.includes("clean") || v.includes("harmless") || v.includes("no_threat") || v.includes("benign"))
    return { label: "Clean", cls: "text-green-400", bg: "bg-green-400/10", icon: <CheckCircle className="w-4 h-4 text-green-400" /> }
  if (v.includes("no_specific_threat") || v.includes("no specific threat"))
    return { label: "No Threat", cls: "text-blue-400", bg: "bg-blue-400/10", icon: <Shield className="w-4 h-4 text-blue-400" /> }
  return { label: verdict, cls: "text-muted-foreground", bg: "bg-muted/10", icon: <Shield className="w-4 h-4" /> }
}

// ─────────────────────────────────────────────────────────────────────────────
// Small atoms
// ─────────────────────────────────────────────────────────────────────────────

function StatBox({ label, value, cls }: { label: string; value: number; cls: string }) {
  return (
    <div className={`p-2 border rounded-lg text-center ${cls}`}>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs">{label}</div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value == null || value === "") return null
  return (
    <div className="flex justify-between items-start gap-3">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-xs text-foreground text-right break-all">{value}</span>
    </div>
  )
}

function CopyHashRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="flex items-center gap-2 bg-muted/5 px-2 py-1.5 rounded group">
      <span className="text-xs text-muted-foreground w-12 shrink-0">{label}</span>
      <code className="text-xs font-mono text-foreground truncate flex-1">{value}</code>
      <button
        onClick={copy}
        className="shrink-0 p-1 rounded hover:bg-muted/20 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? <span className="text-xs text-green-400">✓</span> : <Copy className="w-3 h-3" />}
      </button>
    </div>
  )
}

function TagPills({ items, cls }: { items: string[]; cls: string }) {
  if (!items?.length) return null
  return (
    <div className="flex flex-wrap gap-1">
      {items.slice(0, 10).map((t, i) => (
        <span key={i} className={`px-2 py-0.5 rounded text-xs ${cls}`}>{t}</span>
      ))}
    </div>
  )
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
        {icon}{title}
      </h4>
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-service result panels
// ─────────────────────────────────────────────────────────────────────────────

function VTPanel({ data }: { data: any }) {
  const stats = data.detection_stats || {}
  const fi = data.file_info || {}
  const total = stats.total || 1

  return (
    <div className="space-y-4">
      {stats.total > 0 && (
        <Section icon={<Shield className="w-3 h-3" />} title="Detection Stats">
          <div className="grid grid-cols-4 gap-2">
            <StatBox label="Malicious"  value={stats.malicious  ?? 0} cls="bg-destructive/10 text-destructive border-destructive/20" />
            <StatBox label="Suspicious" value={stats.suspicious ?? 0} cls="bg-amber-400/10 text-amber-400 border-amber-400/20" />
            <StatBox label="Harmless"   value={stats.harmless   ?? 0} cls="bg-green-400/10 text-green-400 border-green-400/20" />
            <StatBox label="Undetected" value={stats.undetected ?? 0} cls="bg-muted/10 text-muted-foreground border-border" />
          </div>
          <div className="mt-2 h-1.5 bg-muted/20 rounded-full overflow-hidden flex">
            {stats.malicious  > 0 && <div className="bg-destructive h-full" style={{ width: `${(stats.malicious / total) * 100}%` }} />}
            {stats.suspicious > 0 && <div className="bg-amber-400 h-full"   style={{ width: `${(stats.suspicious / total) * 100}%` }} />}
            {stats.harmless   > 0 && <div className="bg-green-400 h-full"   style={{ width: `${(stats.harmless / total) * 100}%` }} />}
          </div>
          {stats.detection_ratio && (
            <p className="text-xs text-muted-foreground text-right mt-1">{stats.detection_ratio} engines flagged this file</p>
          )}
        </Section>
      )}

      {(fi.filename || fi.size || fi.type_description || fi.first_seen) && (
        <Section icon={<FileText className="w-3 h-3" />} title="File Info">
          <div className="space-y-1.5 bg-muted/5 rounded-lg p-3">
            <InfoRow label="Name"       value={fi.filename} />
            <InfoRow label="Size"       value={formatBytes(fi.size)} />
            <InfoRow label="Type"       value={fi.type_description} />
            <InfoRow label="First seen" value={formatDate(fi.first_seen)} />
            <InfoRow label="Reputation" value={fi.reputation} />
          </div>
        </Section>
      )}

      {fi.tags?.length > 0 && (
        <Section icon={<Tag className="w-3 h-3" />} title="Tags">
          <TagPills items={fi.tags} cls="bg-blue-400/10 text-blue-400" />
        </Section>
      )}

      {data.behavioral_indicators?.length > 0 && (
        <Section icon={<Activity className="w-3 h-3" />} title="Behavioral">
          <ul className="space-y-1">
            {data.behavioral_indicators.map((b: string, i: number) => (
              <li key={i} className="text-xs bg-muted/5 rounded px-2 py-1">• {b}</li>
            ))}
          </ul>
        </Section>
      )}

      {data.vt_url && (
        <a href={data.vt_url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
          <ExternalLink className="w-3 h-3" /> View full report on VirusTotal
        </a>
      )}
    </div>
  )
}

function MBPanel({ data }: { data: any }) {
  const samples: any[] = data.samples || []
  const p = samples[0] || {}

  return (
    <div className="space-y-4">
      <Section icon={<Database className="w-3 h-3" />} title="Sample Details">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-muted/5 p-2 rounded">
            <span className="text-xs text-muted-foreground block">Filename</span>
            <span className="text-xs font-medium break-all">{p.filename || "N/A"}</span>
          </div>
          <div className="bg-muted/5 p-2 rounded">
            <span className="text-xs text-muted-foreground block">Size</span>
            <span className="text-xs font-medium">{formatBytes(p.file_size)}</span>
          </div>
          <div className="bg-muted/5 p-2 rounded">
            <span className="text-xs text-muted-foreground block">File Type</span>
            <span className="text-xs font-medium">{p.file_type || "N/A"}</span>
          </div>
          <div className="bg-muted/5 p-2 rounded">
            <span className="text-xs text-muted-foreground block">First Seen</span>
            <span className="text-xs font-medium">{formatDate(p.first_seen)}</span>
          </div>
        </div>
      </Section>

      {p.signature && (
        <Section icon={<Shield className="w-3 h-3" />} title="Signature">
          <div className="bg-amber-400/10 text-amber-400 px-3 py-2 rounded-lg text-sm font-medium">
            {p.signature}
          </div>
        </Section>
      )}

      {p.tags?.length > 0 && (
        <Section icon={<Tag className="w-3 h-3" />} title="Tags">
          <TagPills items={p.tags} cls="bg-purple-400/10 text-purple-400" />
        </Section>
      )}

      {(p.sha256 || p.sha1 || p.md5) && (
        <Section icon={<Hash className="w-3 h-3" />} title="Hashes">
          <div className="space-y-1">
            {p.sha256 && <CopyHashRow label="SHA256" value={p.sha256} />}
            {p.sha1   && <CopyHashRow label="SHA1"   value={p.sha1} />}
            {p.md5    && <CopyHashRow label="MD5"    value={p.md5} />}
          </div>
        </Section>
      )}

      {data.total > 1 && (
        <p className="text-xs text-muted-foreground">
          +{data.total - 1} more sample{data.total > 2 ? "s" : ""} in database
        </p>
      )}

      {p.sha256 && (
        <a href={`https://bazaar.abuse.ch/sample/${p.sha256}/`} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300">
          <ExternalLink className="w-3 h-3" /> View on MalwareBazaar
        </a>
      )}
    </div>
  )
}

function HAPanel({ data }: { data: any }) {
  const vs = verdictStyle(data.verdict || data.threat_level)

  return (
    <div className="space-y-4">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${vs.bg} border-current/10`}>
        {vs.icon}
        <span className={`text-sm font-semibold ${vs.cls}`}>{vs.label}</span>
        {data.vx_family && (
          <span className="ml-auto text-xs text-muted-foreground">Family: {data.vx_family}</span>
        )}
      </div>

      {data.threat_score != null && (
        <Section icon={<Activity className="w-3 h-3" />} title="Threat Score">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-muted/20 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${data.threat_score >= 70 ? "bg-destructive" : data.threat_score >= 40 ? "bg-amber-400" : "bg-green-400"}`}
                style={{ width: `${data.threat_score}%` }}
              />
            </div>
            <span className="text-sm font-bold tabular-nums w-8 text-right">{data.threat_score}</span>
          </div>
        </Section>
      )}

      {(data.last_file_name || data.size || data.type) && (
        <Section icon={<FileText className="w-3 h-3" />} title="File Info">
          <div className="space-y-1.5 bg-muted/5 rounded-lg p-3">
            <InfoRow label="Name"         value={data.last_file_name} />
            <InfoRow label="Size"         value={formatBytes(data.size)} />
            <InfoRow label="Type"         value={data.type} />
            <InfoRow label="Architecture" value={data.architecture} />
            <InfoRow label="Submitted"    value={formatDate(data.submitted_at)} />
          </div>
        </Section>
      )}

      {data.tags?.length > 0 && (
        <Section icon={<Tag className="w-3 h-3" />} title="Tags">
          <TagPills items={data.tags} cls="bg-yellow-400/10 text-yellow-400" />
        </Section>
      )}

      {data.mitre_attcks?.length > 0 && (
        <Section icon={<AlertTriangle className="w-3 h-3" />} title="MITRE ATT&CK">
          <div className="space-y-1">
            {data.mitre_attcks.slice(0, 5).map((t: any, i: number) => (
              <div key={i} className="text-xs bg-muted/5 p-2 rounded flex gap-2">
                <span className="font-medium text-foreground">{t.technique}</span>
                <span className="text-muted-foreground ml-auto">{t.tactic}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {data.signatures?.length > 0 && (
        <Section icon={<Bug className="w-3 h-3" />} title="Signatures">
          <div className="space-y-1">
            {data.signatures.slice(0, 4).map((s: any, i: number) => (
              <div key={i} className="text-xs bg-muted/5 p-2 rounded">
                <span className="font-medium text-foreground">{s.name}</span>
                {s.threat_level_human && (
                  <span className="ml-2 text-muted-foreground">({s.threat_level_human})</span>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {data.ha_url && (
        <a href={data.ha_url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-yellow-400 hover:text-yellow-300">
          <ExternalLink className="w-3 h-3" /> View on Hybrid Analysis
        </a>
      )}
    </div>
  )
}

function OTXPanel({ data }: { data: any }) {
  const vs = verdictStyle(data.threat_level)

  return (
    <div className="space-y-4">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${vs.bg} border-current/10`}>
        {vs.icon}
        <span className={`text-sm font-semibold ${vs.cls}`}>{vs.label}</span>
        {data.pulse_count > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">{data.pulse_count} pulses</span>
        )}
      </div>

      {(data.geo?.country_name || data.geo?.asn) && (
        <Section icon={<Globe className="w-3 h-3" />} title="Network Info">
          <div className="space-y-1.5 bg-muted/5 rounded-lg p-3">
            <InfoRow label="Country" value={data.geo?.country_name} />
            <InfoRow label="City"    value={data.geo?.city} />
            <InfoRow label="ASN"     value={data.geo?.asn} />
          </div>
        </Section>
      )}

      {data.pulses?.length > 0 && (
        <Section icon={<Activity className="w-3 h-3" />} title="Top Pulses">
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {data.pulses.slice(0, 5).map((p: any, i: number) => (
              <div key={i} className="text-xs bg-muted/5 p-2 rounded">
                <div className="font-medium text-foreground line-clamp-1">{p.name}</div>
                {p.description && (
                  <div className="text-muted-foreground mt-0.5 line-clamp-2">{p.description}</div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {data.malware_samples?.length > 0 && (
        <Section icon={<Bug className="w-3 h-3" />} title="Malware Samples">
          <p className="text-xs text-muted-foreground">
            {data.malware_samples.length} associated sample{data.malware_samples.length !== 1 ? "s" : ""}
          </p>
        </Section>
      )}

      {data.passive_dns?.length > 0 && (
        <Section icon={<Globe className="w-3 h-3" />} title="Passive DNS">
          <div className="space-y-1">
            {data.passive_dns.slice(0, 4).map((d: any, i: number) => (
              <div key={i} className="text-xs bg-muted/5 p-1.5 rounded font-mono">
                {d.hostname || d.address || JSON.stringify(d)}
              </div>
            ))}
          </div>
        </Section>
      )}

      {data.otx_url && (
        <a href={data.otx_url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300">
          <ExternalLink className="w-3 h-3" /> View on AlienVault OTX
        </a>
      )}
    </div>
  )
}

function ResultPanel({ sk, data }: { sk: ServiceKey; data: any }) {
  if (!data?.found) {
    return (
      <div className="text-center py-8">
        <div className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-2">
          <Search className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">Not Found</p>
        <p className="text-xs text-muted-foreground mt-1">
          This hash was not found in the {SERVICE_CFG[sk].label} database
        </p>
      </div>
    )
  }
  if (sk === "virustotal")    return <VTPanel  data={data} />
  if (sk === "malwarebazaar") return <MBPanel  data={data} />
  if (sk === "hybridanalysis") return <HAPanel  data={data} />
  if (sk === "alienvault")    return <OTXPanel data={data} />
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// Service Card — auto-expands when scan completes
// ─────────────────────────────────────────────────────────────────────────────

function ServiceCard({
  sk,
  state,
  onRun,
}: {
  sk: ServiceKey
  state: ServiceState
  onRun: () => void
}) {
  const cfg = SERVICE_CFG[sk]
  const { status, data, error } = state

  // Auto-expand as soon as a result arrives; allow manual toggle after
  const [expanded, setExpanded] = useState(false)
  const hasResult = status === "complete" || status === "error"

  // Inline status badge
  const statusBadge = () => {
    if (status === "idle")    return <span className="text-xs text-muted-foreground">Not scanned</span>
    if (status === "loading") return <span className="text-xs text-blue-400 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" />Scanning…</span>
    if (status === "error")   return <span className="text-xs text-destructive flex items-center gap-1"><XCircle className="w-3 h-3" />Error</span>
    if (!data?.found)         return <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Not found</span>
    const vs = verdictStyle(data.verdict || data.threat_level)
    return <span className={`text-xs flex items-center gap-1 ${vs.cls}`}>{vs.icon}{vs.label}</span>
  }

  return (
    <div className={`glass border rounded-xl overflow-hidden transition-colors ${hasResult ? cfg.ringColor : "border-border"}`}>
      {/* Header row */}
      <div className="p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-muted/10 ${cfg.color}`}>{cfg.icon}</div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{cfg.label}</p>
          <div className="mt-0.5">{statusBadge()}</div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Scan / Re-scan */}
          <button
            onClick={onRun}
            disabled={status === "loading"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border
              disabled:opacity-50 disabled:cursor-not-allowed
              ${status === "idle"
                ? `${cfg.color} border-current/30 hover:bg-current/10`
                : "text-muted-foreground border-border hover:bg-muted/20"
              }`}
          >
            {status === "loading"
              ? <><RefreshCw className="w-3 h-3 animate-spin" />Scanning</>
              : status !== "idle"
              ? <><RefreshCw className="w-3 h-3" />Re-scan</>
              : <><Play className="w-3 h-3" />Scan</>
            }
          </button>

          {/* Expand / collapse — only after a result exists */}
          {hasResult && (
            <button
              onClick={() => setExpanded(v => !v)}
              className="p-1.5 hover:bg-muted/20 rounded-lg transition-colors"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Result panel — AnimatePresence handles enter/exit */}
      <AnimatePresence initial={false}>
        {hasResult && expanded && (
          <motion.div
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="border-t border-border overflow-hidden"
          >
            <div className="p-4">
              {status === "error" ? (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-center">
                  <XCircle className="w-6 h-6 text-destructive mx-auto mb-1.5" />
                  <p className="text-sm font-medium text-destructive">Scan failed</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{error}</p>
                </div>
              ) : (
                <ResultPanel sk={sk} data={data} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main dashboard
// ─────────────────────────────────────────────────────────────────────────────

const INITIAL: ServicesState = {
  virustotal:    { status: "idle", data: null },
  malwarebazaar: { status: "idle", data: null },
  hybridanalysis:{ status: "idle", data: null },
  alienvault:    { status: "idle", data: null },
}

export default function ThreatIntelDashboard({
  fileHashes,
  onCopyJson,
  copied,
}: ThreatIntelDashboardProps) {
  const [services, setServices] = useState<ServicesState>(INITIAL)
  // Track which cards have been auto-expanded so we manage their state cleanly
  const [expandedCards, setExpandedCards] = useState<Set<ServiceKey>>(new Set())

  const hash = fileHashes?.sha256 || fileHashes?.sha1 || fileHashes?.md5 || ""

  const runService = useCallback(
    async (key: ServiceKey) => {
      if (!hash) return

      // Close the panel while re-scanning
      setExpandedCards(prev => { const s = new Set(prev); s.delete(key); return s })
      setServices(prev => ({ ...prev, [key]: { status: "loading", data: null } }))

      try {
        const result = await SERVICE_CFG[key].call(hash)
        setServices(prev => ({ ...prev, [key]: { status: "complete", data: result } }))
        // Auto-expand on completion ✓
        setExpandedCards(prev => new Set(prev).add(key))
      } catch (err) {
        setServices(prev => ({
          ...prev,
          [key]: {
            status: "error",
            data: null,
            error: err instanceof Error ? err.message : "Scan failed",
          },
        }))
        // Auto-expand on error too so user sees the message ✓
        setExpandedCards(prev => new Set(prev).add(key))
      }
    },
    [hash],
  )

  const runAll = useCallback(() => {
    ;(Object.keys(SERVICE_CFG) as ServiceKey[]).forEach(k => runService(k))
  }, [runService])

  if (!fileHashes) {
    return (
      <div className="glass border border-border rounded-xl p-8 text-center">
        <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No file hashes available for threat intelligence lookup</p>
      </div>
    )
  }

  const completed  = Object.values(services).filter(s => s.status === "complete").length
  const threats    = Object.values(services).filter(s => s.data?.found && s.data?.threat_level !== "clean" && s.data?.threat_level !== "unknown").length
  const errors     = Object.values(services).filter(s => s.status === "error").length
  const anyLoading = Object.values(services).some(s => s.status === "loading")

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        

        <div className="flex items-center gap-2">
          <button
            onClick={runAll}
            disabled={anyLoading}
            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5 text-sm font-medium disabled:opacity-50"
          >
            {anyLoading
              ? <><RefreshCw className="w-3 h-3 animate-spin" />Scanning all…</>
              : <><Play className="w-3 h-3" />Scan All</>
            }
          </button>
          {onCopyJson && (
            <button
              onClick={onCopyJson}
              className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted/20 transition-colors flex items-center gap-1.5 text-sm"
            >
              <Copy className="w-3 h-3" />
              {copied ? "Copied!" : "Copy JSON"}
            </button>
          )}
        </div>
      </div>

      {/* ── Hash pill ── */}
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/5 border border-border rounded-lg overflow-hidden">
        <Hash className="w-3 h-3 text-muted-foreground shrink-0" />
        <code className="text-xs font-mono text-muted-foreground truncate flex-1">{hash}</code>
        <button
          onClick={() => navigator.clipboard.writeText(hash)}
          className="shrink-0 p-1 hover:bg-muted/20 rounded"
        >
          <Copy className="w-3 h-3" />
        </button>
      </div>

      {/* ── Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(Object.keys(SERVICE_CFG) as ServiceKey[]).map(key => (
          <ServiceCardWithExpand
            key={key}
            sk={key}
            state={services[key]}
            expanded={expandedCards.has(key)}
            setExpanded={(v) =>
              setExpandedCards(prev => {
                const s = new Set(prev)
                v ? s.add(key) : s.delete(key)
                return s
              })
            }
            onRun={() => runService(key)}
          />
        ))}
      </div>

      {/* ── Summary — shown only after ≥1 scan ── */}
      {completed > 0 && (
        <div className="glass border border-border rounded-xl p-4">
          <div className="grid grid-cols-3 gap-4 text-center divide-x divide-border">
            <div>
              <p className="text-2xl font-bold text-foreground">{completed}/4</p>
              <p className="text-xs text-muted-foreground mt-0.5">Sources scanned</p>
            </div>
            <div>
              <p className={`text-2xl font-bold ${threats > 0 ? "text-destructive" : "text-green-400"}`}>
                {threats}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Threats detected</p>
            </div>
            <div>
              <p className={`text-2xl font-bold ${errors > 0 ? "text-amber-400" : "text-foreground"}`}>
                {errors}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Scan errors</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Separate card component that receives expanded state from parent
// This is needed so parent can control auto-expand via expandedCards Set
function ServiceCardWithExpand({
  sk,
  state,
  expanded,
  setExpanded,
  onRun,
}: {
  sk: ServiceKey
  state: ServiceState
  expanded: boolean
  setExpanded: (v: boolean) => void
  onRun: () => void
}) {
  const cfg = SERVICE_CFG[sk]
  const { status, data, error } = state
  const hasResult = status === "complete" || status === "error"

  const statusBadge = () => {
    if (status === "idle")    return <span className="text-xs text-muted-foreground">Not scanned</span>
    if (status === "loading") return <span className="text-xs text-blue-400 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" />Scanning…</span>
    if (status === "error")   return <span className="text-xs text-destructive flex items-center gap-1"><XCircle className="w-3 h-3" />Error</span>
    if (!data?.found)         return <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Not found</span>
    const vs = verdictStyle(data.verdict || data.threat_level)
    return <span className={`text-xs flex items-center gap-1 ${vs.cls}`}>{vs.icon}{vs.label}</span>
  }

  return (
    <div className={`glass border rounded-xl overflow-hidden transition-colors ${hasResult ? cfg.ringColor : "border-border"}`}>
      <div className="p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-muted/10 ${cfg.color}`}>{cfg.icon}</div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{cfg.label}</p>
          <div className="mt-0.5">{statusBadge()}</div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onRun}
            disabled={status === "loading"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border
              disabled:opacity-50 disabled:cursor-not-allowed
              ${status === "idle"
                ? `${cfg.color} border-current/30 hover:bg-current/10`
                : "text-muted-foreground border-border hover:bg-muted/20"
              }`}
          >
            {status === "loading"
              ? <><RefreshCw className="w-3 h-3 animate-spin" />Scanning</>
              : status !== "idle"
              ? <><RefreshCw className="w-3 h-3" />Re-scan</>
              : <><Play className="w-3 h-3" />Scan</>
            }
          </button>

          {hasResult && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 hover:bg-muted/20 rounded-lg transition-colors"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {hasResult && expanded && (
          <motion.div
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="border-t border-border overflow-hidden"
          >
            <div className="p-4">
              {status === "error" ? (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-center">
                  <XCircle className="w-6 h-6 text-destructive mx-auto mb-1.5" />
                  <p className="text-sm font-medium text-destructive">Scan failed</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{error}</p>
                </div>
              ) : (
                <ResultPanel sk={sk} data={data} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}