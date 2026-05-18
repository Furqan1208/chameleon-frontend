"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Activity,
  AlertTriangle,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Copy,
  Cpu,
  Database,
  Download,
  Eye,
  EyeOff,
  FileJson,
  FileText,
  FolderTree,
  Globe,
  Hash,
  Layers,
  MemoryStick,
  Network,
  Search,
  Shield,
  Terminal,
  TrendingUp,
  Type,
  Wifi,
  WifiOff,
  Zap,
  Lock,
  Unlock,
  Fingerprint,
  Server,
  Box,
  FileCode,
  GitBranch,
  Key,
  PieChart,
  Clock,
  Calendar,
  HardDrive,
  Link,
  Mail,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Menu,
  X,
} from "lucide-react"
import {
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  Treemap,
} from "recharts"

interface ParsedAnalysisDashboardProps {
  data: any
  loading?: boolean
  onCopyJson?: () => void
  copied?: boolean
  onDownload?: (format: string) => void
}

type TabId = "overview" | "target" | "behavior" | "signatures" | "memory" | "network" | "cape" | "strings" | "raw"

// Utility functions
const safeArray = <T = any,>(value: any): T[] => Array.isArray(value) ? value : []
const safeObject = (value: any): Record<string, any> => value && typeof value === "object" ? value : {}
const safeNumber = (value: any, defaultValue = 0): number => {
  const n = Number(value)
  return isNaN(n) ? defaultValue : n
}

const formatBytes = (bytes?: number | string): string => {
  const n = typeof bytes === "string" ? parseInt(bytes, 10) : bytes
  if (!n || isNaN(n)) return "N/A"
  const units = ["B", "KB", "MB", "GB", "TB"]
  const idx = Math.min(Math.floor(Math.log(n) / Math.log(1024)), units.length - 1)
  return `${(n / Math.pow(1024, idx)).toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`
}

const formatTimestamp = (timestamp?: string | number): string => {
  if (!timestamp) return "N/A"
  if (typeof timestamp === "string" && timestamp.includes("-")) return timestamp
  const date = new Date(timestamp)
  return isNaN(date.getTime()) ? String(timestamp) : date.toLocaleString()
}

const truncate = (str: string, maxLen = 80): string => {
  if (!str) return ""
  return str.length > maxLen ? `${str.slice(0, maxLen)}...` : str
}

// Sanitize displayed text: remove common emoji and control characters
const sanitizeText = (input: any): string => {
  if (input === null || input === undefined) return ""
  const str = String(input)
  // remove surrogate-pair emoji ranges and variation selectors
  return str.replace(/[\u2700-\u27BF\uE000-\uF8FF\u2600-\u26FF\uFE00-\uFE0F]|[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "").replace(/[\x00-\x1F\x7F]/g, "").trim()
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

const sectionCardClass = "rounded-3xl border border-border/80 bg-card/80 backdrop-blur-sm shadow-[0_18px_50px_-36px_rgba(16,185,129,0.22)]"
const innerSurfaceClass = "rounded-2xl border border-border/70 bg-background/35 backdrop-blur-sm"
const chipClass = "inline-flex items-center rounded-full border border-emerald-500/15 bg-emerald-500/8 px-3 py-1 text-xs font-medium text-emerald-200"

// Severity colors
const severityConfig = {
  3: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", badge: "bg-red-500/20 text-red-400", icon: <AlertCircle className="w-3 h-3" /> },
  2: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", badge: "bg-amber-500/20 text-amber-400", icon: <AlertTriangle className="w-3 h-3" /> },
  1: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400", badge: "bg-blue-500/20 text-blue-400", icon: <Info className="w-3 h-3" /> },
  0: { bg: "bg-slate-500/10", border: "border-slate-500/30", text: "text-slate-400", badge: "bg-slate-500/20 text-slate-400", icon: <Info className="w-3 h-3" /> },
}

// Components
const StatCard = ({ icon, label, value, subValue, color = "primary", trend }: { icon: React.ReactNode; label: string; value: string | number; subValue?: string; color?: string; trend?: { value: number; label: string } }) => (
  <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-[0_18px_50px_-36px_rgba(16,185,129,0.18)] backdrop-blur-sm">
    <div className="mb-2 flex items-center justify-between gap-3">
      <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
      <span className={`flex h-8 w-8 items-center justify-center rounded-lg border border-${color}/15 bg-${color}/10 text-${color}`}>{icon}</span>
    </div>
    <p className="text-2xl font-bold text-foreground">{value}</p>
    {subValue && <p className="mt-1 text-xs text-muted-foreground">{subValue}</p>}
    {trend && (
      <div className="mt-2 flex items-center gap-1">
        {trend.value >= 0 ? <TrendingUp className="h-3 w-3 text-green-400" /> : <TrendingDown className="h-3 w-3 text-red-400" />}
        <span className={`text-xs ${trend.value >= 0 ? "text-green-400" : "text-red-400"}`}>{Math.abs(trend.value)}%</span>
        <span className="text-xs text-muted-foreground">{trend.label}</span>
      </div>
    )}
  </div>
)

const TrendingDown = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    <polyline points="17 18 23 18 23 12" />
  </svg>
)

const SeverityBadge = ({ severity }: { severity: number }) => {
  const config = severityConfig[severity as keyof typeof severityConfig] || severityConfig[0]
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 ${config.bg} ${config.border} ${config.text}`}>
      {config.icon}
      S{severity}
    </span>
  )
}

const HashRow = ({ value, label }: { value?: string; label: string }) => {
  if (!value) return null
  return (
    <div className={`${innerSurfaceClass} flex items-center gap-2 p-2 group`}>
      <Hash className="w-3 h-3 text-muted-foreground shrink-0" />
      <span className="text-[10px] text-muted-foreground uppercase w-12 shrink-0">{label}</span>
      <code className="text-xs text-foreground flex-1 break-all font-mono">{value}</code>
      <button onClick={() => navigator.clipboard.writeText(value)} className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted/20 shrink-0">
        <Copy className="w-3 h-3" />
      </button>
    </div>
  )
}

const ExpandableSection = ({ title, items, renderItem, initialCount = 8, step = 8, emptyMessage = "No items" }: { title: string; items: any[]; renderItem: (item: any, idx: number) => React.ReactNode; initialCount?: number; step?: number; emptyMessage?: string }) => {
  const [expanded, setExpanded] = useState(false)
  const visibleItems = expanded ? items : items.slice(0, initialCount)
  const hasMore = items.length > initialCount

  if (items.length === 0) return null

  return (
    <div className={`${sectionCardClass} p-4`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="text-xs text-muted-foreground">{items.length} total</span>
      </div>
      <div className="space-y-2">
        {visibleItems.map((item, idx) => renderItem(item, idx))}
      </div>
      {hasMore && (
        <button onClick={() => setExpanded(!expanded)} className="mt-3 text-xs text-emerald-300 hover:text-emerald-200 transition-colors flex items-center gap-1">
          {expanded ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? "Show less" : `Show ${Math.min(step, items.length - initialCount)} more (${items.length - initialCount} left)`}
        </button>
      )}
    </div>
  )
}

const ProcessTreeNode = ({ node, depth = 0, expandedNodes, toggleNode }: { node: any; depth: number; expandedNodes: Set<string>; toggleNode: (id: string) => void }) => {
  const nodeId = `${node.pid || node.name}-${depth}`
  const isExpanded = expandedNodes.has(nodeId)
  const hasChildren = node.children && node.children.length > 0

  return (
    <div className="relative">
      <div 
        className={`flex items-center gap-2 p-2 rounded-2xl border border-transparent hover:border-border/60 hover:bg-background/35 transition-colors cursor-pointer ${depth > 0 ? "ml-6" : ""}`}
        onClick={() => hasChildren && toggleNode(nodeId)}
      >
        <div style={{ width: `${depth * 20}px` }} className="shrink-0" />
        {hasChildren && (
          <div className="shrink-0">
            {isExpanded ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
          </div>
        )}
        {!hasChildren && <div className="w-4 shrink-0" />}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-primary">{node.pid || "?"}</span>
          <span className="text-sm font-medium text-foreground">{node.name || "Unknown"}</span>
          {node.environ?.CommandLine && (
            <span className="text-[10px] text-muted-foreground truncate max-w-md font-mono">
              {truncate(node.environ.CommandLine, 50)}
            </span>
          )}
          {node.module_path && (
            <span className="text-[10px] text-muted-foreground">{truncate(node.module_path, 40)}</span>
          )}
        </div>
      </div>
      {isExpanded && hasChildren && (
        <div className="border-l border-border/50 ml-5">
          {node.children.map((child: any, idx: number) => (
            <ProcessTreeNode key={idx} node={child} depth={depth + 1} expandedNodes={expandedNodes} toggleNode={toggleNode} />
          ))}
        </div>
      )}
    </div>
  )
}

// Main Component
export default function ParsedAnalysisDashboard({ data, loading = false, onCopyJson, copied = false, onDownload }: ParsedAnalysisDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [expandedProcesses, setExpandedProcesses] = useState<Set<number>>(new Set())

  // Extract sections
  const sections = useMemo(() => {
    const s = data?.sections || data || {}
    return {
      target: s.target?.ai_summary || s.target,
      behavior: s.behavior?.ai_summary || s.behavior,
      signatures: s.signatures?.ai_summary || s.signatures,
      memory: s.memory?.ai_summary || s.memory,
      network: s.network?.ai_summary || s.network,
      cape: s.cape?.ai_summary || s.cape,
      strings: s.strings,
      info: s.info?.summary || s.info,
      statistics: s.statistics,
    }
  }, [data])

  // Target section
  const target = useMemo(() => ({
    sha256: sections.target?.sha256,
    md5: sections.target?.md5,
    file_name: sections.target?.file_name || "Unknown",
    file_size: sections.target?.file_size,
    file_type: sections.target?.file_type,
    cape_type: sections.target?.cape_type,
    detected_families: safeArray(sections.target?.detected_families),
    is_signed: sections.target?.is_signed || false,
    signers: safeArray(sections.target?.signers),
    is_dotnet: sections.target?.is_dotnet || false,
    is_packed: sections.target?.is_packed || false,
    is_obfuscated: sections.target?.is_obfuscated || false,
    imphash: sections.target?.imphash,
    compile_timestamp: sections.target?.compile_timestamp,
    entrypoint: sections.target?.entrypoint,
    high_entropy_sections: safeArray(sections.target?.high_entropy_sections),
    critical_yara_rules: safeArray(sections.target?.critical_yara_rules),
    company_name: sections.target?.company_name,
    product_name: sections.target?.product_name,
    original_filename: sections.target?.original_filename,
    has_self_extract: sections.target?.has_self_extract || false,
    self_extract_method: sections.target?.self_extract_method,
    extracted_files_count: sections.target?.extracted_files_count || 0,
    infected_processes: sections.target?.infected_processes || {},
    die_info: safeArray(sections.target?.die_info),
  }), [sections.target])

  // Behavior section
  const behavior = useMemo(() => ({
    total_processes: sections.behavior?.total_processes || 0,
    total_api_calls: sections.behavior?.total_api_calls || 0,
    suspicious_processes: safeArray(sections.behavior?.suspicious_processes),
    processtree: safeArray(sections.behavior?.processtree),
    call_stats: safeArray(sections.behavior?.call_stats),
    files_accessed: safeArray(sections.behavior?.files_accessed),
    files_written: safeArray(sections.behavior?.files_written),
    files_deleted: safeArray(sections.behavior?.files_deleted),
    executed_commands: safeArray(sections.behavior?.executed_commands),
    resolved_apis: safeArray(sections.behavior?.resolved_apis),
    mutexes: safeArray(sections.behavior?.mutexes),
    anomalies: safeArray(sections.behavior?.anomalies),
    keys_summary: sections.behavior?.keys_summary,
    read_keys_summary: sections.behavior?.read_keys_summary,
    quick_summary: sections.behavior?.quick_summary,
  }), [sections.behavior])

  // Signatures section
  const signatures = useMemo(() => ({
    malscore: sections.signatures?.malscore || 0,
    malstatus: sections.signatures?.malstatus || "unknown",
    total_signatures: sections.signatures?.total_signatures || 0,
    critical_signatures: sections.signatures?.critical_signatures || 0,
    suspicious_signatures: sections.signatures?.suspicious_signatures || 0,
    high_severity_signatures: safeArray(sections.signatures?.high_severity_signatures),
    medium_severity_signatures: safeArray(sections.signatures?.medium_severity_signatures),
    detected_ttps: safeArray(sections.signatures?.detected_ttps),
    domains: safeArray(sections.signatures?.domains),
    ips: safeArray(sections.signatures?.ips),
    commands: safeArray(sections.signatures?.commands),
    has_anti_debug: sections.signatures?.has_anti_debug || false,
    has_anti_vm: sections.signatures?.has_anti_vm || false,
    has_persistence: sections.signatures?.has_persistence || false,
    has_injection: sections.signatures?.has_injection || false,
    has_info_stealer: sections.signatures?.has_info_stealer || false,
    top_categories: sections.signatures?.top_categories || {},
    quick_summary: sections.signatures?.quick_summary,
  }), [sections.signatures])

  // Memory section
  const memory = useMemo(() => ({
    total_procdump_files: sections.memory?.total_procdump_files || 0,
    total_dropped_files: sections.memory?.total_dropped_files || 0,
    total_memory_dumps: sections.memory?.total_memory_dumps || 0,
    procdump_pe_count: sections.memory?.procdump_pe_count || 0,
    procdump_malware_families: safeArray(sections.memory?.procdump_malware_families),
    memory_dumps_with_yara: sections.memory?.memory_dumps_with_yara || 0,
    memory_shellcode_detected: sections.memory?.memory_shellcode_detected || false,
    memory_injection_detected: sections.memory?.memory_injection_detected || false,
    extracted_pe_from_memory_count: sections.memory?.extracted_pe_from_memory_count || 0,
    critical_malware_rules: safeArray(sections.memory?.critical_malware_rules),
    memory_dump_processes: safeArray(sections.memory?.memory_dump_processes),
    dropped_notable_files: safeArray(sections.memory?.dropped_notable_files),
    quick_summary: sections.memory?.quick_summary,
  }), [sections.memory])

  // Network section
  const network = useMemo(() => ({
    domains: safeArray(sections.network?.domains),
    ips: safeArray(sections.network?.ips),
    dns_queries: safeArray(sections.network?.dns_queries),
    http_requests: safeArray(sections.network?.http_requests),
    dead_hosts: safeArray(sections.network?.dead_hosts),
    contacted_countries: safeArray(sections.network?.contacted_countries),
    total_tcp_connections: sections.network?.total_tcp_connections || 0,
    total_udp_connections: sections.network?.total_udp_connections || 0,
    has_suspicious_domains: sections.network?.has_suspicious_domains || false,
    suspicious_domain_keywords: safeArray(sections.network?.suspicious_domain_keywords),
    has_dns_traffic: sections.network?.has_dns_traffic || false,
    has_https_traffic: sections.network?.has_https_traffic || false,
    has_network_activity: sections.network?.has_network_activity || false,
    quick_summary: sections.network?.quick_summary,
  }), [sections.network])

  // CAPE section
  const cape = useMemo(() => ({
    detected_families: safeArray(sections.cape?.detected_families),
    total_payloads: sections.cape?.total_payloads || 0,
    payload_types: sections.cape?.payload_types || {},
    injection_processes: safeArray(sections.cape?.injection_processes),
    payload_examples: safeArray(sections.cape?.payload_examples),
    total_configs: sections.cape?.total_configs || 0,
    has_valid_configs: sections.cape?.has_valid_configs || false,
    c2_servers: safeArray(sections.cape?.c2_servers),
    config_indicators: sections.cape?.config_indicators || {},
    has_malware_config: sections.cape?.has_malware_config || false,
    has_dropped_files: sections.cape?.has_dropped_files || false,
    primary_injection_method: sections.cape?.primary_injection_method || "None",
    quick_summary: sections.cape?.quick_summary,
  }), [sections.cape])

  // Info section
  const info = useMemo(() => ({
    sandbox_platform: sections.info?.sandbox_platform || "unknown",
    analysis_type: sections.info?.analysis_type || "unknown",
    package_used: sections.info?.package_used || "unknown",
    execution_completion_status: sections.info?.execution_completion_status || "unknown",
    total_duration_seconds: sections.info?.total_duration_seconds || 0,
    timeout: sections.info?.timeout || false,
    machine_status: sections.info?.machine_status || "unknown",
  }), [sections.info])

  // String categories
  const stringCategories = useMemo(() => {
    const cats = sections.strings?.categories || {}
    return Object.entries(cats).map(([name, values]) => ({
      name,
      count: safeArray(values).length,
      samples: safeArray(values).slice(0, 5),
    })).sort((a, b) => b.count - a.count)
  }, [sections.strings])

  // Filtered data
  const filteredDomains = useMemo(() => {
    if (!searchQuery) return network.domains
    const q = searchQuery.toLowerCase()
    return network.domains.filter(d => d.toLowerCase().includes(q))
  }, [network.domains, searchQuery])

  const filteredCommands = useMemo(() => {
    if (!searchQuery) return behavior.executed_commands
    const q = searchQuery.toLowerCase()
    return behavior.executed_commands.filter(c => c.toLowerCase().includes(q))
  }, [behavior.executed_commands, searchQuery])

  const filteredSignatures = useMemo(() => {
    if (!searchQuery) return signatures.high_severity_signatures
    const q = searchQuery.toLowerCase()
    return signatures.high_severity_signatures.filter((s: any) => 
      s.name?.toLowerCase().includes(q) || s.categories?.some((c: string) => c.toLowerCase().includes(q))
    )
  }, [signatures.high_severity_signatures, searchQuery])

  // Chart data
  const severityChartData = useMemo(() => {
    const high = signatures.high_severity_signatures.length
    const medium = signatures.suspicious_signatures
    const low = signatures.total_signatures - high - medium
    return [
      { name: "High (3)", value: high, color: "#ef4444" },
      { name: "Medium (2)", value: medium, color: "#f59e0b" },
      { name: "Low (1)", value: low, color: "#3b82f6" },
    ].filter(d => d.value > 0)
  }, [signatures])

  const categoryChartData = useMemo(() => {
    return Object.entries(signatures.top_categories)
      .map(([name, count]) => ({ name, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [signatures.top_categories])

  const payloadTypeData = useMemo(() => {
    return Object.entries(cape.payload_types)
      .map(([name, count]) => ({ name, count: count as number }))
      .sort((a, b) => b.count - a.count)
  }, [cape.payload_types])

  const tldData = useMemo(() => {
    const tlds: Record<string, number> = {}
    network.domains.forEach(domain => {
      const parts = domain.split(".")
      const tld = parts.length > 1 ? parts[parts.length - 1] : "unknown"
      tlds[tld] = (tlds[tld] || 0) + 1
    })
    return Object.entries(tlds)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [network.domains])

  const processApiData = useMemo(() => {
    return behavior.call_stats.slice(0, 6).map((stat: any) => ({
      name: stat.process_name || `PID ${stat.process_id}`,
      calls: stat.total_calls || 0,
      apis: Object.keys(stat.category_stats || {}).length,
    }))
  }, [behavior.call_stats])

  // Toggle functions
  const toggleProcessNode = (nodeId: string) => {
    const newSet = new Set(expandedNodes)
    if (newSet.has(nodeId)) newSet.delete(nodeId)
    else newSet.add(nodeId)
    setExpandedNodes(newSet)
  }

  const toggleProcessExpand = (pid: number) => {
    const newSet = new Set(expandedProcesses)
    if (newSet.has(pid)) newSet.delete(pid)
    else newSet.add(pid)
    setExpandedProcesses(newSet)
  }

  // Initial expand root nodes
  useEffect(() => {
    const rootIds = behavior.processtree.map((node: any, idx: number) => `${node.pid || node.name}-0-${idx}`)
    setExpandedNodes(new Set(rootIds))
  }, [behavior.processtree])

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="p-5 rounded-full bg-muted/20 mb-5">
          <FileJson className="w-14 h-14 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-lg">No parsed data available</p>
        <p className="text-sm text-muted-foreground mt-1">Run a CAPE report through the parser first</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative">
          <div className="w-14 h-14 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-primary rounded-full animate-pulse" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-5">Parsing analysis data...</p>
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
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary font-semibold">Parsed Intelligence Surface</p>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Structured Analysis Report</h2>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-muted-foreground">{target.file_name}</p>
            <span className="text-xs text-muted-foreground">{formatBytes(target.file_size)}</span>
            {target.cape_type && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{target.cape_type.split(":")[0]}</span>}
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

      {/* Tabs */}
      <div className="rounded-2xl border border-border/80 bg-card/75 p-1.5 overflow-x-auto backdrop-blur-sm">
        <div className="flex min-w-max gap-0.5">
          {[
            { id: "overview", label: "Overview", icon: <Layers className="w-4 h-4" /> },
            { id: "target", label: "Target", icon: <FileText className="w-4 h-4" /> },
            { id: "behavior", label: "Behavior", icon: <Activity className="w-4 h-4" /> },
            { id: "signatures", label: "Signatures", icon: <Shield className="w-4 h-4" /> },
            { id: "memory", label: "Memory", icon: <MemoryStick className="w-4 h-4" /> },
            { id: "network", label: "Network", icon: <Globe className="w-4 h-4" /> },
            { id: "cape", label: "CAPE", icon: <Box className="w-4 h-4" /> },
            { id: "strings", label: "Strings", icon: <Type className="w-4 h-4" /> },
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

      {/* Search Bar for applicable tabs */}
      {(activeTab === "behavior" || activeTab === "signatures" || activeTab === "network" || activeTab === "strings") && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab}...`}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-border/80 bg-card/75 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-all backdrop-blur-sm"
          />
        </div>
      )}

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <div key={activeTab} className="space-y-6">
          
          {/* ==================== OVERVIEW TAB ==================== */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                <StatCard icon={<Shield className="w-4 h-4" />} label="MalScore" value={signatures.malscore.toFixed(1)} subValue={`/ 10`} color={signatures.malscore >= 7 ? "red" : signatures.malscore >= 4 ? "amber" : "green"} />
                <StatCard icon={<AlertTriangle className="w-4 h-4" />} label="Status" value={signatures.malstatus} color={signatures.malstatus === "Malicious" ? "red" : "amber"} />
                <StatCard icon={<Cpu className="w-4 h-4" />} label="Processes" value={behavior.total_processes} />
                <StatCard icon={<Shield className="w-4 h-4" />} label="Signatures" value={signatures.total_signatures} />
                <StatCard icon={<Activity className="w-4 h-4" />} label="API Calls" value={behavior.total_api_calls.toLocaleString()} />
                <StatCard icon={<Globe className="w-4 h-4" />} label="Domains" value={network.domains.length} />
                <StatCard icon={<MemoryStick className="w-4 h-4" />} label="Memory Dumps" value={memory.total_memory_dumps} />
              </div>

              {/* Info Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`${sectionCardClass} p-5`}>
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Analysis Info</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-muted-foreground">Platform:</span> <span className="text-foreground">{info.sandbox_platform}</span></div>
                    <div><span className="text-muted-foreground">Package:</span> <span className="text-foreground">{info.package_used}</span></div>
                    <div><span className="text-muted-foreground">Duration:</span> <span className="text-foreground">{info.total_duration_seconds}s</span></div>
                    <div><span className="text-muted-foreground">Timeout:</span> <span className={info.timeout ? "text-amber-400" : "text-green-400"}>{info.timeout ? "Yes" : "No"}</span></div>
                    <div><span className="text-muted-foreground">Status:</span> <span className={info.execution_completion_status === "Completed" ? "text-green-400" : "text-amber-400"}>{info.execution_completion_status}</span></div>
                    <div><span className="text-muted-foreground">Machine:</span> <span className="text-foreground">{info.machine_status}</span></div>
                  </div>
                </div>

                <div className={`${sectionCardClass} p-5`}>
                  <div className="flex items-center gap-2 mb-4">
                    <Fingerprint className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Detected Families</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[...target.detected_families, ...cape.detected_families].filter((v, i, a) => a.indexOf(v) === i).slice(0, 8).map((family, idx) => (
                      <span key={idx} className="px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium">{family}</span>
                    ))}
                    {(target.detected_families.length + cape.detected_families.length) === 0 && (
                      <span className="text-muted-foreground text-sm">No families detected</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Severity Distribution */}
                <div className={`${sectionCardClass} p-5`}>
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-sm font-semibold text-foreground">Signature Severity Distribution</h3>
                    </div>
                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                      {severityChartData.reduce((acc, item) => acc + item.value, 0)} total
                    </span>
                  </div>
                  {severityChartData.length > 0 ? (
                    <div className="space-y-4">
                    <div className="relative">
                      <ResponsiveContainer width="100%" height={260}>
                        <RePieChart>
                          <defs>
                            <linearGradient id="parsedSeverityCritical" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor={GREEN_CHART.darkest} />
                              <stop offset="100%" stopColor={GREEN_CHART.base} />
                            </linearGradient>
                            <linearGradient id="parsedSeverityMedium" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor={GREEN_CHART.dark} />
                              <stop offset="100%" stopColor={GREEN_CHART.light} />
                            </linearGradient>
                            <linearGradient id="parsedSeverityLow" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor={GREEN_CHART.light} />
                              <stop offset="100%" stopColor={GREEN_CHART.pale} />
                            </linearGradient>
                          </defs>
                          <Pie
                            data={severityChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={62}
                            outerRadius={94}
                            paddingAngle={4}
                            cornerRadius={12}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                            stroke="rgba(6, 78, 59, 0.9)"
                            strokeWidth={3}
                          >
                            {severityChartData.map((entry, idx) => (
                              <Cell
                                key={idx}
                                fill={idx === 0 ? "url(#parsedSeverityCritical)" : idx === 1 ? "url(#parsedSeverityMedium)" : "url(#parsedSeverityLow)"}
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<GreenTooltip valueFormatter={(value) => `${value} sigs`} />} />
                        </RePieChart>
                      </ResponsiveContainer>
                      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-200/70">Signature load</p>
                        <p className="mt-2 text-3xl font-bold text-foreground">{severityChartData.reduce((acc, item) => acc + item.value, 0)}</p>
                        <p className="text-xs text-muted-foreground">detected signatures</p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                      {severityChartData.map((item) => (
                        <div key={item.name} className="rounded-2xl border border-border bg-background/30 px-3 py-2">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-200/60">{item.name}</p>
                          <p className="mt-1 text-lg font-semibold text-foreground">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    </div>
                  ) : <div className="flex items-center justify-center h-[260px] text-muted-foreground">No signature data</div>}
                </div>

                {/* Top API Categories */}
                <div className={`${sectionCardClass} p-5`}>
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-sm font-semibold text-foreground">Top API Categories</h3>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.16em] text-emerald-300/80">Behavior focus</span>
                  </div>
                  {categoryChartData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={categoryChartData} layout="vertical" margin={{ top: 4, right: 18, left: 6, bottom: 4 }} barCategoryGap={16}>
                          <defs>
                            <linearGradient id="parsedApiCategoryBar" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor={GREEN_CHART.darkest} />
                              <stop offset="45%" stopColor={GREEN_CHART.dark} />
                              <stop offset="100%" stopColor={GREEN_CHART.light} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="4 4" stroke={GREEN_CHART.grid} horizontal={false} />
                          <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#a7f3d0" }} />
                          <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#d1fae5" }} width={84} />
                          <Tooltip content={<GreenTooltip valueFormatter={(value) => `${value} calls`} />} />
                          <Bar dataKey="count" fill="url(#parsedApiCategoryBar)" radius={[0, 12, 12, 0]} barSize={18} />
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        {categoryChartData.slice(0, 4).map((item) => (
                          <div key={item.name} className="rounded-2xl border border-border bg-background/30 px-3 py-2">
                            <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-200/60">{item.name}</p>
                            <p className="mt-1 text-lg font-semibold text-foreground">{item.count}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : <div className="flex items-center justify-center h-[260px] text-muted-foreground">No category data</div>}
                </div>
              </div>

              {/* Second Chart Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* TLD Distribution */}
                <div className={`${sectionCardClass} p-5`}>
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-sm font-semibold text-foreground">Domain TLD Distribution</h3>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.16em] text-emerald-300/80">Domain mix</span>
                  </div>
                  {tldData.length > 0 ? (
                    <div className="space-y-3">
                      {tldData.map((tld, idx) => {
                        const max = tldData[0]?.count || 1
                        const width = (tld.count / max) * 100
                        return (
                          <div key={idx} className="group rounded-2xl border border-border/60 bg-background/25 p-3 transition-colors hover:border-emerald-400/25">
                            <div className="mb-2 flex justify-between text-xs">
                              <span className="text-foreground">.{tld.name}</span>
                              <span className="text-muted-foreground">{tld.count}</span>
                            </div>
                            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                              <div className="h-full rounded-full bg-gradient-to-r from-emerald-900 via-emerald-500 to-emerald-300 transition-all group-hover:opacity-90" style={{ width: `${width}%` }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : <div className="flex items-center justify-center h-[160px] text-muted-foreground">No domain data</div>}
                </div>

                {/* Process API Calls */}
                <div className={`${sectionCardClass} p-5`}>
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-sm font-semibold text-foreground">Top Processes by API Calls</h3>
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.16em] text-emerald-300/80">Process profile</span>
                  </div>
                  {processApiData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={processApiData} layout="vertical" margin={{ top: 4, right: 18, left: 8, bottom: 4 }} barCategoryGap={16}>
                          <defs>
                            <linearGradient id="parsedProcessBar" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor={GREEN_CHART.darkest} />
                              <stop offset="45%" stopColor={GREEN_CHART.dark} />
                              <stop offset="100%" stopColor={GREEN_CHART.light} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="4 4" stroke={GREEN_CHART.grid} horizontal={false} />
                          <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#a7f3d0" }} />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#d1fae5" }} width={84} tickLine={false} axisLine={false} />
                          <Tooltip content={<GreenTooltip valueFormatter={(value) => `${value} calls`} />} />
                          <Bar dataKey="calls" fill="url(#parsedProcessBar)" radius={[0, 12, 12, 0]} barSize={18} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : <div className="flex items-center justify-center h-[180px] text-muted-foreground">No process data</div>}
                </div>
              </div>

              {/* Key Capabilities */}
              <div className={`${sectionCardClass} p-5`}>
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-foreground">Detected Capabilities</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {signatures.has_anti_debug && <span className={chipClass}><Lock className="w-3 h-3" />Anti-Debug</span>}
                  {signatures.has_anti_vm && <span className={chipClass}><Box className="w-3 h-3" />Anti-VM</span>}
                  {signatures.has_persistence && <span className={chipClass}><Clock className="w-3 h-3" />Persistence</span>}
                  {signatures.has_injection && <span className={chipClass}><Activity className="w-3 h-3" />Process Injection</span>}
                  {signatures.has_info_stealer && <span className={chipClass}><Fingerprint className="w-3 h-3" />Info Stealer</span>}
                  {memory.memory_shellcode_detected && <span className={chipClass}><FileCode className="w-3 h-3" />Shellcode</span>}
                  {cape.has_malware_config && <span className={chipClass}><Key className="w-3 h-3" />Config Extracted</span>}
                  {network.has_network_activity && <span className={chipClass}><Wifi className="w-3 h-3" />Network Activity</span>}
                </div>
              </div>

              {/* Quick Summary Text */}
              {(behavior.quick_summary || signatures.quick_summary) && (
                <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-300 uppercase">Quick Summary</span>
                  </div>
                  <p className="text-sm text-foreground">{behavior.quick_summary || signatures.quick_summary}</p>
                </div>
              )}
            </div>
          )}

          {/* ==================== TARGET TAB ==================== */}
          {activeTab === "target" && (
            <div className="space-y-6">
              {/* File Info Header */}
              <div className={`${sectionCardClass} p-5`}>
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-emerald-400" />
                      <h2 className="text-lg font-semibold text-foreground">{target.file_name}</h2>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <span className="text-muted-foreground">{target.file_type?.slice(0, 80)}</span>
                      <span className="text-muted-foreground">• {formatBytes(target.file_size)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {target.is_packed && <span className={chipClass}>Packed</span>}
                    {target.is_dotnet && <span className={chipClass}>.NET</span>}
                    {target.is_signed ? (
                      <span className={chipClass + " gap-1"}><CheckCircle className="w-3 h-3" />Signed</span>
                    ) : (
                      <span className={chipClass + " gap-1"}><XCircle className="w-3 h-3" />Unsigned</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Hashes */}
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Hash className="w-4 h-4" />File Hashes</h3>
                <div className="space-y-2">
                  <HashRow value={target.sha256} label="SHA256" />
                  <HashRow value={target.md5} label="MD5" />
                  <HashRow value={target.imphash} label="IMPHASH" />
                </div>
              </div>

              {/* Two Column Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* PE Info */}
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <FileCode className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">PE Information</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-muted-foreground">Entry Point:</span><br /><span className="text-foreground font-mono text-xs">{target.entrypoint || "N/A"}</span></div>
                      <div><span className="text-muted-foreground">Compile Time:</span><br /><span className="text-foreground text-xs">{formatTimestamp(target.compile_timestamp)}</span></div>
                    </div>
                    {target.cape_type && (
                      <div className="p-2 rounded-lg bg-muted/10">
                        <span className="text-muted-foreground text-xs">CAPE Type:</span>
                        <p className="text-sm text-primary mt-1">{target.cape_type}</p>
                      </div>
                    )}
                    {target.die_info.length > 0 && (
                      <div className="p-2 rounded-lg bg-muted/10">
                        <span className="text-muted-foreground text-xs">Detect It Easy:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {target.die_info.slice(0, 3).map((item: string, idx: number) => (
                            <span key={idx} className="text-xs text-muted-foreground">• {item}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Signing Info */}
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Lock className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Signing & Trust</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/10">
                      <span className="text-sm text-muted-foreground">Digital Signature</span>
                      <span className={target.is_signed ? "text-green-400" : "text-red-400"}>{target.is_signed ? "Valid" : "Not Signed"}</span>
                    </div>
                    {target.signers.length > 0 && (
                      <div className="p-2 rounded-lg bg-muted/10">
                        <span className="text-muted-foreground text-xs">Signers:</span>
                        {target.signers.map((signer: string, idx: number) => <p key={idx} className="text-sm text-foreground break-all">{signer}</p>)}
                      </div>
                    )}
                    {target.company_name && (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-muted/10">
                        <span className="text-sm text-muted-foreground">Company</span>
                        <span className="text-sm text-foreground">{target.company_name}</span>
                      </div>
                    )}
                    {target.product_name && (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-muted/10">
                        <span className="text-sm text-muted-foreground">Product</span>
                        <span className="text-sm text-foreground">{target.product_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* YARA Rules */}
              {target.critical_yara_rules.length > 0 && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <h3 className="text-sm font-semibold text-foreground">Critical YARA Matches</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {target.critical_yara_rules.map((rule: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs font-mono">{rule}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* High Entropy Sections */}
              {target.high_entropy_sections.length > 0 && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-semibold text-foreground">High Entropy Sections (Packing Indicator)</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {target.high_entropy_sections.map((section: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-xs font-mono">{section}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Self Extract */}
              {target.has_self_extract && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Box className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Self-Extraction</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><span className="text-muted-foreground text-xs">Method:</span> <span className="text-foreground text-sm">{target.self_extract_method}</span></div>
                    <div><span className="text-muted-foreground text-xs">Extracted Files:</span> <span className="text-foreground text-sm">{target.extracted_files_count}</span></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== BEHAVIOR TAB ==================== */}
          {activeTab === "behavior" && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <StatCard icon={<Cpu className="w-4 h-4" />} label="Processes" value={behavior.total_processes} />
                <StatCard icon={<Activity className="w-4 h-4" />} label="API Calls" value={behavior.total_api_calls.toLocaleString()} />
                <StatCard icon={<Terminal className="w-4 h-4" />} label="Commands" value={behavior.executed_commands.length} />
                <StatCard icon={<Database className="w-4 h-4" />} label="Registry Keys" value={behavior.keys_summary?.total_count || 0} />
                <StatCard icon={<Key className="w-4 h-4" />} label="Mutexes" value={behavior.mutexes.length} />
              </div>

              {/* Process Tree */}
              {behavior.processtree.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <FolderTree className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Process Tree</h3>
                  </div>
                  <div className="space-y-1 max-h-[500px] overflow-y-auto pr-2">
                    {behavior.processtree.map((node: any, idx: number) => (
                      <ProcessTreeNode key={idx} node={node} depth={0} expandedNodes={expandedNodes} toggleNode={toggleProcessNode} />
                    ))}
                  </div>
                </div>
              )}

              {/* Process Details */}
              {behavior.call_stats.length > 0 && (
                <div className="space-y-4">
                  {behavior.call_stats.map((proc: any, idx: number) => {
                    const isExpanded = expandedProcesses.has(proc.process_id)
                    const topCategories = Object.entries(proc.category_stats || {}).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 5)
                    return (
                      <div key={idx} className="rounded-xl border border-border bg-card overflow-hidden">
                        <div 
                          className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/10 transition-colors"
                          onClick={() => toggleProcessExpand(proc.process_id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Cpu className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{proc.process_name || `PID ${proc.process_id}`}</p>
                              <p className="text-xs text-muted-foreground">PID {proc.process_id} • {proc.total_calls} API calls</p>
                            </div>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </div>
                        {isExpanded && (
                          <div className="border-t border-border p-4 space-y-4">
                            {/* Top API Categories */}
                            {topCategories.length > 0 && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-2">Top API Categories</p>
                                <div className="flex flex-wrap gap-2">
                                  {topCategories.map(([cat, count]) => (
                                    <span key={cat} className="px-2 py-1 rounded bg-muted/20 text-xs text-muted-foreground">{cat}: {count as number}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {/* High Value Calls */}
                            {proc.high_value_calls && proc.high_value_calls.length > 0 && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-2">High-Value API Calls</p>
                                <div className="space-y-1">
                                  {proc.high_value_calls.slice(0, 5).map((call: any, cidx: number) => (
                                    <div key={cidx} className="flex items-center justify-between text-xs p-1.5 rounded bg-muted/10">
                                      <span className="text-primary font-mono">{call.api}</span>
                                      <span className="text-muted-foreground">{call.count} calls</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {/* Unique APIs */}
                            {proc.unique_apis && proc.unique_apis.length > 0 && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-2">Unique APIs (sample)</p>
                                <div className="flex flex-wrap gap-1">
                                  {proc.unique_apis.slice(0, 12).map((api: string, uidx: number) => (
                                    <span key={uidx} className="px-1.5 py-0.5 rounded bg-muted/20 text-[10px] font-mono text-muted-foreground">{api}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* File Activity */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ExpandableSection title="Files Read" items={behavior.files_accessed} initialCount={8} renderItem={(f, idx) => <div key={idx} className="text-xs text-muted-foreground break-all py-1 border-b border-border/50 last:border-0">{f}</div>} emptyMessage="No files read" />
                <ExpandableSection title="Files Written" items={behavior.files_written} initialCount={8} renderItem={(f, idx) => <div key={idx} className="text-xs text-amber-400 break-all py-1 border-b border-border/50 last:border-0">{f}</div>} emptyMessage="No files written" />
                <ExpandableSection title="Files Deleted" items={behavior.files_deleted} initialCount={8} renderItem={(f, idx) => <div key={idx} className="text-xs text-red-400 break-all py-1 border-b border-border/50 last:border-0">{f}</div>} emptyMessage="No files deleted" />
              </div>

              {/* Commands */}
              {filteredCommands.length > 0 && (
                <ExpandableSection title="Executed Commands" items={filteredCommands} initialCount={8} renderItem={(cmd, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-muted/10 border border-border">
                    <code className="text-xs text-foreground break-all font-mono">{cmd}</code>
                  </div>
                )} />
              )}

              {/* Registry Keys Summary */}
              {behavior.keys_summary && behavior.keys_summary.total_count > 0 && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Key className="w-4 h-4" />Registry Activity</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-muted/10 text-center">
                      <p className="text-lg font-bold text-foreground">{behavior.keys_summary.total_count}</p>
                      <p className="text-xs text-muted-foreground">Total Keys</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/10 text-center">
                      <p className="text-lg font-bold text-foreground">{behavior.keys_summary.unique_hives?.length || 0}</p>
                      <p className="text-xs text-muted-foreground">Hives</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/10 text-center">
                      <p className="text-lg font-bold text-foreground">{behavior.keys_summary?.write_keys?.length || 0}</p>
                      <p className="text-xs text-muted-foreground">Writes</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/10 text-center">
                      <p className="text-lg font-bold text-foreground">{behavior.keys_summary?.delete_keys?.length || 0}</p>
                      <p className="text-xs text-muted-foreground">Deletes</p>
                    </div>
                  </div>
                  {behavior.keys_summary.sample_keys && behavior.keys_summary.sample_keys.length > 0 && (
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      <InlineExpandable items={behavior.keys_summary.sample_keys} initialCount={10} renderItem={(key: any, idx: number) => (
                        <div key={idx} className="text-xs text-muted-foreground break-all py-1 border-b border-border/50 last:border-0 font-mono">{sanitizeText(key)}</div>
                      )} />
                    </div>
                  )}
                </div>
              )}

              {/* Mutexes */}
              {behavior.mutexes.length > 0 && (
                <ExpandableSection title="Mutexes" items={behavior.mutexes} initialCount={8} renderItem={(mutex, idx) => <div key={idx} className="text-xs text-primary break-all py-1">{mutex}</div>} />
              )}
            </div>
          )}

          {/* ==================== SIGNATURES TAB ==================== */}
          {activeTab === "signatures" && (
            <div className="space-y-6">
              {/* Score Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <StatCard icon={<Shield className="w-4 h-4" />} label="Total" value={signatures.total_signatures} />
                <StatCard icon={<AlertTriangle className="w-4 h-4" />} label="Critical (S3)" value={signatures.critical_signatures} color="red" />
                <StatCard icon={<AlertCircle className="w-4 h-4" />} label="Suspicious (S2)" value={signatures.suspicious_signatures} color="amber" />
                <StatCard icon={<Fingerprint className="w-4 h-4" />} label="TTPs" value={signatures.detected_ttps.length} />
                <StatCard icon={<Terminal className="w-4 h-4" />} label="Commands" value={signatures.commands.length} />
              </div>

              {/* Malicious Score Radial */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-4 flex-wrap justify-center">
                  <div className="relative w-32 h-32">
                    <div 
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(${signatures.malscore >= 7 ? "#ef4444" : signatures.malscore >= 4 ? "#f59e0b" : "#22c55e"} ${(signatures.malscore / 10) * 100}%, rgba(255,255,255,0.08) ${(signatures.malscore / 10) * 100}% 100%)`,
                      }}
                    />
                    <div className="absolute inset-[8px] rounded-full bg-background border border-border flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-foreground">{signatures.malscore.toFixed(1)}</p>
                        <p className="text-[10px] text-muted-foreground">/ 10</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">Malicious Score</p>
                    <p className="text-sm text-muted-foreground">Status: <span className={signatures.malstatus === "Malicious" ? "text-red-400" : "text-amber-400"}>{signatures.malstatus}</span></p>
                    <div className="flex gap-2 mt-2">
                      {signatures.has_anti_debug && <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">Anti-Debug</span>}
                      {signatures.has_anti_vm && <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">Anti-VM</span>}
                      {signatures.has_persistence && <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">Persistence</span>}
                      {signatures.has_injection && <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">Injection</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* High Severity Signatures */}
              {filteredSignatures.length > 0 && (
                <ExpandableSection title="High Severity Signatures" items={filteredSignatures} initialCount={7} step={8} renderItem={(sig: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg border border-red-500/20 bg-red-500/10">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{sanitizeText(sig.name)}</p>
                        {sig.categories && sig.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {sig.categories.slice(0, 3).map((cat: string, cidx: number) => (
                              <span key={cidx} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/20 text-muted-foreground">{sanitizeText(cat)}</span>
                            ))}
                          </div>
                        )}
                        {sig.commands && sig.commands.length > 0 && (
                          <p className="text-xs font-mono text-muted-foreground mt-2 break-all">{truncate(sanitizeText(sig.commands[0]), 200)}</p>
                        )}
                      </div>
                      <SeverityBadge severity={sig.severity || 3} />
                    </div>
                  </div>
                )} />
              )}

              {/* TTPs */}
              {signatures.detected_ttps.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Fingerprint className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">MITRE ATT&CK Techniques</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {signatures.detected_ttps.slice(0, 20).map((ttp: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-mono">{ttp}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* IOCs from Signatures */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ExpandableSection title="Domains (from signatures)" items={signatures.domains} initialCount={10} renderItem={(d, idx) => <div key={idx} className="text-xs text-primary break-all py-1">{d}</div>} emptyMessage="No domains" />
                <ExpandableSection title="IPs (from signatures)" items={signatures.ips} initialCount={10} renderItem={(ip, idx) => <div key={idx} className="text-xs text-primary break-all py-1">{ip}</div>} emptyMessage="No IPs" />
              </div>

              {/* Commands from Signatures */}
              {signatures.commands.length > 0 && (
                <ExpandableSection title="Commands (from signatures)" items={signatures.commands} initialCount={8} renderItem={(cmd, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-muted/10 border border-border">
                    <code className="text-xs text-foreground break-all font-mono">{cmd}</code>
                  </div>
                )} />
              )}
            </div>
          )}

          {/* ==================== MEMORY TAB ==================== */}
          {activeTab === "memory" && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <StatCard icon={<MemoryStick className="w-4 h-4" />} label="Memory Dumps" value={memory.total_memory_dumps} />
                <StatCard icon={<FileCode className="w-4 h-4" />} label="PE Files" value={memory.procdump_pe_count} />
                <StatCard icon={<AlertTriangle className="w-4 h-4" />} label="Dumps w/ YARA" value={memory.memory_dumps_with_yara} />
                <StatCard icon={<Terminal className="w-4 h-4" />} label="Dropped Files" value={memory.total_dropped_files} />
                <StatCard icon={<Box className="w-4 h-4" />} label="Extracted PE" value={memory.extracted_pe_from_memory_count} />
              </div>

              {/* Injection Indicators */}
              {(memory.memory_shellcode_detected || memory.memory_injection_detected) && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <h3 className="text-sm font-semibold text-foreground">Memory Injection Detected</h3>
                  </div>
                  <div className="flex gap-4 text-sm">
                    {memory.memory_shellcode_detected && <span className="text-red-400 flex items-center gap-1"><FileCode className="w-3 h-3" /> Shellcode Present</span>}
                    {memory.memory_injection_detected && <span className="text-red-400 flex items-center gap-1"><Activity className="w-3 h-3" /> Injection Activity</span>}
                  </div>
                </div>
              )}

              {/* Malware Families */}
              {memory.procdump_malware_families.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Detected Families (Memory)</h3>
                  <div className="flex flex-wrap gap-2">
                    {memory.procdump_malware_families.map((family: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 rounded bg-primary/10 text-primary text-xs">{family}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Critical Rules */}
              {memory.critical_malware_rules.length > 0 && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Critical YARA Matches (Memory)</h3>
                  <div className="flex flex-wrap gap-2">
                    {memory.critical_malware_rules.map((rule: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-xs font-mono">{rule}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Process Memory Dumps */}
              {memory.memory_dump_processes.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Process Memory Dumps</h3>
                  <div className="flex flex-wrap gap-2">
                    {memory.memory_dump_processes.map((proc: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 rounded bg-muted/20 text-muted-foreground text-sm">{proc}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dropped Notable Files */}
              {memory.dropped_notable_files.length > 0 && (
                <ExpandableSection title="Notable Dropped Files" items={memory.dropped_notable_files} initialCount={5} renderItem={(file: any, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-muted/10">
                    <p className="text-sm font-mono text-foreground break-all">{file.name}</p>
                    {file.path && <p className="text-xs text-muted-foreground break-all mt-1">{file.path}</p>}
                  </div>
                )} />
              )}
            </div>
          )}

          {/* ==================== NETWORK TAB ==================== */}
          {activeTab === "network" && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <StatCard icon={<Globe className="w-4 h-4" />} label="Domains" value={network.domains.length} />
                <StatCard icon={<Server className="w-4 h-4" />} label="IPs" value={network.ips.length} />
                <StatCard icon={<Activity className="w-4 h-4" />} label="DNS Queries" value={network.dns_queries.length} />
                <StatCard icon={<Wifi className="w-4 h-4" />} label="HTTP" value={network.http_requests.length} />
                <StatCard icon={<WifiOff className="w-4 h-4" />} label="Dead Hosts" value={network.dead_hosts.length} />
              </div>

              {/* Network Activity Status */}
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  {network.has_network_activity ? (
                    <Wifi className="w-5 h-5 text-green-400" />
                  ) : (
                    <WifiOff className="w-5 h-5 text-red-400" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {network.has_network_activity ? "Network Activity Detected" : "No Network Activity"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {network.total_tcp_connections + network.total_udp_connections} connections • 
                      {network.has_dns_traffic ? " DNS" : ""}
                      {network.has_https_traffic ? " HTTPS" : ""}
                    </p>
                  </div>
                  {network.contacted_countries.length > 0 && (
                    <div className="ml-auto flex items-center gap-1">
                      {network.contacted_countries.slice(0, 3).map((country, idx) => (
                        <span key={idx} className="text-xs px-2 py-0.5 rounded bg-muted/20">{country}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Suspicious Domains Warning */}
              {network.has_suspicious_domains && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-semibold text-foreground">Suspicious Domain Patterns</h3>
                  </div>
                  {network.suspicious_domain_keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {network.suspicious_domain_keywords.map((kw: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs">{kw}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Domains */}
              {filteredDomains.length > 0 && (
                <ExpandableSection title="Domains" items={filteredDomains} initialCount={15} renderItem={(domain, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/10 border border-border">
                    <span className="text-sm text-primary break-all">{domain}</span>
                    <button onClick={() => navigator.clipboard.writeText(domain)} className="p-1 rounded hover:bg-muted/20">
                      <Copy className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>
                )} />
              )}

              {/* HTTP Requests */}
              {network.http_requests.length > 0 && (
                <ExpandableSection title="📡 HTTP Requests" items={network.http_requests} initialCount={10} renderItem={(req: any, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-muted/10 border border-border">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary">{req.method || "GET"}</span>
                      <span className="text-sm text-foreground break-all">{req.host || req.path?.split("/")[0]}</span>
                      {req.port && <span className="text-xs text-muted-foreground">:{req.port}</span>}
                    </div>
                    {req.path && req.path !== "/" && <p className="text-xs text-muted-foreground break-all font-mono mt-1">{truncate(req.path, 80)}</p>}
                    {req.user_agent && <p className="text-[10px] text-muted-foreground mt-1 truncate">UA: {truncate(req.user_agent, 60)}</p>}
                  </div>
                )} />
              )}

              {/* DNS Queries */}
              {network.dns_queries.length > 0 && (
                <ExpandableSection title="DNS Queries" items={network.dns_queries} initialCount={10} renderItem={(dns: any, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-muted/10 border border-border">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-foreground break-all">{dns.request || dns.query}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/20 text-muted-foreground">{dns.type || "A"}</span>
                    </div>
                    {dns.answers && dns.answers.length > 0 && (
                      <div className="mt-1 text-xs text-primary">
                        → {dns.answers.map((a: any) => a.data).filter(Boolean).join(", ")}
                      </div>
                    )}
                  </div>
                )} />
              )}

              {/* Dead Hosts */}
              {network.dead_hosts.length > 0 && (
                <ExpandableSection title="Dead Hosts (Failed Connections)" items={network.dead_hosts} initialCount={8} renderItem={(host: any, idx: number) => (
                  <div key={idx} className="text-xs text-red-400 break-all py-1">{host.ip}:{host.port}</div>
                )} />
              )}
            </div>
          )}

          {/* ==================== CAPE TAB ==================== */}
          {activeTab === "cape" && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard icon={<Box className="w-4 h-4" />} label="Payloads" value={cape.total_payloads} />
                <StatCard icon={<FileCode className="w-4 h-4" />} label="Configs" value={cape.total_configs} />
                <StatCard icon={<Activity className="w-4 h-4" />} label="Injectors" value={cape.injection_processes.length} />
                <StatCard icon={<Wifi className="w-4 h-4" />} label="C2 Servers" value={cape.c2_servers.length} />
              </div>

              {/* Detected Families */}
              {cape.detected_families.length > 0 && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Detected Malware Families (CAPE)</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cape.detected_families.map((family: string, idx: number) => (
                      <span key={idx} className="px-3 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-medium">{family}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Payload Types */}
              {Object.keys(cape.payload_types).length > 0 && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Payload Types</h3>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(cape.payload_types).map(([type, count], idx) => (
                      <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/10">
                        <FileCode className="w-4 h-4 text-primary" />
                        <span className="text-sm text-foreground">{type}</span>
                        <span className="text-xs text-muted-foreground">({count as number})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Injection Processes */}
              {cape.injection_processes.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Process Injection</h3>
                  <div className="space-y-2">
                    {cape.injection_processes.map((proc: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/10">
                        <div>
                          <span className="text-sm font-medium text-foreground">{proc.process}</span>
                          {proc.pid && <span className="text-xs text-muted-foreground ml-2">PID {proc.pid}</span>}
                        </div>
                        <span className="text-xs text-primary">{proc.payload_count} payloads</span>
                      </div>
                    ))}
                  </div>
                  {cape.primary_injection_method && cape.primary_injection_method !== "None" && (
                    <div className="mt-3 text-sm">
                      <span className="text-muted-foreground">Primary method:</span>
                      <span className="text-primary ml-2">{cape.primary_injection_method}</span>
                    </div>
                  )}
                </div>
              )}

              {/* C2 Servers */}
              {cape.c2_servers.length > 0 && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Server className="w-4 h-4 text-red-400" />C2 Servers</h3>
                  <div className="space-y-1">
                    {cape.c2_servers.map((server: string, idx: number) => (
                      <div key={idx} className="text-sm text-red-400 break-all font-mono">{server}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payload Examples */}
              {cape.payload_examples.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Payload Examples</h3>
                  <div className="space-y-2">
                    {cape.payload_examples.map((payload: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-lg bg-muted/10 border border-border">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div><span className="text-muted-foreground">Type:</span> <span className="text-foreground">{payload.cape_type}</span></div>
                          <div><span className="text-muted-foreground">Process:</span> <span className="text-foreground">{payload.process}</span></div>
                          <div><span className="text-muted-foreground">Size:</span> <span className="text-foreground">{formatBytes(payload.size)}</span></div>
                          {payload.virtual_address && <div><span className="text-muted-foreground">VA:</span> <span className="text-foreground font-mono text-xs">{payload.virtual_address}</span></div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Config Indicators */}
              {Object.keys(cape.config_indicators).length > 0 && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Configuration Indicators</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(cape.config_indicators).slice(0, 10).map(([key, value], idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-muted/10">
                        <Key className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground">{key}</p>
                          <p className="text-xs text-muted-foreground break-all">{String(value)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== STRINGS TAB ==================== */}
          {activeTab === "strings" && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard icon={<Type className="w-4 h-4" />} label="Total Strings" value={sections.strings?.metadata?.total_strings_processed || 0} />
                <StatCard icon={<Database className="w-4 h-4" />} label="Categories" value={stringCategories.length} />
                <StatCard icon={<BarChart3 className="w-4 h-4" />} label="Whitelisted" value={sections.strings?.metadata?.whitelisted_strings || 0} />
                <StatCard icon={<Hash className="w-4 h-4" />} label="Reduction" value={sections.strings?.metadata?.reduction_percentage || "0%"} />
              </div>

              {/* Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stringCategories.slice(0, 8).map((cat, idx) => (
                  <div key={idx} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-foreground">{cat.name}</h3>
                      <span className="text-xs text-muted-foreground">{cat.count} items</span>
                    </div>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {
                        (() => {
                          const full = sections.strings?.categories?.[cat.name] || cat.samples || []
                          return (
                            <InlineExpandable items={full} initialCount={5} step={20} renderItem={(str: any, sIdx: number) => (
                              <div key={sIdx} className="text-xs text-muted-foreground break-all py-1 border-b border-border/50 last:border-0 font-mono">{sanitizeText(str)}</div>
                            )} />
                          )
                        })()
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== RAW TAB ==================== */}
          {activeTab === "raw" && (
            <div className="rounded-xl border border-border bg-card p-4 overflow-auto max-h-[70vh]">
              <pre className="text-xs text-foreground font-mono whitespace-pre-wrap break-all">{JSON.stringify(data, null, 2)}</pre>
            </div>
          )}

        </div>
      </AnimatePresence>
    </div>
  )
}

// Inline expandable list (no surrounding card) for dense lists like registry samples or string samples
const InlineExpandable = ({ items, renderItem, initialCount = 5, step = 10 }: { items: any[]; renderItem: (item: any, idx: number) => React.ReactNode; initialCount?: number; step?: number }) => {
  const [expanded, setExpanded] = useState(false)
  if (!items || items.length === 0) return null
  const visible = expanded ? items : items.slice(0, initialCount)
  return (
    <div>
      <div className="space-y-1">{visible.map((it, i) => renderItem(it, i))}</div>
      {items.length > initialCount && (
        <button onClick={() => setExpanded(!expanded)} className="mt-2 text-xs text-primary hover:text-primary/80">{expanded ? "Show less" : `Show ${Math.min(step, items.length - initialCount)} more (${items.length - initialCount} left)`}</button>
      )}
    </div>
  )
}