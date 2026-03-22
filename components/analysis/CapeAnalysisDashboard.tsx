"use client"

import { useMemo, useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Activity,
  AlertTriangle,
  Copy,
  Cpu,
  Download,
  Eye,
  EyeOff,
  File,
  FileCode,
  FileJson,
  FileText,
  Folder,
  Globe,
  GitBranch,
  Key,
  Layers,
  Network,
  Search,
  Terminal,
} from "lucide-react"
import CustomJSONViewer from "./CustomJSONViewer"

interface CapeAnalysisDashboardProps {
  capeData: any
  loading: boolean
  onCopyJson: () => void
  copied: boolean
  onDownload?: (format: string) => void
}

type CapeTab = "overview" | "behavior" | "signatures" | "processes" | "network" | "files" | "mitre" | "raw"

type Tone = "green" | "amber" | "red"

function clamp(value: number, min = 0, max = 10) {
  if (!Number.isFinite(value)) return 0
  return Math.max(min, Math.min(value, max))
}

function scoreTone(score: number): Tone {
  if (score >= 6) return "red"
  if (score <= 2) return "green"
  return "amber"
}

function toneColor(tone: Tone) {
  if (tone === "red") return "#ef4444"
  if (tone === "green") return "#22c55e"
  return "#f59e0b"
}

function verdictText(status?: string) {
  const v = String(status || "unknown").toLowerCase()
  if (v.includes("malicious")) return "Malicious"
  if (v.includes("suspicious")) return "Suspicious"
  if (v.includes("clean") || v.includes("benign")) return "Clean"
  return "Unknown"
}

function parseDate(value?: string) {
  if (!value) return "Unknown"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString()
}

function formatBytes(bytes?: number | string) {
  const b = typeof bytes === "string" ? Number(bytes) : bytes
  if (!b || Number.isNaN(b)) return "N/A"
  const units = ["B", "KB", "MB", "GB"]
  const idx = Math.min(Math.floor(Math.log(b) / Math.log(1024)), units.length - 1)
  const size = b / Math.pow(1024, idx)
  return `${size.toFixed(size >= 100 ? 0 : 1)} ${units[idx]}`
}

function safeArray<T = any>(v: any): T[] {
  return Array.isArray(v) ? v : []
}

function severityClass(severity: number) {
  if (severity >= 3) return "high"
  if (severity >= 2) return "medium"
  return "low"
}

function normalizeProcessNodeName(node: any) {
  return node?.process_name || node?.name || "Unknown process"
}

function normalizeProcessPid(node: any) {
  return node?.process_id ?? node?.pid ?? null
}

function ProcessTreeNode({ node, isRoot = false }: { node: any; isRoot?: boolean }) {
  const children = safeArray(node?.children)

  return (
    <div className={isRoot ? "" : "relative pl-6"}>
      {!isRoot && (
        <>
          <span className="absolute left-2 top-0 h-5 w-px bg-white/15" />
          <span className="absolute left-2 top-5 w-3 h-px bg-white/15" />
        </>
      )}

      <div className="rounded-lg border border-[#1a1a1a] bg-black/20 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-foreground break-all">{node?.name || "Unknown process"}</p>
          <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted/20 text-muted-foreground">PID {node?.pid ?? "-"}</span>
          {node?.parentId != null && (
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted/20 text-muted-foreground">PPID {node.parentId}</span>
          )}
          <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted/20 text-muted-foreground">Threads {node?.threadCount ?? 0}</span>
          <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted/20 text-muted-foreground">Calls {node?.callCount ?? 0}</span>
          {children.length > 0 && (
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/25">Children {children.length}</span>
          )}
        </div>

        {node?.modulePath && <p className="mt-1 text-xs text-muted-foreground break-all">{node.modulePath}</p>}
        {node?.commandLine && <p className="mt-1 text-xs font-mono text-foreground break-all">{node.commandLine}</p>}
      </div>

      {children.length > 0 && (
        <div className="mt-2 pl-4 border-l border-white/10 space-y-2">
          {children.map((child: any) => (
            <ProcessTreeNode key={child.id} node={child} />
          ))}
        </div>
      )}
    </div>
  )
}

function ProgressiveList<T>({
  items,
  renderItem,
  initialCount = 10,
  step = 10,
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

function ScoreRing({ score, label, subtitle }: { score: number; label: string; subtitle: string }) {
  const normalized = clamp(score)
  const tone = scoreTone(normalized)
  const color = toneColor(tone)
  const fill = (normalized / 10) * 100

  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4">
      <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3">{label}</p>
      <div className="flex items-center gap-4">
        <div
          className="relative h-24 w-24 rounded-full"
          style={{ background: `conic-gradient(${color} ${fill}%, rgba(255,255,255,0.08) ${fill}% 100%)` }}
        >
          <div className="absolute inset-[8px] rounded-full bg-[#0a0a0a] border border-[#1f1f1f] flex items-center justify-center">
            <div className="text-center">
              <p className="text-xl font-bold text-white">{normalized.toFixed(1)}</p>
              <p className="text-[10px] text-muted-foreground">/ 10</p>
            </div>
          </div>
        </div>
        <div>
          <p className="text-base font-semibold text-white">
            {normalized >= 8 ? "Critical" : normalized >= 6 ? "High" : normalized >= 4 ? "Medium" : normalized >= 2 ? "Low" : "Clean"} Risk
          </p>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
          <div className="h-1.5 w-40 rounded-full bg-white/5 overflow-hidden mt-2">
            <div className="h-full rounded-full" style={{ width: `${fill}%`, background: color }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-[#1a1a1a] bg-black/20 p-3">
      <div className="flex items-center gap-2 mb-2 text-xs uppercase tracking-wider">
        <span className="inline-flex items-center justify-center h-6 w-6 rounded-md border border-slate-400/20 bg-slate-400/10 text-slate-200">
          {icon}
        </span>
        <span className="text-slate-300">{label}</span>
      </div>
      <p className="text-2xl font-semibold text-white">{value}</p>
    </div>
  )
}

function HashRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="flex items-center gap-2 border border-[#1a1a1a] bg-black/20 rounded-md px-2 py-1.5">
      <span className="text-[10px] text-muted-foreground w-14 shrink-0">{label}</span>
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

export default function CapeAnalysisDashboard({ capeData, loading, onCopyJson, copied, onDownload }: CapeAnalysisDashboardProps) {
  const [activeTab, setActiveTab] = useState<CapeTab>("overview")
  const [viewMode, setViewMode] = useState<"structured" | "raw">("structured")
  const [searchQuery, setSearchQuery] = useState("")
  const [severityFilter, setSeverityFilter] = useState<"all" | "high" | "medium" | "low">("all")

  const summary = useMemo(() => capeData?.behavior?.summary || {}, [capeData])

  const stats = useMemo(() => {
    return {
      processes: safeArray(capeData?.behavior?.processes).length,
      signatures: safeArray(capeData?.signatures).length,
      droppedFiles: safeArray(capeData?.dropped).length,
      ttps: safeArray(capeData?.ttps).length,
      registryKeys: safeArray(summary?.keys).length,
      commands: safeArray(summary?.executed_commands).length,
      mutexes: safeArray(summary?.mutexes).length,
      writeFiles: safeArray(summary?.write_files).length,
      deleteFiles: safeArray(summary?.delete_files).length,
      memoryDumps: safeArray(capeData?.procmemory).length,
    }
  }, [capeData, summary])

  const signatures = useMemo(() => {
    return safeArray(capeData?.signatures).map((sig: any) => ({
      ...sig,
      severityClass: severityClass(Number(sig?.severity || 0)),
    }))
  }, [capeData])

  const filteredSignatures = useMemo(() => {
    if (severityFilter === "all") return signatures
    return signatures.filter((s: any) => s.severityClass === severityFilter)
  }, [signatures, severityFilter])

  const processDetails = useMemo(() => {
    return safeArray(capeData?.behavior?.processes).map((proc: any) => {
      const calls = safeArray(proc?.calls)
      const threads = safeArray(proc?.threads)
      const environ = proc?.environ || {}
      const fileActivities = proc?.file_activities || {}
      const apiCounts = calls.reduce((acc: Record<string, number>, call: any) => {
        const api = call?.api
        if (!api) return acc
        acc[api] = (acc[api] || 0) + 1
        return acc
      }, {})
      const topApis = Object.entries(apiCounts)
        .map(([api, count]) => ({ api, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)

      return {
        ...proc,
        pid: proc?.process_id ?? proc?.pid,
        name: proc?.process_name || proc?.name || "Unknown process",
        parentId: proc?.parent_id,
        modulePath: proc?.module_path,
        firstSeen: proc?.first_seen,
        commandLine: environ?.CommandLine || "",
        username: environ?.UserName,
        computerName: environ?.ComputerName,
        bitness: environ?.Bitness,
        tempPath: environ?.TempPath,
        callCount: calls.length,
        threadCount: threads.length,
        threads,
        firstCall: calls[0],
        lastCall: calls[calls.length - 1],
        topApis,
        readFiles: safeArray(fileActivities?.read_files),
        writeFiles: safeArray(fileActivities?.write_files),
        deleteFiles: safeArray(fileActivities?.delete_files),
      }
    })
  }, [capeData])

  const encryptedBuffersByPid = useMemo(() => {
    const map: Record<string, any[]> = {}
    safeArray(capeData?.encryptedbuffers).forEach((entry: any) => {
      const key = String(entry?.pid ?? "")
      if (!key) return
      map[key] = map[key] || []
      map[key].push(entry)
    })
    return map
  }, [capeData])

  const processDetailByPid = useMemo(() => {
    const map: Record<string, any> = {}
    processDetails.forEach((proc: any) => {
      if (proc?.pid == null) return
      map[String(proc.pid)] = proc
    })
    return map
  }, [processDetails])

  const processTreeNodes = useMemo(() => {
    const roots = safeArray(capeData?.behavior?.processtree)

    const normalizeNode = (node: any, path: string): any => {
      const pid = normalizeProcessPid(node)
      const detail = pid != null ? processDetailByPid[String(pid)] : null
      const children = safeArray(node?.children).map((child, idx) => normalizeNode(child, `${path}-${idx}`))

      return {
        id: `${pid ?? "no-pid"}-${path}`,
        name: normalizeProcessNodeName(node),
        pid,
        parentId: node?.parent_id,
        modulePath: detail?.modulePath || node?.module_path || "",
        commandLine: detail?.commandLine || node?.environ?.CommandLine || "",
        threadCount: detail?.threadCount ?? safeArray(node?.threads).length,
        callCount: detail?.callCount ?? safeArray(node?.calls).length,
        children,
      }
    }

    return roots.map((root, idx) => normalizeNode(root, String(idx)))
  }, [capeData, processDetailByPid])

  const searchedProcesses = useMemo(() => {
    if (!searchQuery.trim()) return processDetails
    const q = searchQuery.toLowerCase()
    return processDetails.filter((p: any) => {
      const name = String(p?.name || "").toLowerCase()
      const path = String(p?.modulePath || "").toLowerCase()
      const cmd = String(p?.commandLine || "").toLowerCase()
      const apis = safeArray(p?.topApis).map((a: any) => String(a?.api || "").toLowerCase())
      return name.includes(q) || path.includes(q) || cmd.includes(q) || apis.some((a: string) => a.includes(q))
    })
  }, [processDetails, searchQuery])

  const network = useMemo(() => {
    const n = capeData?.network || {}
    const hosts = safeArray(n?.hosts)
    const domains = safeArray(n?.domains)
    const tcp = safeArray(n?.tcp)
    const udp = safeArray(n?.udp)
    const http = safeArray(n?.http)
    const dns = safeArray(n?.dns)
    const deadHosts = safeArray(n?.dead_hosts)
    const sortedTcp = safeArray(n?.sorted?.tcp)
    const sortedUdp = safeArray(n?.sorted?.udp)

    const topDestPorts = [...tcp, ...udp].reduce((acc: Record<string, number>, item: any) => {
      const dport = item?.dport
      if (dport == null) return acc
      const key = String(dport)
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    const topPorts = Object.entries(topDestPorts)
      .map(([port, count]) => ({ port, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)

    return {
      pcapSha256: n?.pcap_sha256,
      sortedPcapSha256: n?.sorted_pcap_sha256,
      pcapngSha256: capeData?.pcapng?.sha256,
      hosts,
      domains,
      tcp,
      udp,
      http,
      dns,
      deadHosts,
      sortedTcp,
      sortedUdp,
      topPorts,
    }
  }, [capeData])

  const fileInfo = useMemo(() => {
    const f = capeData?.target?.file
    if (!f) return null
    return {
      name: f?.name,
      type: f?.type,
      size: formatBytes(f?.size),
      md5: f?.md5,
      sha1: f?.sha1,
      sha256: f?.sha256,
      imphash: f?.pe?.imphash,
      timestamp: f?.pe?.timestamp,
    }
  }, [capeData])

  if (!capeData || Object.keys(capeData).length === 0) {
    return (
      <div className="text-center py-12">
        <FileJson className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No CAPE data available</p>
      </div>
    )
  }

  const sandboxScore = clamp(Number(capeData?.malscore || 0))
  const verdict = verdictText(capeData?.malstatus)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary mb-1">CAPE Command Surface</p>
          <h2 className="text-2xl font-semibold text-white">Sandbox Intelligence Report</h2>
          <p className="text-sm text-muted-foreground mt-1">Structured behavioral, network, and detection analysis from CAPE output.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setViewMode((m) => (m === "structured" ? "raw" : "structured"))}
            className="px-3 py-1.5 border border-[#1a1a1a] rounded-lg hover:bg-muted/20 transition-colors text-sm flex items-center gap-2"
          >
            {viewMode === "structured" ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {viewMode === "structured" ? "Raw View" : "Structured View"}
          </button>
          <button
            onClick={onCopyJson}
            className="px-3 py-1.5 border border-[#1a1a1a] rounded-lg hover:bg-muted/20 transition-colors text-sm flex items-center gap-2"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? "Copied" : "Copy JSON"}
          </button>
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

      {viewMode === "raw" ? (
        <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4">
          <CustomJSONViewer data={capeData} mode="raw" />
        </div>
      ) : (
        <>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ScoreRing
                score={sandboxScore}
                label="Sandbox Threat Score"
                subtitle={`Verdict: ${verdict}${capeData?.info?.timeout ? " • Timeout observed" : ""}`}
              />

              <div className="rounded-xl border border-[#1a1a1a] bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3">Run Metadata</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-md border border-[#1a1a1a] p-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Started</p>
                    <p className="text-white mt-1">{parseDate(capeData?.info?.started)}</p>
                  </div>
                  <div className="rounded-md border border-[#1a1a1a] p-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Ended</p>
                    <p className="text-white mt-1">{parseDate(capeData?.info?.ended)}</p>
                  </div>
                  <div className="rounded-md border border-[#1a1a1a] p-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Duration</p>
                    <p className="text-white mt-1">{capeData?.info?.duration ? `${capeData.info.duration}s` : "N/A"}</p>
                  </div>
                  <div className="rounded-md border border-[#1a1a1a] p-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Package</p>
                    <p className="text-white mt-1">{capeData?.info?.package || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] px-2 md:px-3">
            <nav className="flex overflow-x-auto">
              {[
                { id: "overview", label: "Overview", icon: <Layers className="w-4 h-4" /> },
                { id: "behavior", label: "Behavior", icon: <Activity className="w-4 h-4" /> },
                { id: "signatures", label: "Signatures", icon: <AlertTriangle className="w-4 h-4" /> },
                { id: "processes", label: "Processes", icon: <Cpu className="w-4 h-4" /> },
                { id: "network", label: "Network", icon: <Network className="w-4 h-4" /> },
                { id: "files", label: "Files", icon: <Folder className="w-4 h-4" /> },
                { id: "mitre", label: "MITRE", icon: <FileCode className="w-4 h-4" /> },
                { id: "raw", label: "Raw Data", icon: <FileJson className="w-4 h-4" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as CapeTab)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="space-y-6 min-h-[420px]">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {fileInfo && (
                  <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <File className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">Target File</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                      <div className="rounded-md border border-[#1a1a1a] p-3"><p className="text-xs text-muted-foreground uppercase">Name</p><p className="text-white mt-1 break-all">{fileInfo.name || "N/A"}</p></div>
                      <div className="rounded-md border border-[#1a1a1a] p-3"><p className="text-xs text-muted-foreground uppercase">Type</p><p className="text-white mt-1">{fileInfo.type || "N/A"}</p></div>
                      <div className="rounded-md border border-[#1a1a1a] p-3"><p className="text-xs text-muted-foreground uppercase">Size</p><p className="text-white mt-1">{fileInfo.size}</p></div>
                    </div>
                    <div className="space-y-1 mt-3">
                      <HashRow label="SHA256" value={fileInfo.sha256} />
                      <HashRow label="SHA1" value={fileInfo.sha1} />
                      <HashRow label="MD5" value={fileInfo.md5} />
                    </div>
                  </div>
                )}

                <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    <StatTile icon={<Cpu className="w-3.5 h-3.5" />} label="Processes" value={stats.processes} />
                    <StatTile icon={<AlertTriangle className="w-3.5 h-3.5" />} label="Signatures" value={stats.signatures} />
                    <StatTile icon={<Folder className="w-3.5 h-3.5" />} label="Dropped Files" value={stats.droppedFiles} />
                    <StatTile icon={<Network className="w-3.5 h-3.5" />} label="Network Hosts" value={network.hosts.length} />
                    <StatTile icon={<FileCode className="w-3.5 h-3.5" />} label="MITRE IDs" value={stats.ttps} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "behavior" && (
              <div className="space-y-6">
                <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatTile icon={<FileText className="w-3.5 h-3.5" />} label="Write Files" value={stats.writeFiles} />
                    <StatTile icon={<FileText className="w-3.5 h-3.5" />} label="Delete Files" value={stats.deleteFiles} />
                    <StatTile icon={<Key className="w-3.5 h-3.5" />} label="Registry Keys" value={stats.registryKeys} />
                    <StatTile icon={<Terminal className="w-3.5 h-3.5" />} label="Commands" value={stats.commands} />
                  </div>
                </div>

                {safeArray(summary?.executed_commands).length > 0 && (
                  <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Executed Commands</h3>
                    <ProgressiveList
                      items={safeArray(summary.executed_commands)}
                      initialCount={8}
                      step={8}
                      className="space-y-2"
                      renderItem={(cmd: string, idx: number) => (
                        <div key={idx} className="border border-[#1a1a1a] bg-black/20 rounded-md p-2 text-xs font-mono text-foreground break-all">
                          {cmd}
                        </div>
                      )}
                    />
                  </div>
                )}

                {safeArray(summary?.keys).length > 0 && (
                  <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Registry Keys</h3>
                    <ProgressiveList
                      items={safeArray(summary.keys)}
                      initialCount={12}
                      step={12}
                      className="space-y-2"
                      renderItem={(key: string, idx: number) => (
                        <div key={idx} className="border border-[#1a1a1a] bg-black/20 rounded-md p-2 text-xs font-mono text-foreground break-all">
                          {key}
                        </div>
                      )}
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === "signatures" && (
              <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
                <div className="flex flex-wrap gap-2 mb-4">
                  {(["all", "high", "medium", "low"] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setSeverityFilter(level)}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                        severityFilter === level
                          ? "bg-primary/15 border-primary/40 text-primary"
                          : "border-[#1a1a1a] hover:bg-muted/20 text-muted-foreground"
                      }`}
                    >
                      {level === "all" ? "All" : level[0].toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>

                {filteredSignatures.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p>No signatures in selected filter</p>
                  </div>
                ) : (
                  <ProgressiveList
                    items={filteredSignatures}
                    initialCount={10}
                    step={10}
                    className="space-y-3"
                    renderItem={(sig: any, idx: number) => {
                      const cls = sig.severityClass === "high" ? "text-red-400 bg-red-500/10 border-red-500/25" : sig.severityClass === "medium" ? "text-amber-400 bg-amber-500/10 border-amber-500/25" : "text-green-400 bg-green-500/10 border-green-500/25"
                      return (
                        <div key={idx} className="rounded-lg border border-[#1a1a1a] bg-black/20 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">{sig?.name || "Unnamed signature"}</p>
                              <p className="text-xs text-muted-foreground mt-1">{sig?.description || "No description"}</p>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded border ${cls}`}>Severity {sig?.severity ?? 0}</span>
                          </div>
                        </div>
                      )
                    }}
                  />
                )}
              </div>
            )}

            {activeTab === "processes" && (
              <div className="space-y-6">
                <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <GitBranch className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Process Tree Graph</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">Node graph hierarchy from behavior.processtree (parent to child execution chain).</p>
                  {processTreeNodes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No process tree data available.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <div className="min-w-[680px] space-y-3">
                        {processTreeNodes.map((root: any) => (
                          <ProcessTreeNode key={root.id} node={root} isRoot />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search process name, path, command, API"
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#1a1a1a] bg-black/20 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
                    />
                  </div>

                  {searchedProcesses.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      <Cpu className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      <p>No process telemetry found</p>
                    </div>
                  ) : (
                    <ProgressiveList
                      items={searchedProcesses}
                      initialCount={10}
                      step={10}
                      className="space-y-4"
                      renderItem={(p: any, idx: number) => {
                        const cryptoHits = encryptedBuffersByPid[String(p?.pid)] || []
                        return (
                          <div key={`${p?.pid || idx}-${idx}`} className="rounded-lg border border-[#1a1a1a] bg-black/20 p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground break-all">{p?.name || "Unknown process"}</p>
                                <p className="text-xs text-muted-foreground mt-1 break-all">{p?.modulePath || "No module path"}</p>
                                <div className="mt-2 flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                                  <span className="px-1.5 py-0.5 rounded bg-muted/20">PID: {p?.pid ?? "-"}</span>
                                  {p?.parentId != null && <span className="px-1.5 py-0.5 rounded bg-muted/20">Parent: {p.parentId}</span>}
                                  {p?.firstSeen && <span className="px-1.5 py-0.5 rounded bg-muted/20">First seen: {p.firstSeen}</span>}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="rounded-md border border-[#1a1a1a] px-2 py-1.5 text-center">
                                  <p className="text-muted-foreground">Threads</p>
                                  <p className="text-white font-semibold">{p?.threadCount}</p>
                                </div>
                                <div className="rounded-md border border-[#1a1a1a] px-2 py-1.5 text-center">
                                  <p className="text-muted-foreground">API Calls</p>
                                  <p className="text-white font-semibold">{p?.callCount}</p>
                                </div>
                              </div>
                            </div>

                            {p?.commandLine && (
                              <div className="mt-3 rounded-md border border-[#1a1a1a] bg-black/20 p-2">
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Command line</p>
                                <p className="text-xs font-mono text-foreground break-all">{p.commandLine}</p>
                              </div>
                            )}

                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="rounded-md border border-[#1a1a1a] p-2">
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Top APIs</p>
                                {safeArray(p?.topApis).length === 0 ? (
                                  <p className="text-xs text-muted-foreground">No API calls captured</p>
                                ) : (
                                  <div className="space-y-1">
                                    {safeArray(p?.topApis).map((api: any, apiIdx: number) => (
                                      <div key={apiIdx} className="flex items-center justify-between text-xs">
                                        <span className="text-foreground break-all mr-2">{api?.api}</span>
                                        <span className="text-muted-foreground">{api?.count}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="rounded-md border border-[#1a1a1a] p-2">
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Environment</p>
                                <div className="space-y-1 text-xs">
                                  <p className="text-foreground">User: <span className="text-muted-foreground">{p?.username || "N/A"}</span></p>
                                  <p className="text-foreground">Host: <span className="text-muted-foreground">{p?.computerName || "N/A"}</span></p>
                                  <p className="text-foreground">Bitness: <span className="text-muted-foreground">{p?.bitness || "N/A"}</span></p>
                                  {p?.tempPath && <p className="text-foreground break-all">Temp: <span className="text-muted-foreground">{p.tempPath}</span></p>}
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                              <div className="rounded-md border border-[#1a1a1a] p-2">
                                <p className="text-muted-foreground mb-1">Read files</p>
                                <p className="text-foreground font-semibold">{safeArray(p?.readFiles).length}</p>
                              </div>
                              <div className="rounded-md border border-[#1a1a1a] p-2">
                                <p className="text-muted-foreground mb-1">Write files</p>
                                <p className="text-foreground font-semibold">{safeArray(p?.writeFiles).length}</p>
                              </div>
                              <div className="rounded-md border border-[#1a1a1a] p-2">
                                <p className="text-muted-foreground mb-1">Delete files</p>
                                <p className="text-foreground font-semibold">{safeArray(p?.deleteFiles).length}</p>
                              </div>
                            </div>

                            {safeArray(p?.threads).length > 0 && (
                              <div className="mt-3 rounded-md border border-[#1a1a1a] p-2">
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Threads</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {safeArray(p?.threads).slice(0, 12).map((threadId: string, tIdx: number) => (
                                    <span key={tIdx} className="text-[11px] px-1.5 py-0.5 rounded bg-muted/20 text-muted-foreground">{threadId}</span>
                                  ))}
                                  {safeArray(p?.threads).length > 12 && (
                                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted/20 text-muted-foreground">+{safeArray(p?.threads).length - 12} more</span>
                                  )}
                                </div>
                              </div>
                            )}

                            {(p?.firstCall || p?.lastCall) && (
                              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                {p?.firstCall && (
                                  <div className="rounded-md border border-[#1a1a1a] p-2">
                                    <p className="text-muted-foreground mb-1">First API</p>
                                    <p className="text-foreground font-medium">{p.firstCall?.api || "N/A"}</p>
                                    <p className="text-muted-foreground">{p.firstCall?.category || "unknown"} • {p.firstCall?.timestamp || ""}</p>
                                  </div>
                                )}
                                {p?.lastCall && (
                                  <div className="rounded-md border border-[#1a1a1a] p-2">
                                    <p className="text-muted-foreground mb-1">Last API</p>
                                    <p className="text-foreground font-medium">{p.lastCall?.api || "N/A"}</p>
                                    <p className="text-muted-foreground">{p.lastCall?.category || "unknown"} • {p.lastCall?.timestamp || ""}</p>
                                  </div>
                                )}
                              </div>
                            )}

                            {cryptoHits.length > 0 && (
                              <div className="mt-3 rounded-md border border-amber-500/25 bg-amber-500/10 p-2 text-xs">
                                <p className="text-amber-300 font-medium">Cryptography activity</p>
                                <p className="text-amber-200/90 mt-1">{cryptoHits.length} encrypted buffer event(s) captured for this process.</p>
                                <p className="text-amber-100/80 mt-1 break-all">Latest API: {cryptoHits[cryptoHits.length - 1]?.api_call || "unknown"} • key {cryptoHits[cryptoHits.length - 1]?.crypt_key || "N/A"}</p>
                              </div>
                            )}
                          </div>
                        )
                      }}
                    />
                  )}
                </div>
              </div>
            )}

            {activeTab === "network" && (
              <div className="space-y-6">
                <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Network className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Network Overview</h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatTile icon={<Globe className="w-3.5 h-3.5" />} label="Hosts" value={network.hosts.length} />
                    <StatTile icon={<Globe className="w-3.5 h-3.5" />} label="Domains" value={network.domains.length} />
                    <StatTile icon={<Activity className="w-3.5 h-3.5" />} label="TCP" value={network.tcp.length} />
                    <StatTile icon={<Activity className="w-3.5 h-3.5" />} label="UDP" value={network.udp.length} />
                    <StatTile icon={<FileText className="w-3.5 h-3.5" />} label="HTTP" value={network.http.length} />
                    <StatTile icon={<FileText className="w-3.5 h-3.5" />} label="DNS" value={network.dns.length} />
                    <StatTile icon={<AlertTriangle className="w-3.5 h-3.5" />} label="Dead Hosts" value={network.deadHosts.length} />
                    <StatTile icon={<Network className="w-3.5 h-3.5" />} label="Sorted TCP" value={network.sortedTcp.length} />
                  </div>

                  <div className="mt-4 space-y-1">
                    <HashRow label="PCAP" value={network.pcapSha256} />
                    <HashRow label="Sorted" value={network.sortedPcapSha256} />
                    <HashRow label="PCAPNG" value={network.pcapngSha256} />
                  </div>
                </div>

                {network.topPorts.length > 0 && (
                  <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Top Destination Ports</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {network.topPorts.map((p: any, idx: number) => (
                        <div key={idx} className="rounded-md border border-[#1a1a1a] bg-black/20 p-2 text-center">
                          <p className="text-white font-semibold">:{p.port}</p>
                          <p className="text-xs text-muted-foreground">{p.count} flows</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Hosts</h3>
                    <ProgressiveList
                      items={network.hosts}
                      initialCount={10}
                      step={10}
                      className="space-y-2"
                      renderItem={(h: any, idx: number) => (
                        <div key={idx} className="rounded-md border border-[#1a1a1a] bg-black/20 p-2 text-xs">
                          <p className="text-foreground font-medium">{h?.ip || "unknown"}</p>
                          <p className="text-muted-foreground">{h?.country_name || "unknown"} {h?.asn ? `• ASN ${h.asn}` : ""}</p>
                        </div>
                      )}
                    />
                  </div>

                  <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Domains</h3>
                    <ProgressiveList
                      items={network.domains}
                      initialCount={12}
                      step={12}
                      className="space-y-2"
                      renderItem={(d: any, idx: number) => (
                        <div key={idx} className="rounded-md border border-[#1a1a1a] bg-black/20 p-2 text-xs">
                          <p className="text-foreground break-all">{d?.domain || "N/A"}</p>
                          {d?.ip && <p className="text-muted-foreground">{d.ip}</p>}
                        </div>
                      )}
                    />
                  </div>

                  <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-3">HTTP Requests</h3>
                    <ProgressiveList
                      items={network.http}
                      initialCount={8}
                      step={8}
                      className="space-y-2"
                      renderItem={(h: any, idx: number) => (
                        <div key={idx} className="rounded-md border border-[#1a1a1a] bg-black/20 p-2 text-xs">
                          <p className="text-foreground font-medium break-all">{h?.method || "GET"} {h?.path || h?.uri || "/"}</p>
                          <p className="text-muted-foreground break-all">{h?.host || "unknown-host"}</p>
                        </div>
                      )}
                    />
                  </div>

                  <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-3">DNS Requests</h3>
                    <ProgressiveList
                      items={network.dns}
                      initialCount={10}
                      step={10}
                      className="space-y-2"
                      renderItem={(d: any, idx: number) => (
                        <div key={idx} className="rounded-md border border-[#1a1a1a] bg-black/20 p-2 text-xs">
                          <p className="text-foreground break-all">{d?.request || "N/A"}</p>
                          <p className="text-muted-foreground">{d?.type || "A"} • {safeArray(d?.answers).length} answer(s)</p>
                        </div>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "files" && (
              <div className="space-y-6">
                {safeArray(capeData?.dropped).length > 0 && (
                  <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Dropped Files</h3>
                    <ProgressiveList
                      items={safeArray(capeData.dropped)}
                      initialCount={8}
                      step={8}
                      className="space-y-2"
                      renderItem={(file: any, idx: number) => (
                        <div key={idx} className="rounded-md border border-[#1a1a1a] bg-black/20 p-3 text-xs">
                          <p className="text-foreground font-medium break-all">{file?.name?.[0] || "Unknown"}</p>
                          <p className="text-muted-foreground">{formatBytes(file?.size)} • {file?.type || "N/A"}</p>
                          <div className="mt-2 space-y-1">
                            <HashRow label="SHA256" value={file?.sha256} />
                          </div>
                        </div>
                      )}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {safeArray(summary?.write_files).length > 0 && (
                    <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
                      <h3 className="text-sm font-semibold text-foreground mb-3">Files Written</h3>
                      <ProgressiveList
                        items={safeArray(summary.write_files)}
                        initialCount={20}
                        step={20}
                        className="space-y-2"
                        renderItem={(file: string, idx: number) => (
                          <div key={idx} className="rounded-md border border-[#1a1a1a] bg-black/20 p-2 text-xs font-mono text-foreground break-all">
                            {file}
                          </div>
                        )}
                      />
                    </div>
                  )}

                  {safeArray(summary?.delete_files).length > 0 && (
                    <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
                      <h3 className="text-sm font-semibold text-foreground mb-3">Files Deleted</h3>
                      <ProgressiveList
                        items={safeArray(summary.delete_files)}
                        initialCount={20}
                        step={20}
                        className="space-y-2"
                        renderItem={(file: string, idx: number) => (
                          <div key={idx} className="rounded-md border border-[#1a1a1a] bg-black/20 p-2 text-xs font-mono text-foreground break-all">
                            {file}
                          </div>
                        )}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "mitre" && (
              <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
                {safeArray(capeData?.ttps).length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <FileCode className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p>No MITRE ATT&CK mappings found</p>
                  </div>
                ) : (
                  <ProgressiveList
                    items={safeArray(capeData?.ttps)}
                    initialCount={10}
                    step={10}
                    className="space-y-3"
                    renderItem={(ttp: any, idx: number) => (
                      <div key={idx} className="rounded-md border border-[#1a1a1a] bg-black/20 p-3">
                        <p className="text-sm font-semibold text-foreground">{ttp?.signature || "Technique mapping"}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {safeArray(ttp?.ttps).map((id: string, i: number) => (
                            <span key={i} className="text-xs px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/25">
                              {id}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  />
                )}
              </div>
            )}

            {activeTab === "raw" && (
              <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4">
                <CustomJSONViewer data={capeData} mode="pretty" />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
