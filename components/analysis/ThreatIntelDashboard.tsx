"use client"

import { useCallback, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Brain,
  CheckCircle,
  Copy,
  Database,
  ExternalLink,
  FileCode,
  FileText,
  Globe,
  Hash,
  Play,
  RefreshCw,
  Search,
  Shield,
  XCircle,
  ChevronDown,
  ChevronUp,
  Tag,
  Radar,
} from "lucide-react"
import { apiService } from "@/services/api/api.service"

interface FileHashes {
  md5: string
  sha1: string
  sha256: string
  sha512?: string
  filename: string
}

type ServiceKey = "virustotal" | "malwarebazaar" | "hybridanalysis" | "alienvault"
type ScanStatus = "idle" | "loading" | "complete" | "error"
type ThreatTone = "red" | "amber" | "green" | "slate"

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

const SERVICE_CFG: Record<
  ServiceKey,
  {
    label: string
    color: string
    icon: React.ReactNode
    call: (hash: string) => Promise<any>
  }
> = {
  virustotal: {
    label: "VirusTotal",
    color: "#60a5fa",
    icon: <Shield className="w-4 h-4" />,
    call: (hash) =>
      apiService.scanVirusTotal({ indicator: hash, type: "hash", include_relationships: true }),
  },
  malwarebazaar: {
    label: "MalwareBazaar",
    color: "#a855f7",
    icon: <Database className="w-4 h-4" />,
    call: (hash) =>
      apiService.searchMalwareBazaar({ query: hash, type: "hash" }),
  },
  hybridanalysis: {
    label: "Hybrid Analysis",
    color: "#f59e0b",
    icon: <Brain className="w-4 h-4" />,
    call: (hash) =>
      apiService.scanHybridAnalysis({ indicator: hash, type: "hash", include_summary: true }),
  },
  alienvault: {
    label: "AlienVault OTX",
    color: "#22c55e",
    icon: <Globe className="w-4 h-4" />,
    call: (hash) =>
      apiService.scanAlienVaultOTX({ indicator: hash, type: "hash" }),
  },
}

const INITIAL: ServicesState = {
  virustotal: { status: "idle", data: null },
  malwarebazaar: { status: "idle", data: null },
  hybridanalysis: { status: "idle", data: null },
  alienvault: { status: "idle", data: null },
}

function clamp(value: number, min = 0, max = 10): number {
  if (!Number.isFinite(value)) return 0
  return Math.max(min, Math.min(value, max))
}

function formatDate(value?: string) {
  if (!value) return "N/A"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString()
}

function formatBytes(bytes?: number | string) {
  const n = typeof bytes === "string" ? Number(bytes) : bytes
  if (!n || Number.isNaN(n)) return "N/A"
  const units = ["B", "KB", "MB", "GB"]
  const idx = Math.min(Math.floor(Math.log(n) / Math.log(1024)), units.length - 1)
  const size = n / Math.pow(1024, idx)
  return `${size.toFixed(size >= 100 ? 0 : 1)} ${units[idx]}`
}

function normalizeThreat(raw?: string) {
  const v = String(raw || "unknown").toLowerCase()
  if (v.includes("malicious") || v.includes("malware") || v.includes("high") || v.includes("critical")) {
    return { label: "Malicious", tone: "red" as ThreatTone, score: 8 }
  }
  if (v.includes("suspicious") || v.includes("medium")) {
    return { label: "Suspicious", tone: "amber" as ThreatTone, score: 5.5 }
  }
  if (v.includes("clean") || v.includes("harmless") || v.includes("benign") || v.includes("no_threat") || v.includes("low")) {
    return { label: "Clean", tone: "green" as ThreatTone, score: 1.5 }
  }
  return { label: "Unknown", tone: "slate" as ThreatTone, score: 0 }
}

function toneClasses(tone: ThreatTone) {
  if (tone === "red") {
    return {
      text: "text-red-400",
      border: "border-red-500/30",
      bg: "bg-red-500/10",
      bar: "#ef4444",
    }
  }
  if (tone === "amber") {
    return {
      text: "text-amber-400",
      border: "border-amber-500/30",
      bg: "bg-amber-500/10",
      bar: "#f59e0b",
    }
  }
  if (tone === "green") {
    return {
      text: "text-green-400",
      border: "border-green-500/30",
      bg: "bg-green-500/10",
      bar: "#22c55e",
    }
  }
  return {
    text: "text-muted-foreground",
    border: "border-[#2a2a2a]",
    bg: "bg-muted/10",
    bar: "#64748b",
  }
}

function getServiceThreat(service: ServiceKey, data: any) {
  if (!data || !data.found) return normalizeThreat("clean")

  if (service === "virustotal") {
    const malicious = Number(data?.detection_stats?.malicious || 0)
    const suspicious = Number(data?.detection_stats?.suspicious || 0)
    if (malicious > 0) return normalizeThreat("malicious")
    if (suspicious > 0) return normalizeThreat("suspicious")
    return normalizeThreat("clean")
  }

  if (service === "hybridanalysis") {
    return normalizeThreat(data?.verdict || data?.threat_level || "unknown")
  }

  if (service === "alienvault") {
    return normalizeThreat(data?.threat_level || "unknown")
  }

  if (service === "malwarebazaar") {
    const signature = String(data?.samples?.[0]?.signature || "").toLowerCase()
    if (signature) return normalizeThreat("malicious")
    return normalizeThreat("unknown")
  }

  return normalizeThreat("unknown")
}

function CopyableHash({ label, value }: { label: string; value?: string }) {
  if (!value) return null

  return (
    <div className="flex items-center gap-2 border border-[#1a1a1a] bg-black/20 rounded-md px-2 py-1.5">
      <span className="text-[10px] text-muted-foreground w-12 shrink-0">{label}</span>
      <code className="text-xs text-primary truncate flex-1">{value}</code>
      <button
        onClick={() => navigator.clipboard.writeText(value)}
        className="p-1 rounded hover:bg-muted/20 transition-colors"
      >
        <Copy className="w-3 h-3" />
      </button>
    </div>
  )
}

function PillList({ items, tone }: { items: string[]; tone: ThreatTone }) {
  if (!items.length) return null
  const t = toneClasses(tone)
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.slice(0, 16).map((item, idx) => (
        <span key={idx} className={`text-xs px-2 py-0.5 rounded-md border ${t.bg} ${t.text} ${t.border}`}>
          {item}
        </span>
      ))}
    </div>
  )
}

function VTDetails({ data }: { data: any }) {
  const stats = data?.detection_stats || {}
  const fi = data?.file_info || {}
  const total = Math.max(Number(stats?.total || 0), 1)

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Engine Detections</p>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="rounded-md border border-red-500/25 bg-red-500/10 p-2">
            <div className="text-lg font-semibold text-red-400">{stats?.malicious || 0}</div>
            <div className="text-[10px] text-red-300">Malicious</div>
          </div>
          <div className="rounded-md border border-amber-500/25 bg-amber-500/10 p-2">
            <div className="text-lg font-semibold text-amber-400">{stats?.suspicious || 0}</div>
            <div className="text-[10px] text-amber-300">Suspicious</div>
          </div>
          <div className="rounded-md border border-green-500/25 bg-green-500/10 p-2">
            <div className="text-lg font-semibold text-green-400">{stats?.harmless || 0}</div>
            <div className="text-[10px] text-green-300">Harmless</div>
          </div>
          <div className="rounded-md border border-[#2a2a2a] bg-muted/10 p-2">
            <div className="text-lg font-semibold text-muted-foreground">{stats?.undetected || 0}</div>
            <div className="text-[10px] text-muted-foreground">Undetected</div>
          </div>
        </div>

        <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden flex">
          {!!stats?.malicious && <div style={{ width: `${(stats.malicious / total) * 100}%`, background: "#ef4444" }} />}
          {!!stats?.suspicious && <div style={{ width: `${(stats.suspicious / total) * 100}%`, background: "#f59e0b" }} />}
          {!!stats?.harmless && <div style={{ width: `${(stats.harmless / total) * 100}%`, background: "#22c55e" }} />}
        </div>
      </div>

      <div className="rounded-md border border-[#1a1a1a] bg-black/20 p-3 space-y-1.5 text-xs">
        <div className="flex justify-between gap-3"><span className="text-muted-foreground">Name</span><span className="text-foreground break-all text-right">{fi?.filename || "N/A"}</span></div>
        <div className="flex justify-between gap-3"><span className="text-muted-foreground">Type</span><span className="text-foreground text-right">{fi?.type_description || "N/A"}</span></div>
        <div className="flex justify-between gap-3"><span className="text-muted-foreground">Size</span><span className="text-foreground text-right">{formatBytes(fi?.size)}</span></div>
        <div className="flex justify-between gap-3"><span className="text-muted-foreground">First Seen</span><span className="text-foreground text-right">{formatDate(fi?.first_seen)}</span></div>
      </div>

      <PillList items={fi?.tags || []} tone="amber" />

      {data?.vt_url && (
        <a href={data.vt_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 inline-flex items-center gap-1">
          <ExternalLink className="w-3 h-3" /> Open VirusTotal Report
        </a>
      )}
    </div>
  )
}

function MBDetails({ data }: { data: any }) {
  const sample = data?.samples?.[0] || {}

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-md border border-[#1a1a1a] bg-black/20 p-2"><span className="text-muted-foreground block mb-1">Filename</span><span className="text-foreground break-all">{sample?.filename || "N/A"}</span></div>
        <div className="rounded-md border border-[#1a1a1a] bg-black/20 p-2"><span className="text-muted-foreground block mb-1">File Type</span><span className="text-foreground">{sample?.file_type || "N/A"}</span></div>
        <div className="rounded-md border border-[#1a1a1a] bg-black/20 p-2"><span className="text-muted-foreground block mb-1">Size</span><span className="text-foreground">{formatBytes(sample?.file_size)}</span></div>
        <div className="rounded-md border border-[#1a1a1a] bg-black/20 p-2"><span className="text-muted-foreground block mb-1">First Seen</span><span className="text-foreground">{formatDate(sample?.first_seen)}</span></div>
      </div>

      {sample?.signature && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-300">
          Signature: <span className="text-red-200 font-medium">{sample.signature}</span>
        </div>
      )}

      <PillList items={sample?.tags || []} tone="amber" />

      <div className="space-y-1">
        <CopyableHash label="SHA256" value={sample?.sha256} />
        <CopyableHash label="SHA1" value={sample?.sha1} />
        <CopyableHash label="MD5" value={sample?.md5} />
      </div>

      {sample?.sha256 && (
        <a href={`https://bazaar.abuse.ch/sample/${sample.sha256}/`} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-400 hover:text-purple-300 inline-flex items-center gap-1">
          <ExternalLink className="w-3 h-3" /> Open MalwareBazaar Entry
        </a>
      )}
    </div>
  )
}

function HADetails({ data }: { data: any }) {
  const threatScore = Number(data?.threat_score || 0)
  const bar = threatScore >= 70 ? "#ef4444" : threatScore >= 40 ? "#f59e0b" : "#22c55e"

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Threat Score</p>
        <div className="flex items-center gap-3">
          <div className="h-2 rounded-full bg-white/5 flex-1 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, threatScore))}%`, background: bar }} />
          </div>
          <span className="text-sm font-semibold text-white w-10 text-right">{threatScore}</span>
        </div>
      </div>

      <div className="rounded-md border border-[#1a1a1a] bg-black/20 p-3 space-y-1.5 text-xs">
        <div className="flex justify-between gap-3"><span className="text-muted-foreground">Verdict</span><span className="text-foreground">{data?.verdict || data?.threat_level || "N/A"}</span></div>
        <div className="flex justify-between gap-3"><span className="text-muted-foreground">Family</span><span className="text-foreground">{data?.vx_family || "N/A"}</span></div>
        <div className="flex justify-between gap-3"><span className="text-muted-foreground">File</span><span className="text-foreground break-all text-right">{data?.last_file_name || "N/A"}</span></div>
        <div className="flex justify-between gap-3"><span className="text-muted-foreground">Type</span><span className="text-foreground">{data?.type || "N/A"}</span></div>
        <div className="flex justify-between gap-3"><span className="text-muted-foreground">Submitted</span><span className="text-foreground">{formatDate(data?.submitted_at)}</span></div>
      </div>

      <PillList items={data?.tags || []} tone="amber" />

      {data?.ha_url && (
        <a href={data.ha_url} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:text-amber-300 inline-flex items-center gap-1">
          <ExternalLink className="w-3 h-3" /> Open Hybrid Analysis Report
        </a>
      )}
    </div>
  )
}

function OTXDetails({ data }: { data: any }) {
  const nestedAnalysis = data?.analysis?.analysis
  const infoResults = nestedAnalysis?.info?.results || {}
  const plugins = nestedAnalysis?.plugins || {}

  const pluginSignals: Array<{ name: string; alert?: string; detection?: string }> = Object.entries(plugins).map(
    ([name, plugin]: [string, any]) => {
      const alerts = plugin?.results?.alerts
      const detection = plugin?.results?.detection
      const alert = Array.isArray(alerts) && alerts.length > 0 ? String(alerts[0]) : undefined
      return { name, alert, detection }
    }
  )

  const familyTags = data?.malware_families || []
  const tags = data?.tags || []
  const refs = data?.references || []

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-md border border-[#1a1a1a] bg-black/20 p-2"><span className="text-muted-foreground block mb-1">Pulse Count</span><span className="text-foreground">{data?.pulse_count ?? 0}</span></div>
        <div className="rounded-md border border-[#1a1a1a] bg-black/20 p-2"><span className="text-muted-foreground block mb-1">Threat Level</span><span className="text-foreground">{String(data?.threat_level || "unknown")}</span></div>
        <div className="rounded-md border border-[#1a1a1a] bg-black/20 p-2"><span className="text-muted-foreground block mb-1">File Class</span><span className="text-foreground">{infoResults?.file_class || "N/A"}</span></div>
        <div className="rounded-md border border-[#1a1a1a] bg-black/20 p-2"><span className="text-muted-foreground block mb-1">File Size</span><span className="text-foreground">{formatBytes(infoResults?.filesize)}</span></div>
      </div>

      <div className="space-y-1">
        <CopyableHash label="SHA256" value={infoResults?.sha256 || data?.ioc} />
        <CopyableHash label="SHA1" value={infoResults?.sha1} />
        <CopyableHash label="MD5" value={infoResults?.md5} />
      </div>

      {pluginSignals.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Plugin Signals</p>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {pluginSignals.slice(0, 12).map((p, idx) => (
              <div key={idx} className="rounded-md border border-[#1a1a1a] bg-black/20 p-2 text-xs">
                <div className="text-foreground font-medium">{p.name}</div>
                {p.alert && <div className="text-amber-300 mt-0.5">{p.alert}</div>}
                {p.detection && <div className="text-red-300 mt-0.5">Detection: {p.detection}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {familyTags.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Malware Families</p>
          <PillList items={familyTags} tone="red" />
        </div>
      )}

      {tags.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Tags</p>
          <PillList items={tags} tone="green" />
        </div>
      )}

      {refs.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">References</p>
          <div className="space-y-1">
            {refs.slice(0, 8).map((r: string, idx: number) => (
              <div key={idx} className="text-xs rounded-md border border-[#1a1a1a] bg-black/20 p-1.5 text-foreground break-all">
                {r}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-[11px] text-muted-foreground">Last Update: {formatDate(data?.timestamp)}</div>
    </div>
  )
}

function ServiceResult({ sk, data }: { sk: ServiceKey; data: any }) {
  if (!data?.found) {
    return (
      <div className="text-center py-8">
        <div className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-2">
          <Search className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">Hash not found</p>
        <p className="text-xs text-muted-foreground mt-1">No record in {SERVICE_CFG[sk].label} for this indicator.</p>
      </div>
    )
  }

  if (sk === "virustotal") return <VTDetails data={data} />
  if (sk === "malwarebazaar") return <MBDetails data={data} />
  if (sk === "hybridanalysis") return <HADetails data={data} />
  return <OTXDetails data={data} />
}

function ServiceCard({
  sk,
  state,
  expanded,
  onExpand,
  onRun,
}: {
  sk: ServiceKey
  state: ServiceState
  expanded: boolean
  onExpand: (open: boolean) => void
  onRun: () => void
}) {
  const cfg = SERVICE_CFG[sk]
  const hasResult = state.status === "complete" || state.status === "error"
  const threat = state.status === "complete" ? getServiceThreat(sk, state.data) : normalizeThreat("unknown")
  const tone = toneClasses(threat.tone)

  return (
    <div className={`rounded-xl border bg-[#0d0d0d] overflow-hidden transition-colors ${hasResult ? tone.border : "border-[#1a1a1a]"}`}>
      <div className="p-4 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-black/20" style={{ color: cfg.color }}>{cfg.icon}</div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{cfg.label}</p>
          <div className="mt-1 flex items-center gap-2">
            {state.status === "idle" && <span className="text-xs text-muted-foreground">Not scanned</span>}
            {state.status === "loading" && (
              <span className="text-xs text-blue-400 inline-flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" /> Scanning...
              </span>
            )}
            {state.status === "error" && (
              <span className="text-xs text-red-400 inline-flex items-center gap-1">
                <XCircle className="w-3 h-3" /> Error
              </span>
            )}
            {state.status === "complete" && (
              <span className={`text-xs inline-flex items-center gap-1 ${tone.text}`}>
                {threat.label === "Malicious" && <AlertTriangle className="w-3 h-3" />}
                {threat.label === "Suspicious" && <AlertCircle className="w-3 h-3" />}
                {threat.label === "Clean" && <CheckCircle className="w-3 h-3" />}
                {(threat.label === "Unknown") && <Shield className="w-3 h-3" />}
                {state.data?.found ? threat.label : "Not Found"}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onRun}
            disabled={state.status === "loading"}
            className="px-3 py-1.5 rounded-lg border border-[#2a2a2a] text-xs hover:bg-muted/20 transition-colors disabled:opacity-50 inline-flex items-center gap-1"
          >
            {state.status === "loading" ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
            {state.status === "idle" ? "Scan" : "Re-scan"}
          </button>

          {hasResult && (
            <button onClick={() => onExpand(!expanded)} className="p-1.5 rounded-lg hover:bg-muted/20 transition-colors">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {hasResult && (
        <div className="h-1 w-full bg-white/5">
          <div className="h-full" style={{ width: `${(clamp(threat.score) / 10) * 100}%`, background: tone.bar }} />
        </div>
      )}

      <AnimatePresence initial={false}>
        {expanded && hasResult && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="border-t border-[#1a1a1a] overflow-hidden"
          >
            <div className="p-4">
              {state.status === "error" ? (
                <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-center">
                  <XCircle className="w-5 h-5 text-red-400 mx-auto mb-1.5" />
                  <p className="text-sm text-red-300 font-medium">Scan failed</p>
                  <p className="text-xs text-muted-foreground mt-1">{state.error || "Unknown error"}</p>
                </div>
              ) : (
                <ServiceResult sk={sk} data={state.data} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ThreatIntelDashboard({ fileHashes, onCopyJson, copied }: ThreatIntelDashboardProps) {
  const [services, setServices] = useState<ServicesState>(INITIAL)
  const [expanded, setExpanded] = useState<Record<ServiceKey, boolean>>({
    virustotal: false,
    malwarebazaar: false,
    hybridanalysis: false,
    alienvault: false,
  })

  const hash = fileHashes?.sha256 || fileHashes?.sha1 || fileHashes?.md5 || ""

  const runService = useCallback(
    async (key: ServiceKey) => {
      if (!hash) return

      setExpanded((prev) => ({ ...prev, [key]: false }))
      setServices((prev) => ({ ...prev, [key]: { status: "loading", data: null } }))

      try {
        const result = await SERVICE_CFG[key].call(hash)
        setServices((prev) => ({ ...prev, [key]: { status: "complete", data: result } }))
        setExpanded((prev) => ({ ...prev, [key]: true }))
      } catch (err) {
        setServices((prev) => ({
          ...prev,
          [key]: {
            status: "error",
            data: null,
            error: err instanceof Error ? err.message : "Scan failed",
          },
        }))
        setExpanded((prev) => ({ ...prev, [key]: true }))
      }
    },
    [hash]
  )

  const runAll = useCallback(() => {
    ;(Object.keys(SERVICE_CFG) as ServiceKey[]).forEach((key) => runService(key))
  }, [runService])

  const summary = useMemo(() => {
    const entries = Object.entries(services) as Array<[ServiceKey, ServiceState]>
    const scanned = entries.filter(([, s]) => s.status === "complete" || s.status === "error").length
    const loading = entries.filter(([, s]) => s.status === "loading").length
    const errors = entries.filter(([, s]) => s.status === "error").length

    const foundServices = entries.filter(([, s]) => s.status === "complete" && s.data?.found)
    const found = foundServices.length

    const threatScores = foundServices.map(([k, s]) => getServiceThreat(k, s.data).score)
    const avgThreat = threatScores.length > 0 ? threatScores.reduce((a, b) => a + b, 0) / threatScores.length : 0

    const malicious = foundServices.filter(([k, s]) => getServiceThreat(k, s.data).label === "Malicious").length
    const suspicious = foundServices.filter(([k, s]) => getServiceThreat(k, s.data).label === "Suspicious").length
    const clean = foundServices.filter(([k, s]) => getServiceThreat(k, s.data).label === "Clean").length

    return { scanned, loading, errors, found, avgThreat, malicious, suspicious, clean }
  }, [services])

  if (!fileHashes) {
    return (
      <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-8 text-center">
        <Shield className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">No file hashes available for threat intelligence lookup</p>
      </div>
    )
  }

  const anyLoading = summary.loading > 0
  const avgTone = normalizeThreat(summary.avgThreat >= 6 ? "malicious" : summary.avgThreat >= 4 ? "suspicious" : summary.avgThreat > 0 ? "clean" : "unknown")
  const avgToneClass = toneClasses(avgTone.tone)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary mb-1">Threat Intel Command</p>
          <h2 className="text-2xl font-semibold text-white">Multi-Source Intelligence Fusion</h2>
          <p className="text-sm text-muted-foreground mt-1">VirusTotal, MalwareBazaar, Hybrid Analysis, and AlienVault OTX in one triage surface.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={runAll}
            disabled={anyLoading}
            className="px-3 py-1.5 rounded-lg bg-primary text-black font-semibold hover:bg-primary/90 transition-colors flex items-center gap-1.5 text-sm disabled:opacity-50"
          >
            {anyLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            {anyLoading ? "Scanning all..." : "Scan All"}
          </button>

          {onCopyJson && (
            <button
              onClick={onCopyJson}
              className="px-3 py-1.5 border border-[#1a1a1a] rounded-lg hover:bg-muted/20 transition-colors flex items-center gap-1.5 text-sm"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? "Copied" : "Copy JSON"}
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Hash className="w-3.5 h-3.5 text-muted-foreground" />
          <code className="text-xs text-primary truncate">{hash}</code>
          <button onClick={() => navigator.clipboard.writeText(hash)} className="p-1 rounded hover:bg-muted/20 transition-colors ml-auto">
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          <div className="rounded-lg border border-[#1a1a1a] bg-black/20 p-2 text-center">
            <p className="text-lg font-semibold text-white">{summary.scanned}/4</p>
            <p className="text-[10px] text-muted-foreground uppercase">Scanned</p>
          </div>
          <div className="rounded-lg border border-[#1a1a1a] bg-black/20 p-2 text-center">
            <p className="text-lg font-semibold text-white">{summary.found}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Found</p>
          </div>
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-center">
            <p className="text-lg font-semibold text-red-400">{summary.malicious}</p>
            <p className="text-[10px] text-red-300 uppercase">Malicious</p>
          </div>
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-center">
            <p className="text-lg font-semibold text-amber-400">{summary.suspicious}</p>
            <p className="text-[10px] text-amber-300 uppercase">Suspicious</p>
          </div>
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-2 text-center">
            <p className="text-lg font-semibold text-green-400">{summary.clean}</p>
            <p className="text-[10px] text-green-300 uppercase">Clean</p>
          </div>
          <div className="rounded-lg border border-[#1a1a1a] bg-black/20 p-2 text-center">
            <p className="text-lg font-semibold text-white">{summary.errors}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Errors</p>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground uppercase tracking-wider inline-flex items-center gap-1"><Radar className="w-3 h-3" /> Avg Threat</span>
            <span className={`${avgToneClass.text} font-semibold`}>{summary.avgThreat.toFixed(1)} / 10</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${(clamp(summary.avgThreat) / 10) * 100}%`, background: avgToneClass.bar }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(Object.keys(SERVICE_CFG) as ServiceKey[]).map((sk) => (
          <ServiceCard
            key={sk}
            sk={sk}
            state={services[sk]}
            expanded={expanded[sk]}
            onExpand={(open) => setExpanded((prev) => ({ ...prev, [sk]: open }))}
            onRun={() => runService(sk)}
          />
        ))}
      </div>
    </div>
  )
}
