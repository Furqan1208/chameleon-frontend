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
  FolderTree,
  Globe,
  HardDrive,
  Info,
  Key,
  Layers,
  Lock,
  Maximize2,
  MemoryStick,
  Minimize2,
  Network,
  PieChart,
  Radar,
  Search,
  Server,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar as ReRadar,
  Treemap,
  ComposedChart,
} from "recharts"

interface CapeAnalysisDashboardProps {
  capeData: any
  loading?: boolean
  onCopyJson?: () => void
  copied?: boolean
  onDownload?: (format: string) => void
}

type TabId = "overview" | "target" | "behavior" | "signatures" | "processes" | "network" | "files" | "mitre" | "memory"

// Utility functions
const safeArray = <T = any,>(value: any): T[] => Array.isArray(value) ? value : []
const safeObject = (value: any): Record<string, any> => value && typeof value === "object" && !Array.isArray(value) ? value : {}
const safeNumber = (value: any, defaultValue = 0): number => {
  const n = Number(value)
  return isNaN(n) ? defaultValue : n
}

const formatBytes = (bytes?: number): string => {
  if (!bytes || isNaN(bytes)) return "N/A"
  const units = ["B", "KB", "MB", "GB"]
  const idx = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / Math.pow(1024, idx)).toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`
}

const formatTimestamp = (timestamp?: string): string => {
  if (!timestamp) return "N/A"
  const date = new Date(timestamp)
  return isNaN(date.getTime()) ? timestamp : date.toLocaleString()
}

const truncate = (str: string, maxLen = 80): string => {
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

// Severity colors
const severityConfig = {
  3: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", badge: "bg-red-500/20 text-red-400", label: "Critical" },
  2: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", badge: "bg-amber-500/20 text-amber-400", label: "High" },
  1: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400", badge: "bg-blue-500/20 text-blue-400", label: "Medium" },
  0: { bg: "bg-slate-500/10", border: "border-slate-500/30", text: "text-slate-400", badge: "bg-slate-500/20 text-slate-400", label: "Low" },
}

const threatColor = {
  CRITICAL: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", glow: "shadow-red-500/20" },
  HIGH: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", glow: "shadow-amber-500/20" },
  MEDIUM: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400", glow: "shadow-blue-500/20" },
  LOW: { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-400", glow: "shadow-green-500/20" },
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
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    <polyline points="17 18 23 18 23 12" />
  </svg>
)

const SeverityBadge = ({ severity }: { severity: number }) => {
  const config = severityConfig[severity as keyof typeof severityConfig] || severityConfig[0]
  return <span className={`text-[10px] px-2 py-0.5 rounded-full border ${config.badge} ${config.border}`}>{config.label}</span>
}

const HashRow = ({ value, label }: { value?: string; label: string }) => {
  if (!value) return null
  const display = value.length > 20 ? `${value.slice(0, 20)}...` : value
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/10 border border-border group">
      <Fingerprint className="w-3 h-3 text-muted-foreground shrink-0" />
      <span className="text-[10px] text-muted-foreground uppercase w-12 shrink-0">{label}</span>
      <code className="text-xs text-foreground flex-1 truncate font-mono">{display}</code>
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
        <button onClick={() => setExpanded(!expanded)} className="mt-3 text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
          {expanded ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? "Show less" : `Show ${Math.min(step, items.length - initialCount)} more`}
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
        className={`flex items-center gap-2 p-2 rounded-lg hover:bg-muted/10 transition-colors cursor-pointer ${depth > 0 ? "ml-6" : ""}`}
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
export default function CapeAnalysisDashboard({ capeData, loading = false, onCopyJson, copied = false, onDownload }: CapeAnalysisDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [expandedProcesses, setExpandedProcesses] = useState<Set<number>>(new Set())

  // Extract data
  const target = useMemo(() => {
    const file = capeData?.target?.file || {}
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      md5: file.md5,
      sha1: file.sha1,
      sha256: file.sha256,
      ssdeep: file.ssdeep,
      imphash: file.pe?.imphash,
      timestamp: file.pe?.timestamp,
      entrypoint: file.pe?.entrypoint,
      sections: safeArray(file.pe?.sections),
      versioninfo: safeArray(file.pe?.versioninfo),
      die: safeArray(file.die),
      cape_type: file.cape_type,
      is_dotnet: file.type?.includes(".Net") || false,
    }
  }, [capeData])

  const detections = useMemo(() => {
    return safeArray(capeData?.detections).map((d: any) => d.family)
  }, [capeData])

  const stats = useMemo(() => {
    const behavior = capeData?.behavior || {}
    const summary = behavior.summary || {}
    return {
      processes: safeArray(behavior.processes).length,
      signatures: safeArray(capeData?.signatures).length,
      droppedFiles: safeArray(capeData?.dropped).length,
      ttps: safeArray(capeData?.ttps).length,
      registryKeys: safeArray(summary.keys).length,
      commands: safeArray(summary.executed_commands).length,
      mutexes: safeArray(summary.mutexes).length,
      writeFiles: safeArray(summary.write_files).length,
      deleteFiles: safeArray(summary.delete_files).length,
      memoryDumps: safeArray(capeData?.procmemory).length,
      apiCalls: safeArray(behavior.processes).reduce((acc: number, p: any) => acc + safeArray(p.calls).length, 0),
      readFiles: safeArray(summary.read_files).length,
      resolvedApis: safeArray(summary.resolved_apis).length,
    }
  }, [capeData])

  const signatures = useMemo(() => {
    return safeArray(capeData?.signatures).map((sig: any) => ({
      ...sig,
      severityClass: sig.severity === 3 ? "high" : sig.severity === 2 ? "medium" : "low",
    }))
  }, [capeData])

  const filteredSignatures = useMemo(() => {
    if (!searchQuery) return signatures
    const q = searchQuery.toLowerCase()
    return signatures.filter((s: any) => s.name?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q))
  }, [signatures, searchQuery])

  // Process tree
  const processtree = useMemo(() => {
    return safeArray(capeData?.behavior?.processtree)
  }, [capeData])

  // Process details with API stats
  const processDetails = useMemo(() => {
    return safeArray(capeData?.behavior?.processes).map((proc: any) => {
      const calls = safeArray(proc.calls)
      const environ = proc.environ || {}
      const fileActivities = proc.file_activities || {}
      
      // API category counts
      const categoryCounts: Record<string, number> = {}
      const apiCounts: Record<string, number> = {}
      calls.forEach((call: any) => {
        const cat = call.category || "other"
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
        const apiName = call.api
        if (apiName) apiCounts[apiName] = (apiCounts[apiName] || 0) + 1
      })
      
      const topApis = Object.entries(apiCounts)
        .map(([api, count]) => ({ api, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
      
      const topCategories = Object.entries(categoryCounts)
        .map(([cat, count]) => ({ category: cat, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
      
      // Suspicious API indicators
      const suspiciousApis = calls.filter(c => 
        ["NtProtectVirtualMemory", "NtAllocateVirtualMemory", "ReadProcessMemory", 
         "WriteProcessMemory", "NtCreateRemoteThread", "NtCreateProcess"].includes(c.api)
      ).length
      
      return {
        pid: proc.process_id,
        name: proc.process_name,
        parentId: proc.parent_id,
        modulePath: proc.module_path,
        firstSeen: proc.first_seen,
        callCount: calls.length,
        threads: safeArray(proc.threads).length,
        commandLine: environ.CommandLine || "",
        username: environ.UserName,
        computerName: environ.ComputerName,
        bitness: environ.Bitness,
        readFiles: safeArray(fileActivities.read_files),
        writeFiles: safeArray(fileActivities.write_files),
        deleteFiles: safeArray(fileActivities.delete_files),
        topApis,
        topCategories,
        suspiciousApis,
        categoryCounts,
      }
    })
  }, [capeData])

  const filteredProcesses = useMemo(() => {
    if (!searchQuery) return processDetails
    const q = searchQuery.toLowerCase()
    return processDetails.filter((p: any) => 
      p.name?.toLowerCase().includes(q) || 
      p.commandLine?.toLowerCase().includes(q) ||
      p.modulePath?.toLowerCase().includes(q)
    )
  }, [processDetails, searchQuery])

  // Network data
  const network = useMemo(() => {
    const net = capeData?.network || {}
    const hosts = safeArray(net.hosts)
    const domains = safeArray(net.domains)
    const dns = safeArray(net.dns)
    const http = safeArray(net.http)
    const tcp = safeArray(net.tcp)
    const udp = safeArray(net.udp)
    const deadHosts = safeArray(net.dead_hosts)
    
    // Top ports
    const portCounts: Record<number, number> = {}
    const tcpArr = safeArray(net.tcp)
    const udpArr = safeArray(net.udp)
    const allConns = tcpArr.concat(udpArr)
    allConns.forEach((conn: any) => {
      const port = conn?.dport
      if (port) portCounts[Number(port)] = (portCounts[Number(port)] || 0) + 1
    })
    const topPorts = Object.entries(portCounts)
      .map(([port, count]) => ({ port: Number(port), count: Number(count) }))
      .sort((a, b) => (Number(b.count) - Number(a.count)))
      .slice(0, 8)
    
    return { hosts, domains, dns, http, tcp, udp, deadHosts, topPorts, pcapSha256: net.pcap_sha256 }
  }, [capeData])

  // Memory data
  const memory = useMemo(() => {
    const dumps = safeArray(capeData?.procmemory)
    return {
      totalDumps: dumps.length,
      dumpsWithYara: dumps.filter((d: any) => safeArray(d.yara).length > 0 || safeArray(d.cape_yara).length > 0).length,
      dumpsWithShellcode: dumps.filter((d: any) => d.has_shellcode).length,
      extractedPE: dumps.reduce((acc: number, d: any) => acc + safeArray(d.extracted_pe).length, 0),
      processes: dumps.map((d: any) => d.name).filter(Boolean),
      yaraRules: [...new Set(dumps.flatMap((d: any) => [...safeArray(d.yara).map((y: any) => y.name), ...safeArray(d.cape_yara).map((y: any) => y.name)]))],
    }
  }, [capeData])

  // MITRE ATT&CK
  const mitre = useMemo(() => {
    const ttps = safeArray(capeData?.ttps)
    const techniques = new Set<string>()
    ttps.forEach((ttp: any) => {
      safeArray(ttp.ttps).forEach((t: string) => techniques.add(t))
    })
    return { techniques: Array.from(techniques), totalMappings: ttps.length }
  }, [capeData])

  // Malicious score
  const malscore = safeNumber(capeData?.malscore, 0)
  const malstatus = capeData?.malstatus || "Unknown"
  const threatLevel = malscore >= 7 ? "CRITICAL" : malscore >= 4 ? "HIGH" : malscore >= 2 ? "MEDIUM" : "LOW"
  const threatColorConfig = threatColor[threatLevel as keyof typeof threatColor] || threatColor.MEDIUM

  // Chart data
  const signatureSeverityData = useMemo(() => {
    const high = signatures.filter((s: any) => s.severity === 3).length
    const medium = signatures.filter((s: any) => s.severity === 2).length
    const low = signatures.filter((s: any) => s.severity === 1).length
    return [
      { name: "Critical", value: high, color: "#ef4444" },
      { name: "High", value: medium, color: "#f59e0b" },
      { name: "Medium", value: low, color: "#3b82f6" },
    ].filter(d => d.value > 0)
  }, [signatures])

  const categoryData = useMemo(() => {
    const catCounts: Record<string, number> = {}
    signatures.forEach((sig: any) => {
      safeArray(sig.categories).forEach((cat: string) => {
        catCounts[cat] = (catCounts[cat] || 0) + 1
      })
    })
    return Object.entries(catCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [signatures])

  const apiCategoryData = useMemo(() => {
    const catCounts: Record<string, number> = {}
    processDetails.forEach((proc: any) => {
      Object.entries(proc.categoryCounts || {}).forEach(([cat, count]) => {
        catCounts[cat] = (catCounts[cat] || 0) + (count as number)
      })
    })
    return Object.entries(catCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [processDetails])

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

  // Auto-expand root nodes
  useEffect(() => {
    const rootIds = processtree.map((node: any, idx: number) => `${node.pid || node.name}-0-${idx}`)
    setExpandedNodes(new Set(rootIds))
  }, [processtree])

  if (!capeData || Object.keys(capeData).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="p-5 rounded-full bg-muted/20 mb-5">
          <FileJson className="w-14 h-14 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-lg">No CAPE analysis data available</p>
        <p className="text-sm text-muted-foreground mt-1">Run a CAPE sandbox analysis first</p>
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
        <p className="text-sm text-muted-foreground mt-5">Loading CAPE analysis data...</p>
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
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary font-semibold">CAPE Sandbox Intelligence</p>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Behavioral Analysis Report</h2>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-muted-foreground">{target.name || "Unknown sample"}</p>
            <span className="text-xs text-muted-foreground">{formatBytes(target.size)}</span>
            {target.cape_type && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{truncate(target.cape_type, 40)}</span>}
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
            { id: "processes", label: "Processes", icon: <Cpu className="w-4 h-4" /> },
            { id: "network", label: "Network", icon: <Globe className="w-4 h-4" /> },
            { id: "files", label: "Files", icon: <HardDrive className="w-4 h-4" /> },
            { id: "mitre", label: "MITRE", icon: <Target className="w-4 h-4" /> },
            { id: "memory", label: "Memory", icon: <MemoryStick className="w-4 h-4" /> },
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
      {(activeTab === "signatures" || activeTab === "processes") && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab === "signatures" ? "signatures" : "processes"}...`}
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
              {/* Threat Score Card */}
              <div className={`rounded-3xl border p-5 ${threatColorConfig.border} ${threatColorConfig.bg}`}>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Threat Assessment</p>
                    <p className={`mt-1 text-2xl font-bold ${threatColorConfig.text}`}>{threatLevel}</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-background/40 px-4 py-3 text-right">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Malware Score</p>
                    <p className="mt-1 text-3xl font-bold text-foreground">{malscore.toFixed(1)}</p>
                    <p className="text-[10px] text-muted-foreground">out of 10</p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-2xl border border-border bg-background/30 p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">Status</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${malstatus === "Malicious" ? "border-red-500/20 bg-red-500/10 text-red-300" : "border-amber-500/20 bg-amber-500/10 text-amber-300"}`}>
                        {malstatus}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {detections.length} family{detections.length === 1 ? "" : "ies"} detected
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-background/30 p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">Families</p>
                    <div className="flex flex-wrap gap-2">
                      {detections.length > 0 ? detections.slice(0, 4).map((family, idx) => (
                        <span key={idx} className="inline-flex items-center rounded-full border border-red-500/15 bg-red-500/8 px-3 py-1 text-xs font-medium text-red-300">
                          {family}
                        </span>
                      )) : (
                        <span className="text-xs text-muted-foreground">No families detected</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <StatCard icon={<Cpu className="w-4 h-4" />} label="Processes" value={stats.processes} />
                <StatCard icon={<Activity className="w-4 h-4" />} label="API Calls" value={stats.apiCalls.toLocaleString()} />
                <StatCard icon={<Shield className="w-4 h-4" />} label="Signatures" value={stats.signatures} />
                <StatCard icon={<Target className="w-4 h-4" />} label="MITRE TTPs" value={mitre.totalMappings} />
                <StatCard icon={<Globe className="w-4 h-4" />} label="Domains" value={network.domains.length} />
                <StatCard icon={<MemoryStick className="w-4 h-4" />} label="Memory Dumps" value={memory.totalDumps} />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Signature Severity */}
                <div className={sectionCardClass + " p-5"}>
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-sm font-semibold text-foreground">Signature Severity</h3>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.16em] text-emerald-300/80">Severity split</span>
                  </div>
                  {signatureSeverityData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <RePieChart>
                          <defs>
                            <linearGradient id="capeSeverityCritical" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor={GREEN_CHART.darkest} />
                              <stop offset="100%" stopColor={GREEN_CHART.base} />
                            </linearGradient>
                            <linearGradient id="capeSeverityHigh" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor={GREEN_CHART.dark} />
                              <stop offset="100%" stopColor={GREEN_CHART.light} />
                            </linearGradient>
                            <linearGradient id="capeSeverityMedium" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor={GREEN_CHART.light} />
                              <stop offset="100%" stopColor={GREEN_CHART.pale} />
                            </linearGradient>
                          </defs>
                          <Pie data={signatureSeverityData} cx="50%" cy="50%" innerRadius={58} outerRadius={90} paddingAngle={4} cornerRadius={12} startAngle={90} endAngle={-270} dataKey="value" stroke="rgba(6, 78, 59, 0.9)" strokeWidth={2.5}>
                            {signatureSeverityData.map((entry, idx) => {
                              const fills = ["url(#capeSeverityCritical)", "url(#capeSeverityHigh)", "url(#capeSeverityMedium)"]
                              return <Cell key={idx} fill={fills[idx] || fills[fills.length - 1]} />
                            })}
                          </Pie>
                        <Tooltip content={<GreenTooltip valueFormatter={(value) => `${value} sigs`} />} />
                      </RePieChart>
                    </ResponsiveContainer>
                  ) : <div className="flex items-center justify-center h-[240px] text-muted-foreground">No signature data</div>}
                </div>

                {/* Top Categories */}
                <div className={sectionCardClass + " p-5"}>
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-sm font-semibold text-foreground">Top Signature Categories</h3>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.16em] text-emerald-300/80">Category volume</span>
                  </div>
                  {categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={categoryData} layout="vertical" margin={{ left: 70, right: 12 }} barCategoryGap={14}>
                        <defs>
                          <linearGradient id="capeCategoryBar" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor={GREEN_CHART.darkest} />
                            <stop offset="45%" stopColor={GREEN_CHART.dark} />
                            <stop offset="100%" stopColor={GREEN_CHART.light} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" stroke={GREEN_CHART.grid} horizontal={false} />
                        <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#a7f3d0" }} />
                        <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#d1fae5" }} width={70} />
                        <Tooltip content={<GreenTooltip valueFormatter={(value) => `${value} hits`} />} />
                        <Bar dataKey="count" fill="url(#capeCategoryBar)" radius={[0, 12, 12, 0]} barSize={18} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <div className="flex items-center justify-center h-[240px] text-muted-foreground">No category data</div>}
                </div>
              </div>

              {/* Info Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={sectionCardClass + " p-5"}>
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Analysis Info</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-muted-foreground">Started:</span> <span className="text-foreground">{formatTimestamp(capeData?.info?.started)}</span></div>
                    <div><span className="text-muted-foreground">Duration:</span> <span className="text-foreground">{capeData?.info?.duration}s</span></div>
                    <div><span className="text-muted-foreground">Package:</span> <span className="text-foreground">{capeData?.info?.package}</span></div>
                    <div><span className="text-muted-foreground">Timeout:</span> <span className={capeData?.info?.timeout ? "text-amber-400" : "text-green-400"}>{capeData?.info?.timeout ? "Yes" : "No"}</span></div>
                    <div><span className="text-muted-foreground">Platform:</span> <span className="text-foreground">{capeData?.info?.machine?.platform}</span></div>
                    <div><span className="text-muted-foreground">Machine:</span> <span className="text-foreground">{capeData?.info?.machine?.name}</span></div>
                  </div>
                </div>

                <div className={sectionCardClass + " p-5"}>
                  <div className="flex items-center gap-2 mb-4">
                    <Fingerprint className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Detected Families</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {detections.length > 0 ? detections.map((family, idx) => (
                      <span key={idx} className="px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium">{family}</span>
                    )) : <span className="text-muted-foreground text-sm">No families detected</span>}
                  </div>
                  {target.cape_type && (
                    <div className="mt-3 p-2 rounded-lg bg-muted/10">
                      <p className="text-xs text-muted-foreground">CAPE Type</p>
                      <p className="text-sm text-primary">{target.cape_type}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==================== TARGET TAB ==================== */}
          {activeTab === "target" && (
            <div className="space-y-6">
              {/* File Info */}
              <div className={sectionCardClass + " p-5"}>
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <h2 className="text-lg font-semibold text-foreground">{target.name || "Unknown"}</h2>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <span className="text-muted-foreground">{truncate(target.type || "N/A", 100)}</span>
                      <span className="text-muted-foreground">• {formatBytes(target.size)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {target.is_dotnet && <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm">.NET</span>}
                    {target.die.includes("de4dot") && <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-sm">Obfuscated</span>}
                  </div>
                </div>
              </div>

              {/* Hashes */}
              <div className={sectionCardClass + " p-5"}>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Fingerprint className="w-4 h-4" />File Hashes</h3>
                <div className="space-y-2">
                  <HashRow value={target.sha256} label="SHA256" />
                  <HashRow value={target.md5} label="MD5" />
                  <HashRow value={target.sha1} label="SHA1" />
                  <HashRow value={target.imphash} label="IMPHASH" />
                  <HashRow value={target.ssdeep} label="SSDEEP" />
                </div>
              </div>

              {/* PE Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={sectionCardClass + " p-5"}>
                  <div className="flex items-center gap-2 mb-4">
                    <FileCode className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">PE Information</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div><p className="text-xs text-muted-foreground">Entry Point</p><p className="text-sm font-mono">{target.entrypoint || "N/A"}</p></div>
                      <div><p className="text-xs text-muted-foreground">Compile Time</p><p className="text-sm">{formatTimestamp(target.timestamp)}</p></div>
                    </div>
                    <div><p className="text-xs text-muted-foreground">Sections</p><div className="flex flex-wrap gap-1 mt-1">{target.sections.map((s: any, idx: number) => <span key={idx} className="text-xs px-1.5 py-0.5 rounded bg-muted/20">{s.name} ({s.entropy})</span>)}</div></div>
                    {target.versioninfo.length > 0 && (
                      <div className="p-2 rounded-lg bg-muted/10">
                        <p className="text-xs text-muted-foreground mb-1">Version Info</p>
                        {target.versioninfo.slice(0, 3).map((v: any, idx: number) => (
                          <p key={idx} className="text-xs text-foreground"><span className="text-muted-foreground">{v.name}:</span> {v.value}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className={sectionCardClass + " p-5"}>
                  <div className="flex items-center gap-2 mb-4">
                    <Database className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Detect It Easy</h3>
                  </div>
                  <div className="space-y-2">
                    {target.die.map((item: string, idx: number) => (
                      <div key={idx} className="p-2 rounded-lg bg-muted/10 text-sm text-foreground">{item}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== BEHAVIOR TAB ==================== */}
          {activeTab === "behavior" && (
            <div className="space-y-6">
              {/* API Categories Chart */}
              {apiCategoryData.length > 0 && (
                <div className="rounded-3xl border border-border bg-card/80 p-5">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-sm font-semibold text-foreground">API Call Distribution by Category</h3>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.16em] text-emerald-300/80">Behavior profile</span>
                  </div>
                  <ResponsiveContainer width="100%" height={290}>
                    <BarChart data={apiCategoryData} margin={{ left: 48, right: 8, top: 4, bottom: 4 }} barCategoryGap={14}>
                      <defs>
                        <linearGradient id="capeApiCategoryBar" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor={GREEN_CHART.darkest} />
                          <stop offset="50%" stopColor={GREEN_CHART.dark} />
                          <stop offset="100%" stopColor={GREEN_CHART.light} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" stroke={GREEN_CHART.grid} vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#d1fae5" }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#a7f3d0" }} tickLine={false} axisLine={false} />
                      <Tooltip content={<GreenTooltip valueFormatter={(value) => `${value} calls`} />} />
                      <Bar dataKey="count" fill="url(#capeApiCategoryBar)" radius={[12, 12, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* File Operations */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ExpandableSection title="Files Read" items={stats.readFiles > 0 ? safeArray(capeData?.behavior?.summary?.read_files) : []} initialCount={8} renderItem={(f, idx) => <div key={idx} className="text-xs text-muted-foreground break-all py-1">{f}</div>} emptyMessage="No files read" />
                <ExpandableSection title="Files Written" items={stats.writeFiles > 0 ? safeArray(capeData?.behavior?.summary?.write_files) : []} initialCount={8} renderItem={(f, idx) => <div key={idx} className="text-xs text-amber-400 break-all py-1">{f}</div>} emptyMessage="No files written" />
                <ExpandableSection title="Files Deleted" items={stats.deleteFiles > 0 ? safeArray(capeData?.behavior?.summary?.delete_files) : []} initialCount={8} renderItem={(f, idx) => <div key={idx} className="text-xs text-red-400 break-all py-1">{f}</div>} emptyMessage="No files deleted" />
              </div>

              {/* Commands */}
              {stats.commands > 0 && (
                <ExpandableSection title="Executed Commands" items={safeArray(capeData?.behavior?.summary?.executed_commands)} initialCount={8} renderItem={(cmd, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-muted/10 border border-border">
                    <code className="text-xs text-foreground break-all font-mono">{cmd}</code>
                  </div>
                )} />
              )}

              {/* Mutexes */}
              {stats.mutexes > 0 && (
                <ExpandableSection title="Mutexes" items={safeArray(capeData?.behavior?.summary?.mutexes)} initialCount={8} renderItem={(mutex, idx) => <div key={idx} className="text-xs text-primary break-all py-1">{mutex}</div>} />
              )}

              {/* Registry Keys */}
              {stats.registryKeys > 0 && (
                <ExpandableSection title="Registry Keys" items={safeArray(capeData?.behavior?.summary?.keys)} initialCount={12} renderItem={(key, idx) => <div key={idx} className="text-xs text-muted-foreground break-all py-1 font-mono">{key}</div>} />
              )}
            </div>
          )}

          {/* ==================== SIGNATURES TAB ==================== */}
          {activeTab === "signatures" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard icon={<Shield className="w-4 h-4" />} label="Total" value={stats.signatures} />
                <StatCard icon={<AlertTriangle className="w-4 h-4" />} label="Critical" value={signatures.filter((s: any) => s.severity === 3).length} color="red" />
                <StatCard icon={<Activity className="w-4 h-4" />} label="High" value={signatures.filter((s: any) => s.severity === 2).length} color="amber" />
                <StatCard icon={<Info className="w-4 h-4" />} label="Medium" value={signatures.filter((s: any) => s.severity === 1).length} color="blue" />
              </div>

              {filteredSignatures.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p>No signatures found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredSignatures.map((sig: any, idx: number) => (
                    <div key={idx} className="rounded-lg border border-border bg-card/50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-foreground">{sig.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{sig.description || "No description"}</p>
                          {sig.categories && sig.categories.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {sig.categories.slice(0, 3).map((cat: string, cidx: number) => (
                                <span key={cidx} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/20 text-muted-foreground">{cat}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <SeverityBadge severity={sig.severity || 0} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================== PROCESSES TAB ==================== */}
          {activeTab === "processes" && (
            <div className="space-y-6">
              {/* Process Tree */}
              {processtree.length > 0 && (
                <div className={sectionCardClass + " p-5"}>
                  <div className="flex items-center gap-2 mb-4">
                    <FolderTree className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Process Tree</h3>
                  </div>
                  <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2">
                    {processtree.map((node: any, idx: number) => (
                      <ProcessTreeNode key={idx} node={node} depth={0} expandedNodes={expandedNodes} toggleNode={toggleProcessNode} />
                    ))}
                  </div>
                </div>
              )}

              {/* Process Details */}
              {filteredProcesses.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Cpu className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p>No process telemetry found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProcesses.map((proc: any, idx: number) => {
                    const isExpanded = expandedProcesses.has(proc.pid)
                    return (
                      <div key={idx} className={sectionCardClass + " overflow-hidden"}>
                        <div 
                          className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/10 transition-colors"
                          onClick={() => toggleProcessExpand(proc.pid)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${proc.suspiciousApis > 0 ? "bg-red-500/10" : "bg-primary/10"}`}>
                              <Cpu className={`w-4 h-4 ${proc.suspiciousApis > 0 ? "text-red-400" : "text-primary"}`} />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{proc.name}</p>
                              <p className="text-xs text-muted-foreground">PID {proc.pid} • {proc.callCount} API calls • {proc.threads} threads</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {proc.suspiciousApis > 0 && <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">Injection APIs: {proc.suspiciousApis}</span>}
                            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="border-t border-border p-4 space-y-4">
                            {proc.commandLine && (
                              <div className={innerSurfaceClass + " p-3"}>
                                <p className="text-[10px] uppercase text-muted-foreground mb-1">Command Line</p>
                                <p className="text-xs font-mono text-foreground break-all">{proc.commandLine}</p>
                              </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs font-semibold text-foreground mb-2">Top API Categories</p>
                                <div className="space-y-1">
                                  {proc.topCategories.map((cat: any, cidx: number) => (
                                    <div key={cidx} className="flex items-center justify-between text-xs">
                                      <span className="text-muted-foreground">{cat.category}</span>
                                      <span className="text-foreground">{cat.count}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-foreground mb-2">Top APIs</p>
                                <div className="space-y-1">
                                  {proc.topApis.map((api: any, aidx: number) => (
                                    <div key={aidx} className="flex items-center justify-between text-xs">
                                      <span className="text-muted-foreground font-mono">{api.api}</span>
                                      <span className="text-foreground">{api.count}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className={innerSurfaceClass + " p-2 text-center"}><p className="text-muted-foreground">Read Files</p><p className="text-foreground font-semibold">{proc.readFiles.length}</p></div>
                              <div className={innerSurfaceClass + " p-2 text-center"}><p className="text-muted-foreground">Write Files</p><p className="text-foreground font-semibold">{proc.writeFiles.length}</p></div>
                              <div className={innerSurfaceClass + " p-2 text-center"}><p className="text-muted-foreground">Delete Files</p><p className="text-foreground font-semibold">{proc.deleteFiles.length}</p></div>
                            </div>
                            {proc.modulePath && <p className="text-xs text-muted-foreground break-all"><span className="text-muted-foreground">Path:</span> {proc.modulePath}</p>}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ==================== NETWORK TAB ==================== */}
          {activeTab === "network" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <StatCard icon={<Globe className="w-4 h-4" />} label="Domains" value={network.domains.length} />
                <StatCard icon={<Server className="w-4 h-4" />} label="Hosts" value={network.hosts.length} />
                <StatCard icon={<Activity className="w-4 h-4" />} label="DNS Queries" value={network.dns.length} />
                <StatCard icon={<Wifi className="w-4 h-4" />} label="TCP Flows" value={network.tcp.length} />
                <StatCard icon={<WifiOff className="w-4 h-4" />} label="Dead Hosts" value={network.deadHosts.length} />
              </div>

              {network.topPorts.length > 0 && (
                <div className={sectionCardClass + " p-5"}>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Top Destination Ports</h3>
                  <div className="flex flex-wrap gap-2">
                    {network.topPorts.map((p: any, idx: number) => (
                      <div key={idx} className={innerSurfaceClass + " px-3 py-2 text-center"}>
                        <p className="text-lg font-bold text-primary">:{p.port}</p>
                        <p className="text-xs text-muted-foreground">{p.count} connections</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ExpandableSection title="Domains" items={network.domains} initialCount={10} renderItem={(d: any, idx) => <div key={idx} className="text-xs text-primary break-all py-1">{d.domain || d}</div>} emptyMessage="No domains" />
                <ExpandableSection title="DNS Queries" items={network.dns} initialCount={10} renderItem={(d: any, idx) => <div key={idx} className="p-2 rounded-lg bg-muted/10">
                  <p className="text-xs text-foreground break-all">{d.request}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Type: {d.type} • Answers: {safeArray(d.answers).length}</p>
                </div>} emptyMessage="No DNS queries" />
              </div>

              {network.pcapSha256 && (
                <div className={sectionCardClass + " p-4"}>
                  <HashRow value={network.pcapSha256} label="PCAP SHA256" />
                </div>
              )}
            </div>
          )}

          {/* ==================== FILES TAB ==================== */}
          {activeTab === "files" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard icon={<HardDrive className="w-4 h-4" />} label="Dropped Files" value={stats.droppedFiles} />
                <StatCard icon={<FileText className="w-4 h-4" />} label="Write Files" value={stats.writeFiles} />
                <StatCard icon={<FileText className="w-4 h-4" />} label="Delete Files" value={stats.deleteFiles} />
                <StatCard icon={<FileCode className="w-4 h-4" />} label="Read Files" value={stats.readFiles} />
              </div>

              {safeArray(capeData?.dropped).length > 0 && (
                <ExpandableSection title="Dropped Files" items={safeArray(capeData.dropped)} initialCount={8} renderItem={(file: any, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-muted/10 border border-border">
                    <p className="text-sm font-mono text-foreground break-all">{file.name?.[0] || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatBytes(file.size)} • {file.type?.slice(0, 60)}</p>
                    {file.guest_paths && <p className="text-[10px] text-muted-foreground mt-1 break-all">{file.guest_paths[0]}</p>}
                    {file.sha256 && <HashRow value={file.sha256} label="SHA256" />}
                  </div>
                )} />
              )}

              {capeData?.selfextract && (
                <div className={sectionCardClass + " p-5"}>
                  <div className="flex items-center gap-2 mb-3">
                    <Box className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Self-Extraction</h3>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(capeData.selfextract).map(([method, data]: [string, any]) => (
                      <div key={method} className="p-3 rounded-lg bg-muted/10">
                        <p className="text-sm font-semibold text-primary">{method}</p>
                        <p className="text-xs text-muted-foreground">Extracted {data.extracted_files?.length || 0} files</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== MITRE TAB ==================== */}
          {activeTab === "mitre" && (
            <div className="space-y-6">
                  <div className={sectionCardClass + " p-5"}>
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">MITRE ATT&CK Techniques</h3>
                  <span className="text-xs text-muted-foreground ml-auto">{mitre.techniques.length} techniques</span>
                </div>
                {mitre.techniques.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No MITRE ATT&CK mappings found</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {mitre.techniques.map((ttp: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-mono">{ttp}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Detailed TTPs */}
              {safeArray(capeData?.ttps).length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Signature to TTP Mappings</h3>
                  {safeArray(capeData?.ttps).map((ttp: any, idx: number) => (
                    <div key={idx} className={innerSurfaceClass + " p-4"}>
                      <p className="text-sm font-medium text-foreground">{ttp.signature}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {safeArray(ttp.ttps).map((t: string, tidx: number) => (
                          <span key={tidx} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/20 text-muted-foreground font-mono">{t}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================== MEMORY TAB ==================== */}
          {activeTab === "memory" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard icon={<MemoryStick className="w-4 h-4" />} label="Memory Dumps" value={memory.totalDumps} />
                <StatCard icon={<Shield className="w-4 h-4" />} label="With YARA" value={memory.dumpsWithYara} />
                <StatCard icon={<AlertTriangle className="w-4 h-4" />} label="Shellcode" value={memory.dumpsWithShellcode ? "Detected" : "None"} color={memory.dumpsWithShellcode ? "red" : "green"} />
                <StatCard icon={<FileCode className="w-4 h-4" />} label="Extracted PE" value={memory.extractedPE} />
              </div>

              {memory.yaraRules.length > 0 && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <h3 className="text-sm font-semibold text-foreground">YARA Rules Triggered</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {memory.yaraRules.map((rule: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs font-mono">{rule}</span>
                    ))}
                  </div>
                </div>
              )}

              {memory.processes.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Dumped Processes</h3>
                  <div className="flex flex-wrap gap-2">
                    {memory.processes.map((proc: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 rounded bg-muted/20 text-muted-foreground text-sm">{proc}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Memory Dump Details */}
              {safeArray(capeData?.procmemory).map((dump: any, idx: number) => (
                <div key={idx} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <MemoryStick className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">{dump.name || `PID ${dump.pid}`}</h3>
                    </div>
                    <span className="text-xs text-muted-foreground">PID {dump.pid}</span>
                  </div>
                  <HashRow value={dump.sha256} label="SHA256" />
                  {dump.extracted_pe?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground mb-2">Extracted PE Files: {dump.extracted_pe.length}</p>
                      <div className="space-y-1">
                        {dump.extracted_pe.slice(0, 3).map((pe: any, peidx: number) => (
                          <div key={peidx} className="text-xs text-muted-foreground break-all">{pe.name} ({formatBytes(pe.size)})</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// Box icon component
const Box = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </svg>
)