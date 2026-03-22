"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Code,
  Copy,
  Cpu,
  Database,
  Download,
  Eye,
  EyeOff,
  File,
  FileCode,
  FileJson,
  FileSearch,
  FileText,
  Folder,
  GitBranch,
  Globe,
  Hash,
  Key,
  Layers,
  MemoryStick,
  Network,
  Search,
  Terminal,
  Type,
} from "lucide-react"
import CustomJSONViewer from "./CustomJSONViewer"

interface ParsedAnalysisDashboardProps {
  data: any
  loading?: boolean
  onCopyJson?: () => void
  copied?: boolean
  onDownload?: (format: string) => void
}

type ParsedTab = "overview" | "behavior" | "signatures" | "strings" | "memory" | "network" | "static" | "raw"
type SeverityFilter = "all" | "high" | "medium" | "low"

function safeArray<T = any>(value: any): T[] {
  return Array.isArray(value) ? value : []
}

function numberOrZero(value: any): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function formatBytes(bytes?: number | string) {
  const value = typeof bytes === "string" ? Number(bytes) : bytes
  if (!value || Number.isNaN(value)) return "N/A"
  const units = ["B", "KB", "MB", "GB"]
  const idx = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1)
  const size = value / Math.pow(1024, idx)
  return `${size.toFixed(size >= 100 ? 0 : 1)} ${units[idx]}`
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
      <button onClick={() => navigator.clipboard.writeText(value)} className="p-1 rounded hover:bg-muted/20 transition-colors">
        <Copy className="w-3 h-3" />
      </button>
    </div>
  )
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
          <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted/20 text-muted-foreground">Threads {node?.threads ?? 0}</span>
          <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted/20 text-muted-foreground">Calls {node?.calls ?? 0}</span>
          {children.length > 0 && (
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/25">Children {children.length}</span>
          )}
        </div>

        {node?.path && <p className="mt-1 text-xs text-muted-foreground break-all">{node.path}</p>}
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

export default function ParsedAnalysisDashboard({ data, loading = false, onCopyJson, copied = false, onDownload }: ParsedAnalysisDashboardProps) {
  const [activeTab, setActiveTab] = useState<ParsedTab>("overview")
  const [viewMode, setViewMode] = useState<"structured" | "raw">("structured")
  const [searchQuery, setSearchQuery] = useState("")
  const [networkQuery, setNetworkQuery] = useState("")
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all")

  const sections = useMemo(() => data?.sections || {}, [data])

  const target = useMemo(() => {
    const t = sections?.target || {}
    return {
      name: t?.file_name || "Unknown",
      size: formatBytes(t?.file_size),
      type: t?.file_type || "N/A",
      md5: t?.md5,
      sha1: t?.sha1,
      sha256: t?.sha256,
      ssdeep: t?.ssdeep,
      imphash: t?.pe_info?.imphash || t?.pe_structure?.imphash,
      signed: t?.pe_info?.signed,
      timestamp: t?.pe_structure?.timestamp,
    }
  }, [sections])

  const behaviorProcesses = useMemo(() => safeArray(sections?.behavior?.data?.processes), [sections])
  const behaviorSummary = useMemo(() => sections?.behavior?.data?.summary || {}, [sections])
  const signatures = useMemo(() => {
    return safeArray(sections?.signatures?.signatures).map((sig: any) => ({
      ...sig,
      severity: numberOrZero(sig?.severity),
      severityClass: numberOrZero(sig?.severity) >= 3 ? "high" : numberOrZero(sig?.severity) >= 2 ? "medium" : "low",
    }))
  }, [sections])

  const filteredSignatures = useMemo(() => {
    if (severityFilter === "all") return signatures
    return signatures.filter((s: any) => s.severityClass === severityFilter)
  }, [signatures, severityFilter])

  const processDetails = useMemo(() => {
    return behaviorProcesses.map((proc: any) => {
      const calls = safeArray(proc?.calls)
      const threads = safeArray(proc?.threads)
      const env = proc?.environ || {}
      const activities = proc?.file_activities || {}
      const apiCounts = calls.reduce((acc: Record<string, number>, call: any) => {
        const api = call?.api
        if (!api) return acc
        acc[api] = (acc[api] || 0) + 1
        return acc
      }, {})
      const topApis = Object.entries(apiCounts)
        .map(([api, count]) => ({ api, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4)

      return {
        pid: proc?.process_id,
        name: proc?.process_name || "Unknown process",
        parentId: proc?.parent_id,
        path: proc?.module_path,
        firstSeen: proc?.first_seen,
        calls,
        callCount: calls.length,
        threads,
        threadCount: threads.length,
        topApis,
        commandLine: env?.CommandLine || "",
        username: env?.UserName,
        computerName: env?.ComputerName,
        bitness: env?.Bitness,
        readFiles: safeArray(activities?.read_files),
        writeFiles: safeArray(activities?.write_files),
        deleteFiles: safeArray(activities?.delete_files),
      }
    })
  }, [behaviorProcesses])

  const searchedProcesses = useMemo(() => {
    if (!searchQuery.trim()) return processDetails
    const q = searchQuery.toLowerCase()
    return processDetails.filter((p: any) => {
      const name = String(p?.name || "").toLowerCase()
      const path = String(p?.path || "").toLowerCase()
      const cmd = String(p?.commandLine || "").toLowerCase()
      const apis = safeArray(p?.topApis).map((api: any) => String(api?.api || "").toLowerCase())
      return name.includes(q) || path.includes(q) || cmd.includes(q) || apis.some((api: string) => api.includes(q))
    })
  }, [processDetails, searchQuery])

  const processDetailByPid = useMemo(() => {
    const map: Record<string, any> = {}
    processDetails.forEach((p: any) => {
      if (p?.pid != null) map[String(p.pid)] = p
    })
    return map
  }, [processDetails])

  const processTreeNodes = useMemo(() => {
    const roots = safeArray(sections?.behavior?.data?.processtree)

    const normalizeNode = (node: any, path: string): any => {
      const pid = node?.process_id ?? node?.pid
      const detail = pid != null ? processDetailByPid[String(pid)] : null
      const children = safeArray(node?.children).map((child, idx) => normalizeNode(child, `${path}-${idx}`))

      return {
        id: `${pid ?? "no-pid"}-${path}`,
        name: node?.process_name || node?.name || detail?.name || "Unknown process",
        pid,
        parentId: node?.parent_id,
        path: detail?.path || node?.module_path || "",
        commandLine: detail?.commandLine || node?.environ?.CommandLine || "",
        threads: detail?.threadCount ?? safeArray(node?.threads).length,
        calls: detail?.callCount ?? safeArray(node?.calls).length,
        children,
      }
    }

    return roots.map((root, idx) => normalizeNode(root, String(idx)))
  }, [sections, processDetailByPid])

  const stringCategories = useMemo(() => {
    const categories = sections?.strings?.categories || {}
    return Object.entries(categories)
      .map(([category, values]) => {
        const items = safeArray(values)
        return {
          category,
          count: items.length,
          samples: items.slice(0, 6),
          values: items,
        }
      })
      .sort((a, b) => b.count - a.count)
  }, [sections])

  const flattenedStrings = useMemo(() => {
    const rows: { category: string; value: string }[] = []
    stringCategories.forEach((cat) => {
      cat.values.forEach((value: any) => {
        rows.push({ category: cat.category, value: String(value) })
      })
    })
    return rows
  }, [stringCategories])

  const filteredStrings = useMemo(() => {
    if (!searchQuery.trim()) return flattenedStrings
    const q = searchQuery.toLowerCase()
    return flattenedStrings.filter((row) => row.category.toLowerCase().includes(q) || row.value.toLowerCase().includes(q))
  }, [flattenedStrings, searchQuery])

  const memoryEntries = useMemo(() => {
    return safeArray(sections?.memory?.procmemory).map((entry: any) => ({
      pid: entry?.pid,
      name: entry?.name || "Unknown",
      size: formatBytes(entry?.size),
      sha256: entry?.sha256,
      extractedPE: safeArray(entry?.extracted_pe).length,
      suspiciousRegions: safeArray(entry?.address_space_summary?.suspicious_regions).length,
    }))
  }, [sections])

  const peStructure = useMemo(() => {
    const pe = sections?.target?.pe_structure || {}
    return {
      importedDlls: safeArray(pe?.imported_dlls),
      sections: safeArray(pe?.sections),
      resources: safeArray(pe?.resources),
      directories: safeArray(pe?.directories),
      entryPoint: pe?.entrypoint,
      compileTime: pe?.timestamp,
      imphash: pe?.imphash,
    }
  }, [sections])

  const networkSection = useMemo(() => {
    const raw = sections?.network?.data || sections?.network || {}
    const summary = raw?.network_summary || {}
    const hosts = safeArray(raw?.hosts)
    const domains = safeArray(raw?.domains)
    const httpRequests = safeArray(raw?.http_requests)
    const dnsQueries = safeArray(raw?.dns_queries)
    const failedConnections = safeArray(raw?.failed_connections)
    const suspiciousDomains = safeArray(raw?.ioc_summary?.suspicious_domains)
    const suspiciousIps = safeArray(raw?.ioc_summary?.suspicious_ips)

    const tldCounts = domains.reduce((acc: Record<string, number>, domain: any) => {
      const tld = String(domain?.tld || "unknown").toLowerCase()
      acc[tld] = (acc[tld] || 0) + 1
      return acc
    }, {})

    const topTlds = Object.entries(tldCounts)
      .map(([tld, count]) => ({ tld, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)

    const methodCounts = httpRequests.reduce((acc: Record<string, number>, req: any) => {
      const method = String(req?.method || "UNKNOWN").toUpperCase()
      acc[method] = (acc[method] || 0) + numberOrZero(req?.count || 1)
      return acc
    }, {})

    const topMethods = Object.entries(methodCounts)
      .map(([method, count]) => ({ method, count }))
      .sort((a, b) => b.count - a.count)

    return {
      summary: {
        totalHosts: numberOrZero(summary?.total_hosts || hosts.length),
        totalDomains: numberOrZero(summary?.total_domains || domains.length),
        totalHttp: numberOrZero(summary?.total_http_requests || httpRequests.length),
        totalDns: numberOrZero(summary?.total_dns_queries || dnsQueries.length),
        hasPcap: Boolean(summary?.has_pcap),
      },
      hosts,
      domains,
      httpRequests,
      dnsQueries,
      failedConnections,
      suspiciousDomains,
      suspiciousIps,
      topTlds,
      topMethods,
    }
  }, [sections])

  const filteredNetwork = useMemo(() => {
    if (!networkQuery.trim()) {
      return {
        domains: networkSection.domains,
        httpRequests: networkSection.httpRequests,
        dnsQueries: networkSection.dnsQueries,
      }
    }

    const q = networkQuery.toLowerCase()
    const domains = networkSection.domains.filter((d: any) => {
      return String(d?.domain || "").toLowerCase().includes(q) || String(d?.tld || "").toLowerCase().includes(q)
    })
    const httpRequests = networkSection.httpRequests.filter((h: any) => {
      return (
        String(h?.host || "").toLowerCase().includes(q) ||
        String(h?.path || "").toLowerCase().includes(q) ||
        String(h?.method || "").toLowerCase().includes(q)
      )
    })
    const dnsQueries = networkSection.dnsQueries.filter((d: any) => {
      return String(d?.query || "").toLowerCase().includes(q) || String(d?.type || "").toLowerCase().includes(q)
    })

    return { domains, httpRequests, dnsQueries }
  }, [networkSection, networkQuery])

  const apiCalls = useMemo(() => {
    return behaviorProcesses.reduce((acc: number, proc: any) => acc + safeArray(proc?.calls).length, 0)
  }, [behaviorProcesses])

  const scoreSignals = useMemo(() => {
    const weighted = [
      { label: "Signatures", value: signatures.length, max: 40 },
      { label: "API Calls", value: apiCalls, max: 1500 },
      { label: "Processes", value: processDetails.length, max: 45 },
      { label: "String IOCs", value: filteredStrings.length, max: 800 },
    ]

    const normalized = weighted.map((item) => {
      const score = Math.min((item.value / item.max) * 10, 10)
      return { ...item, score }
    })

    const avg = normalized.reduce((acc, item) => acc + item.score, 0) / (normalized.length || 1)
    return { avg, normalized }
  }, [signatures.length, apiCalls, processDetails.length, filteredStrings.length])

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="text-center py-12">
        <FileJson className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No parsed data available</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
        <p className="text-muted-foreground">Parsing and structuring analysis data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary mb-1">Parsed Intelligence Surface</p>
          <h2 className="text-2xl font-semibold text-white">Structured Parsed Report</h2>
          <p className="text-sm text-muted-foreground mt-1">High-signal extraction of behavior, signatures, strings, memory, and static metadata.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setViewMode((m) => (m === "structured" ? "raw" : "structured"))}
            className="px-3 py-1.5 border border-[#1a1a1a] rounded-lg hover:bg-muted/20 transition-colors text-sm flex items-center gap-2"
          >
            {viewMode === "structured" ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {viewMode === "structured" ? "Raw View" : "Structured View"}
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

      {viewMode === "raw" ? (
        <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4">
          <CustomJSONViewer data={data} mode="raw" />
        </div>
      ) : (
        <>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-xl border border-[#1a1a1a] bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3">Parsed Signal Density</p>
                <div className="flex items-center gap-4">
                  <div
                    className="relative h-24 w-24 rounded-full"
                    style={{
                      background: `conic-gradient(${scoreSignals.avg >= 6 ? "#ef4444" : scoreSignals.avg >= 3 ? "#f59e0b" : "#22c55e"} ${(scoreSignals.avg / 10) * 100}%, rgba(255,255,255,0.08) ${(scoreSignals.avg / 10) * 100}% 100%)`,
                    }}
                  >
                    <div className="absolute inset-[8px] rounded-full bg-[#0a0a0a] border border-[#1f1f1f] flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-xl font-bold text-white">{scoreSignals.avg.toFixed(1)}</p>
                        <p className="text-[10px] text-muted-foreground">/ 10</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {scoreSignals.normalized.map((item) => (
                      <p key={item.label}>
                        {item.label}: <span className="text-foreground font-medium">{item.value}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#1a1a1a] bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3">Target Metadata</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-md border border-[#1a1a1a] p-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">File</p>
                    <p className="text-white mt-1 break-all">{target.name}</p>
                  </div>
                  <div className="rounded-md border border-[#1a1a1a] p-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Type</p>
                    <p className="text-white mt-1">{target.type}</p>
                  </div>
                  <div className="rounded-md border border-[#1a1a1a] p-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Size</p>
                    <p className="text-white mt-1">{target.size}</p>
                  </div>
                  <div className="rounded-md border border-[#1a1a1a] p-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Signed</p>
                    <p className="text-white mt-1">{target.signed ? "Yes" : "No"}</p>
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
                { id: "strings", label: "Strings", icon: <Type className="w-4 h-4" /> },
                { id: "memory", label: "Memory", icon: <MemoryStick className="w-4 h-4" /> },
                { id: "network", label: "Network", icon: <Network className="w-4 h-4" /> },
                { id: "static", label: "Static", icon: <FileCode className="w-4 h-4" /> },
                { id: "raw", label: "Raw Data", icon: <FileJson className="w-4 h-4" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ParsedTab)}
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
                <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <StatTile icon={<Cpu className="w-3.5 h-3.5" />} label="Processes" value={processDetails.length} />
                    <StatTile icon={<AlertTriangle className="w-3.5 h-3.5" />} label="Signatures" value={signatures.length} />
                    <StatTile icon={<Code className="w-3.5 h-3.5" />} label="API Calls" value={apiCalls} />
                    <StatTile icon={<Type className="w-3.5 h-3.5" />} label="Strings" value={sections?.strings?.metadata?.total_strings_processed || 0} />
                    <StatTile icon={<MemoryStick className="w-3.5 h-3.5" />} label="Memory Dumps" value={memoryEntries.length} />
                    <StatTile icon={<FileSearch className="w-3.5 h-3.5" />} label="Payloads" value={safeArray(sections?.cape?.payloads).length} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Execution & Behavior Signals</h3>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-md border border-[#1a1a1a] p-2"><p className="text-muted-foreground">Commands</p><p className="text-white font-semibold">{safeArray(behaviorSummary?.executed_commands).length}</p></div>
                      <div className="rounded-md border border-[#1a1a1a] p-2"><p className="text-muted-foreground">Registry Keys</p><p className="text-white font-semibold">{safeArray(behaviorSummary?.keys).length}</p></div>
                      <div className="rounded-md border border-[#1a1a1a] p-2"><p className="text-muted-foreground">Mutexes</p><p className="text-white font-semibold">{safeArray(behaviorSummary?.mutexes).length}</p></div>
                      <div className="rounded-md border border-[#1a1a1a] p-2"><p className="text-muted-foreground">Write Files</p><p className="text-white font-semibold">{safeArray(behaviorSummary?.write_files).length}</p></div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Top String Categories</h3>
                    {stringCategories.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No categorized strings available.</p>
                    ) : (
                      <div className="space-y-2">
                        {stringCategories.slice(0, 6).map((cat) => (
                          <div key={cat.category} className="rounded-md border border-[#1a1a1a] bg-black/20 p-2">
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-foreground break-all mr-2">{cat.category}</p>
                              <p className="text-xs text-muted-foreground">{cat.count}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "behavior" && (
              <div className="space-y-6">
                <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <GitBranch className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Process Tree Graph</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">Node hierarchy built from parsed behavior.processtree.</p>

                  {processTreeNodes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No process tree data available.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <div className="min-w-[680px] space-y-3">
                        {processTreeNodes.map((node: any) => (
                          <ProcessTreeNode key={node.id} node={node} isRoot />
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
                      renderItem={(proc: any, idx: number) => (
                        <div key={`${proc?.pid || idx}-${idx}`} className="rounded-lg border border-[#1a1a1a] bg-black/20 p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground break-all">{proc?.name}</p>
                              <p className="text-xs text-muted-foreground mt-1 break-all">{proc?.path || "No module path"}</p>
                              <div className="mt-2 flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                                <span className="px-1.5 py-0.5 rounded bg-muted/20">PID: {proc?.pid ?? "-"}</span>
                                {proc?.parentId != null && <span className="px-1.5 py-0.5 rounded bg-muted/20">Parent: {proc.parentId}</span>}
                                {proc?.firstSeen && <span className="px-1.5 py-0.5 rounded bg-muted/20">First seen: {proc.firstSeen}</span>}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="rounded-md border border-[#1a1a1a] px-2 py-1.5 text-center"><p className="text-muted-foreground">Threads</p><p className="text-white font-semibold">{proc.threadCount}</p></div>
                              <div className="rounded-md border border-[#1a1a1a] px-2 py-1.5 text-center"><p className="text-muted-foreground">API Calls</p><p className="text-white font-semibold">{proc.callCount}</p></div>
                            </div>
                          </div>

                          {proc?.commandLine && (
                            <div className="mt-3 rounded-md border border-[#1a1a1a] bg-black/20 p-2">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Command line</p>
                              <p className="text-xs font-mono text-foreground break-all">{proc.commandLine}</p>
                            </div>
                          )}

                          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="rounded-md border border-[#1a1a1a] p-2">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Top APIs</p>
                              {safeArray(proc?.topApis).length === 0 ? (
                                <p className="text-xs text-muted-foreground">No API calls captured</p>
                              ) : (
                                <div className="space-y-1">
                                  {safeArray(proc?.topApis).map((api: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between text-xs">
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
                                <p className="text-foreground">User: <span className="text-muted-foreground">{proc?.username || "N/A"}</span></p>
                                <p className="text-foreground">Host: <span className="text-muted-foreground">{proc?.computerName || "N/A"}</span></p>
                                <p className="text-foreground">Bitness: <span className="text-muted-foreground">{proc?.bitness || "N/A"}</span></p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                            <div className="rounded-md border border-[#1a1a1a] p-2"><p className="text-muted-foreground mb-1">Read files</p><p className="text-foreground font-semibold">{safeArray(proc?.readFiles).length}</p></div>
                            <div className="rounded-md border border-[#1a1a1a] p-2"><p className="text-muted-foreground mb-1">Write files</p><p className="text-foreground font-semibold">{safeArray(proc?.writeFiles).length}</p></div>
                            <div className="rounded-md border border-[#1a1a1a] p-2"><p className="text-muted-foreground mb-1">Delete files</p><p className="text-foreground font-semibold">{safeArray(proc?.deleteFiles).length}</p></div>
                          </div>
                        </div>
                      )}
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Executed Commands</h3>
                    <ProgressiveList
                      items={safeArray(behaviorSummary?.executed_commands)}
                      initialCount={10}
                      step={10}
                      className="space-y-2"
                      renderItem={(cmd: string, idx: number) => (
                        <div key={idx} className="rounded-md border border-[#1a1a1a] bg-black/20 p-2 text-xs font-mono text-foreground break-all">
                          {cmd}
                        </div>
                      )}
                    />
                  </div>

                  <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Registry Keys</h3>
                    <ProgressiveList
                      items={safeArray(behaviorSummary?.keys)}
                      initialCount={12}
                      step={12}
                      className="space-y-2"
                      renderItem={(key: string, idx: number) => (
                        <div key={idx} className="rounded-md border border-[#1a1a1a] bg-black/20 p-2 text-xs font-mono text-foreground break-all">
                          {key}
                        </div>
                      )}
                    />
                  </div>
                </div>
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
                    initialCount={12}
                    step={12}
                    className="space-y-3"
                    renderItem={(sig: any, idx: number) => {
                      const cls = sig.severityClass === "high"
                        ? "text-red-400 bg-red-500/10 border-red-500/25"
                        : sig.severityClass === "medium"
                        ? "text-amber-400 bg-amber-500/10 border-amber-500/25"
                        : "text-green-400 bg-green-500/10 border-green-500/25"
                      return (
                        <div key={idx} className="rounded-lg border border-[#1a1a1a] bg-black/20 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground">{sig?.name || "Unnamed signature"}</p>
                              <p className="text-xs text-muted-foreground mt-1">{sig?.description || "No description"}</p>
                              {safeArray(sig?.ttp).length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {safeArray(sig?.ttp).slice(0, 4).map((ttp: any, tIdx: number) => (
                                    <span key={tIdx} className="text-[11px] px-1.5 py-0.5 rounded bg-muted/20 text-muted-foreground">
                                      {String(ttp)}
                                    </span>
                                  ))}
                                </div>
                              )}
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

            {activeTab === "strings" && (
              <div className="space-y-6">
                <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search string value or category"
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#1a1a1a] bg-black/20 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatTile icon={<Type className="w-3.5 h-3.5" />} label="Total Strings" value={sections?.strings?.metadata?.total_strings_processed || 0} />
                    <StatTile icon={<BarChart3 className="w-3.5 h-3.5" />} label="Categories" value={stringCategories.length} />
                    <StatTile icon={<Hash className="w-3.5 h-3.5" />} label="Filtered Hits" value={filteredStrings.length} />
                    <StatTile icon={<Database className="w-3.5 h-3.5" />} label="Entropy" value={sections?.strings?.metadata?.average_entropy || "N/A"} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Categories</h3>
                    <ProgressiveList
                      items={stringCategories}
                      initialCount={12}
                      step={12}
                      className="space-y-2"
                      renderItem={(cat, idx) => (
                        <div key={idx} className="rounded-md border border-[#1a1a1a] bg-black/20 p-2">
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-foreground break-all mr-2">{cat.category}</p>
                            <p className="text-xs text-muted-foreground">{cat.count}</p>
                          </div>
                          {cat.samples.length > 0 && (
                            <p className="text-[11px] text-muted-foreground mt-1 break-all">{String(cat.samples[0])}</p>
                          )}
                        </div>
                      )}
                    />
                  </div>

                  <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Extracted Values</h3>
                    {filteredStrings.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No strings match current query.</p>
                    ) : (
                      <ProgressiveList
                        items={filteredStrings}
                        initialCount={18}
                        step={18}
                        className="space-y-2"
                        renderItem={(row, idx) => (
                          <div key={idx} className="rounded-md border border-[#1a1a1a] bg-black/20 p-2">
                            <p className="text-[11px] text-primary mb-1">{row.category}</p>
                            <p className="text-xs text-foreground break-all">{row.value}</p>
                          </div>
                        )}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "memory" && (
              <div className="space-y-6">
                <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatTile icon={<MemoryStick className="w-3.5 h-3.5" />} label="Proc Memory" value={memoryEntries.length} />
                    <StatTile icon={<FileCode className="w-3.5 h-3.5" />} label="Extracted PE" value={memoryEntries.reduce((acc, m) => acc + numberOrZero(m.extractedPE), 0)} />
                    <StatTile icon={<AlertTriangle className="w-3.5 h-3.5" />} label="Susp Regions" value={memoryEntries.reduce((acc, m) => acc + numberOrZero(m.suspiciousRegions), 0)} />
                    <StatTile icon={<Folder className="w-3.5 h-3.5" />} label="Payloads" value={safeArray(sections?.cape?.payloads).length} />
                  </div>
                </div>

                <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Process Memory Entries</h3>
                  {memoryEntries.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No process memory information available.</p>
                  ) : (
                    <ProgressiveList
                      items={memoryEntries}
                      initialCount={10}
                      step={10}
                      className="space-y-3"
                      renderItem={(entry, idx) => (
                        <div key={idx} className="rounded-lg border border-[#1a1a1a] bg-black/20 p-3">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <p className="text-sm font-semibold text-foreground break-all">{entry.name}</p>
                            <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted/20 text-muted-foreground">PID {entry.pid ?? "-"}</span>
                            <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted/20 text-muted-foreground">{entry.size}</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs mb-2">
                            <div className="rounded-md border border-[#1a1a1a] p-2"><p className="text-muted-foreground">Extracted PE</p><p className="text-foreground font-semibold">{entry.extractedPE}</p></div>
                            <div className="rounded-md border border-[#1a1a1a] p-2"><p className="text-muted-foreground">Suspicious Regions</p><p className="text-foreground font-semibold">{entry.suspiciousRegions}</p></div>
                          </div>
                          <HashRow label="SHA256" value={entry.sha256} />
                        </div>
                      )}
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
                    <h3 className="text-sm font-semibold text-foreground">Parsed Network Intelligence</h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <StatTile icon={<Globe className="w-3.5 h-3.5" />} label="Hosts" value={networkSection.summary.totalHosts} />
                    <StatTile icon={<Globe className="w-3.5 h-3.5" />} label="Domains" value={networkSection.summary.totalDomains} />
                    <StatTile icon={<Activity className="w-3.5 h-3.5" />} label="HTTP" value={networkSection.summary.totalHttp} />
                    <StatTile icon={<Activity className="w-3.5 h-3.5" />} label="DNS" value={networkSection.summary.totalDns} />
                    <StatTile icon={<AlertTriangle className="w-3.5 h-3.5" />} label="Failed Conn" value={networkSection.failedConnections.length} />
                  </div>

                  <div className="mt-3 text-xs text-muted-foreground">
                    PCAP Available: <span className="text-foreground font-medium">{networkSection.summary.hasPcap ? "Yes" : "No"}</span>
                  </div>
                </div>

                <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      value={networkQuery}
                      onChange={(e) => setNetworkQuery(e.target.value)}
                      placeholder="Search domain, HTTP host/path, DNS query"
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#1a1a1a] bg-black/20 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-lg border border-[#1a1a1a] bg-black/20 p-3">
                      <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Suspicious Domains</h4>
                      {networkSection.suspiciousDomains.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No suspicious domains listed.</p>
                      ) : (
                        <ProgressiveList
                          items={networkSection.suspiciousDomains}
                          initialCount={12}
                          step={12}
                          className="space-y-2"
                          renderItem={(domain: string, idx: number) => (
                            <div key={idx} className="rounded-md border border-[#1a1a1a] bg-black/20 p-2 text-xs text-foreground break-all">
                              {domain}
                            </div>
                          )}
                        />
                      )}
                    </div>

                    <div className="rounded-lg border border-[#1a1a1a] bg-black/20 p-3">
                      <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Failed Connections</h4>
                      {networkSection.failedConnections.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No failed connection entries.</p>
                      ) : (
                        <ProgressiveList
                          items={networkSection.failedConnections}
                          initialCount={8}
                          step={8}
                          className="space-y-2"
                          renderItem={(conn: any, idx: number) => (
                            <div key={idx} className="rounded-md border border-[#1a1a1a] bg-black/20 p-2 text-xs">
                              <p className="text-foreground">{conn?.ip || "N/A"}:{conn?.port ?? "-"}</p>
                              <p className="text-muted-foreground">failed: {conn?.failed ? "true" : "false"}</p>
                            </div>
                          )}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Top TLD Distribution</h3>
                    {networkSection.topTlds.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No domain TLD data available.</p>
                    ) : (
                      <div className="space-y-2">
                        {networkSection.topTlds.map((row: any, idx: number) => {
                          const max = networkSection.topTlds[0]?.count || 1
                          const width = Math.max((row.count / max) * 100, 4)
                          return (
                            <div key={idx} className="rounded-md border border-[#1a1a1a] bg-black/20 p-2">
                              <div className="flex items-center justify-between mb-1 text-xs">
                                <p className="text-foreground">.{row.tld}</p>
                                <p className="text-muted-foreground">{row.count}</p>
                              </div>
                              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                                <div className="h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-3">HTTP Method Distribution</h3>
                    {networkSection.topMethods.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No HTTP method data available.</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {networkSection.topMethods.map((row: any, idx: number) => (
                          <div key={idx} className="rounded-md border border-[#1a1a1a] bg-black/20 p-2 text-center">
                            <p className="text-white font-semibold text-sm">{row.method}</p>
                            <p className="text-xs text-muted-foreground">{row.count}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Domains</h3>
                    <ProgressiveList
                      items={filteredNetwork.domains}
                      initialCount={16}
                      step={16}
                      className="space-y-2"
                      renderItem={(domain: any, idx: number) => (
                        <div key={idx} className="rounded-md border border-[#1a1a1a] bg-black/20 p-2 text-xs">
                          <p className="text-foreground break-all">{domain?.domain || "N/A"}</p>
                          <p className="text-muted-foreground">TLD: {domain?.tld || "unknown"}</p>
                        </div>
                      )}
                    />
                  </div>

                  <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-3">HTTP Requests</h3>
                    <ProgressiveList
                      items={filteredNetwork.httpRequests}
                      initialCount={12}
                      step={12}
                      className="space-y-2"
                      renderItem={(req: any, idx: number) => (
                        <div key={idx} className="rounded-md border border-[#1a1a1a] bg-black/20 p-2 text-xs">
                          <p className="text-foreground font-medium break-all">{req?.method || "GET"} {req?.path || "/"}</p>
                          <p className="text-muted-foreground break-all">{req?.host || "unknown-host"}</p>
                          <p className="text-muted-foreground">count: {req?.count ?? 1}</p>
                        </div>
                      )}
                    />
                  </div>

                  <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-3">DNS Queries</h3>
                    <ProgressiveList
                      items={filteredNetwork.dnsQueries}
                      initialCount={12}
                      step={12}
                      className="space-y-2"
                      renderItem={(dns: any, idx: number) => (
                        <div key={idx} className="rounded-md border border-[#1a1a1a] bg-black/20 p-2 text-xs">
                          <p className="text-foreground break-all">{dns?.query || "N/A"}</p>
                          <p className="text-muted-foreground">type: {dns?.type || "A"} • answers: {safeArray(dns?.answers).length}</p>
                          {dns?.no_answer && <p className="text-amber-300">no answer</p>}
                        </div>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "static" && (
              <div className="space-y-6">
                <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <File className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Target File</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="rounded-md border border-[#1a1a1a] p-3"><p className="text-xs text-muted-foreground uppercase">Name</p><p className="text-white mt-1 break-all">{target.name}</p></div>
                    <div className="rounded-md border border-[#1a1a1a] p-3"><p className="text-xs text-muted-foreground uppercase">Type</p><p className="text-white mt-1">{target.type}</p></div>
                    <div className="rounded-md border border-[#1a1a1a] p-3"><p className="text-xs text-muted-foreground uppercase">Size</p><p className="text-white mt-1">{target.size}</p></div>
                  </div>
                  <div className="space-y-1 mt-3">
                    <HashRow label="SHA256" value={target.sha256} />
                    <HashRow label="SHA1" value={target.sha1} />
                    <HashRow label="MD5" value={target.md5} />
                    <HashRow label="SSDEEP" value={target.ssdeep} />
                    <HashRow label="IMPHASH" value={target.imphash} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-3">PE Structure</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-md border border-[#1a1a1a] p-2"><p className="text-muted-foreground">Imported DLLs</p><p className="text-foreground font-semibold">{peStructure.importedDlls.length}</p></div>
                      <div className="rounded-md border border-[#1a1a1a] p-2"><p className="text-muted-foreground">Sections</p><p className="text-foreground font-semibold">{peStructure.sections.length}</p></div>
                      <div className="rounded-md border border-[#1a1a1a] p-2"><p className="text-muted-foreground">Resources</p><p className="text-foreground font-semibold">{peStructure.resources.length}</p></div>
                      <div className="rounded-md border border-[#1a1a1a] p-2"><p className="text-muted-foreground">Directories</p><p className="text-foreground font-semibold">{peStructure.directories.length}</p></div>
                    </div>
                    {(peStructure.entryPoint || peStructure.compileTime) && (
                      <div className="mt-3 space-y-1 text-xs">
                        {peStructure.entryPoint && <p className="text-foreground">Entry Point: <span className="text-muted-foreground">{String(peStructure.entryPoint)}</span></p>}
                        {peStructure.compileTime && <p className="text-foreground">Compile Time: <span className="text-muted-foreground">{String(peStructure.compileTime)}</span></p>}
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Imports Sample</h3>
                    {peStructure.importedDlls.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No imported DLL list available.</p>
                    ) : (
                      <ProgressiveList
                        items={peStructure.importedDlls}
                        initialCount={14}
                        step={14}
                        className="space-y-2"
                        renderItem={(dll: any, idx: number) => (
                          <div key={idx} className="rounded-md border border-[#1a1a1a] bg-black/20 p-2 text-xs text-foreground break-all">
                            {String(dll?.dll || dll?.name || dll)}
                          </div>
                        )}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "raw" && (
              <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4">
                <CustomJSONViewer data={data} mode="pretty" />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
