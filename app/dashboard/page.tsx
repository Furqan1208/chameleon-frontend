// app/dashboard/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  AlertTriangle,
  FileText,
  Activity,
  Clock,
  ArrowUpRight,
  ChevronRight,
  CheckCircle,
  Radar,
  Upload,
  RefreshCw,
  Loader,
  XCircle,
  Shield,
} from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { apiService } from "@/services/api/api.service"
import { QuickActions } from "@/components/dashboard/QuickActions"
import { DashboardSwitcher } from "@/components/dashboard/DashboardSwitcher"
import { isCompletedStatus, isPendingStatus, isFailedStatus } from "@/lib/analysis-status"

type BehaviorTotals = {
  apiCalls: number
  registryChanges: number
  networkTraffic: number
  fileSystemActivity: number
  memoryArtifacts: number
}

const EMPTY_BEHAVIOR_TOTALS: BehaviorTotals = {
  apiCalls: 0,
  registryChanges: 0,
  networkTraffic: 0,
  fileSystemActivity: 0,
  memoryArtifacts: 0,
}

function safeNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

function sumByHints(node: unknown, hints: string[], depth = 0): number {
  if (depth > 7 || node == null) return 0
  if (Array.isArray(node)) {
    return node.reduce((acc, item) => acc + sumByHints(item, hints, depth + 1), 0)
  }
  if (typeof node !== "object") return 0

  let total = 0
  for (const [rawKey, value] of Object.entries(node as Record<string, unknown>)) {
    const key = rawKey.toLowerCase()
    const match = hints.some((hint) => key.includes(hint))

    if (match) {
      if (typeof value === "number" || typeof value === "string") {
        total += safeNumber(value)
      } else if (Array.isArray(value)) {
        total += value.length
      }
    }

    if (value && typeof value === "object") {
      total += sumByHints(value, hints, depth + 1)
    }
  }

  return total
}

function extractBehaviorTotals(parsedPayload: any): BehaviorTotals {
  const sections = parsedPayload?.sections ?? parsedPayload ?? {}

  return {
    apiCalls: sumByHints(sections, ["api_call", "api", "syscall", "call"]),
    registryChanges: sumByHints(sections, ["registry", "regkey", "reg_"]),
    networkTraffic: sumByHints(sections, ["network", "dns", "http", "tcp", "udp", "beacon", "connection", "domain", "host", "ip"]),
    fileSystemActivity: sumByHints(sections, ["filesystem", "file", "write", "dropped", "created", "modified"]),
    memoryArtifacts: sumByHints(sections, ["memory", "inject", "injection", "hollow", "shellcode"]),
  }
}

function formatCount(value: number, suffix: string): string {
  const safe = Math.max(0, Math.round(value))

  if (safe >= 1_000_000_000) {
    const compact = (safe / 1_000_000_000).toFixed(1).replace(/\.0$/, "")
    return `${compact}B+ ${suffix}`
  }

  if (safe >= 1_000_000) {
    const compact = (safe / 1_000_000).toFixed(1).replace(/\.0$/, "")
    return `${compact}M+ ${suffix}`
  }

  if (safe >= 100_000) {
    const compact = (safe / 1_000).toFixed(0)
    return `${compact}K+ ${suffix}`
  }

  return `${safe.toLocaleString()} ${suffix}`
}

const COLORS = {
  primary: "#00ff88",
  red: "#f87171",
  yellow: "#facc15",
  muted: "#2a2a2a",
  border: "#1a1a1a",
}

const ICON_TONES = {
  slate: "bg-slate-400/10 text-slate-300 ring-1 ring-slate-300/15",
  teal: "bg-teal-400/10 text-teal-300 ring-1 ring-teal-300/15",
  amber: "bg-amber-400/10 text-amber-300 ring-1 ring-amber-300/15",
  blue: "bg-sky-400/10 text-sky-300 ring-1 ring-sky-300/15",
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] ${className}`}>
      {children}
    </div>
  )
}

function CardHeader({ title, icon, action }: { title: string; icon: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        {icon}
        {title}
      </h3>
      {action}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] px-3 py-2 text-xs shadow-xl">
      {label && <p className="text-muted-foreground mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color ?? p.fill }} className="font-medium">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [userName, setUserName] = useState("Analyst")
  const [reports, setReports] = useState<any[]>([])
  const [behaviorTotals, setBehaviorTotals] = useState<BehaviorTotals>(EMPTY_BEHAVIOR_TOTALS)
  const [threatIntelQueries, setThreatIntelQueries] = useState(0)
  const [loading, setLoading] = useState(true)
  const [behaviorLoading, setBehaviorLoading] = useState(false)

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [me, rpts] = await Promise.all([apiService.getMe(), apiService.getAllReports()])
      const nextReports = Array.isArray(rpts) ? rpts : []
      if (me?.name?.trim()) setUserName(me.name.trim())
      setThreatIntelQueries(me?.threat_intel_queries_today ?? 0)
      if (typeof window !== "undefined") localStorage.setItem("user", JSON.stringify(me))
      setReports(nextReports)
      void loadBehaviorTotals(nextReports)
    } catch {
      try {
        const fallbackReports = await apiService.getAllReports()
        const normalized = Array.isArray(fallbackReports) ? fallbackReports : []
        setReports(normalized)
        void loadBehaviorTotals(normalized)
      } catch {
        setReports([])
        setBehaviorTotals(EMPTY_BEHAVIOR_TOTALS)
      }
      const stored = apiService.getStoredUser()
      if (stored?.name?.trim()) setUserName(stored.name.trim())
      setThreatIntelQueries(stored?.threat_intel_queries_today ?? 0)
    } finally {
      setLoading(false)
    }
  }

  const loadBehaviorTotals = async (allReports: any[]) => {
    const candidates = allReports.filter(
      (report) =>
        Boolean(report?.analysis_id) &&
        report?.components?.parsed !== false,
    )

    if (!candidates.length) {
      setBehaviorTotals(EMPTY_BEHAVIOR_TOTALS)
      setBehaviorLoading(false)
      return
    }

    setBehaviorLoading(true)
    try {
      const parsedResults = await Promise.allSettled(
        candidates.map((report) => apiService.getParsedSection(report.analysis_id, "all")),
      )

      const aggregated = parsedResults.reduce<BehaviorTotals>((acc, result) => {
        if (result.status !== "fulfilled") return acc

        const payload = result.value?.data ?? result.value
        const values = extractBehaviorTotals(payload)

        return {
          apiCalls: acc.apiCalls + values.apiCalls,
          registryChanges: acc.registryChanges + values.registryChanges,
          networkTraffic: acc.networkTraffic + values.networkTraffic,
          fileSystemActivity: acc.fileSystemActivity + values.fileSystemActivity,
          memoryArtifacts: acc.memoryArtifacts + values.memoryArtifacts,
        }
      }, EMPTY_BEHAVIOR_TOTALS)

      setBehaviorTotals(aggregated)
    } catch {
      setBehaviorTotals(EMPTY_BEHAVIOR_TOTALS)
    } finally {
      setBehaviorLoading(false)
    }
  }

  // ── Derived stats ────────────────────────────────────────────────────────────
  const total = reports.length
  const completed = reports.filter(r => isCompletedStatus(r.status)).length
  const pending   = reports.filter(r => isPendingStatus(r.status)).length
  const failed    = reports.filter(r => isFailedStatus(r.status)).length
  const highRisk  = reports.filter(r => (r.malscore ?? 0) >= 7).length
  const medRisk   = reports.filter(r => (r.malscore ?? 0) >= 4 && (r.malscore ?? 0) < 7).length
  const lowRisk   = reports.filter(r => (r.malscore ?? 0) >= 1 && (r.malscore ?? 0) < 4).length
  const clean     = reports.filter(r => (r.malscore ?? 0) === 0).length

  const statusChartData = [
    { name: "Completed", value: completed, color: COLORS.primary },
    { name: "Pending",   value: pending,   color: "#60a5fa"       },
    { name: "Failed",    value: failed,    color: COLORS.red      },
  ].filter(d => d.value > 0)

  const riskChartData = [
    { label: "High ≥7",    value: highRisk, fill: COLORS.red     },
    { label: "Medium 4–6", value: medRisk,  fill: "#fb923c"      },
    { label: "Low 1–3",    value: lowRisk,  fill: COLORS.yellow  },
    { label: "Clean",      value: clean,    fill: COLORS.primary },
  ]

  const recentFive = reports.slice(0, 5)

  return (
    <div className="relative min-h-full bg-[#080808]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-sky-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">

          {/* ── Header ─────────────────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary mb-1">Command Surface</p>
              <h1 className="text-2xl font-semibold text-white">Welcome back, {userName}</h1>
              <p className="text-muted-foreground text-sm mt-0.5">Malware analysis &amp; threat intelligence</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <DashboardSwitcher currentPath="/dashboard" />
              <button
                onClick={() => router.push("/dashboard/upload")}
                className="h-10 px-4 rounded-lg border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/20 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-4 h-4" />
                New Analysis
              </button>
              <button
                onClick={loadAll}
                className="p-2 rounded-lg border border-[#1a1a1a] text-slate-300 hover:text-foreground hover:border-[#2a2a2a] hover:bg-white/[0.02] transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* ── Stat Cards ─────────────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Analyses", value: total, icon: <FileText className="w-4 h-4" />, sub: null, tone: ICON_TONES.slate },
              {
                label: "Completed", value: completed,
                icon: <CheckCircle className="w-4 h-4" />,
                sub: total > 0 ? `${Math.round((completed / total) * 100)}%` : null,
                tone: ICON_TONES.teal,
              },
              {
                label: "Threats Detected", value: highRisk,
                icon: <AlertTriangle className="w-4 h-4" />,
                alert: highRisk > 0,
                tone: ICON_TONES.amber,
              },
              { label: "Pending", value: pending, icon: <Clock className="w-4 h-4" />, sub: null, tone: ICON_TONES.blue },
            ].map(({ label, value, icon, sub, alert, tone }) => (
              <Card key={label} className={`p-5 ${alert ? "border-red-500/25" : ""}`}>
                <div className={`flex items-center justify-between mb-3`}>
                  <div className={`p-1.5 rounded-md ${alert ? "bg-red-500/12 text-red-300 ring-1 ring-red-300/20" : tone}`}>
                    {icon}
                  </div>
                  {alert && <span className="w-1.5 h-1.5 rounded-full bg-red-400" />}
                </div>
                <p className={`text-3xl font-semibold ${alert ? "text-red-400" : "text-white"}`}>
                  {loading ? <span className="block h-8 w-12 bg-white/5 rounded animate-pulse" /> : value}
                </p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                  {label}
                  {sub && <span className="font-mono text-primary">{sub}</span>}
                </p>
              </Card>
            ))}
          </motion.div>

          {/* ── Charts + Threat Intel ───────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left 2/3 — charts */}
            <div className="lg:col-span-2 space-y-6">

              {/* Analysis Status chart */}
              <motion.div variants={itemVariants}>
                <Card className="p-5">
                  <CardHeader
                    title="Analysis Status"
                    icon={<Activity className="w-4 h-4 text-teal-300" />}
                    action={
                      <Link href="/dashboard/reports" className="text-xs text-primary hover:underline flex items-center gap-1">
                        All Reports <ChevronRight className="w-3 h-3" />
                      </Link>
                    }
                  />

                  {loading ? (
                    <div className="h-44 bg-white/[0.03] rounded-lg animate-pulse" />
                  ) : total === 0 ? (
                    <div className="h-44 flex flex-col items-center justify-center text-muted-foreground">
                      <FileText className="w-8 h-8 mb-2 opacity-30" />
                      <p className="text-sm">No analyses yet</p>
                      <button onClick={() => router.push("/dashboard/upload")} className="mt-2 text-xs text-primary hover:underline">
                        Upload a sample
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-6">
                      {/* Donut */}
                      <div className="shrink-0" style={{ width: 160, height: 160 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={statusChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={72}
                              paddingAngle={3}
                              dataKey="value"
                              stroke="none"
                            >
                              {statusChartData.map((entry, i) => (
                                <Cell key={i} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Legend + numbers */}
                      <div className="flex-1 space-y-3">
                        {[
                          { label: "Completed", value: completed, color: COLORS.primary },
                          { label: "Pending",   value: pending,   color: "#60a5fa"       },
                          { label: "Failed",    value: failed,    color: COLORS.red      },
                        ].map(({ label, value, color }) => (
                          <div key={label} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                              <span className="text-sm text-muted-foreground">{label}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold text-white font-mono">{value}</span>
                              <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{ width: `${total > 0 ? (value / total) * 100 : 0}%`, background: color }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="pt-1 border-t border-[#1a1a1a] flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Total</span>
                          <span className="text-sm font-bold text-white font-mono">{total}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>

              {/* Risk Distribution chart */}
              <motion.div variants={itemVariants}>
                <Card className="p-5">
                  <CardHeader
                    title="Risk Distribution"
                    icon={<Shield className="w-4 h-4 text-sky-300" />}
                  />

                  {loading ? (
                    <div className="h-44 bg-white/[0.03] rounded-lg animate-pulse" />
                  ) : total === 0 ? (
                    <div className="h-44 flex items-center justify-center text-muted-foreground">
                      <p className="text-sm">No data</p>
                    </div>
                  ) : (
                    <div className="h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={riskChartData}
                          layout="vertical"
                          margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
                        >
                          <XAxis type="number" hide />
                          <YAxis
                            type="category"
                            dataKey="label"
                            width={76}
                            tick={{ fill: "#888", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={18}>
                            {riskChartData.map((entry, i) => (
                              <Cell key={i} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </Card>
              </motion.div>

            </div>

            {/* Right 1/3 — threat intel */}
            <div className="space-y-6">
              <motion.div variants={itemVariants}>
                <Card className="p-5">
                  <CardHeader
                    title="Threat Intel"
                    icon={<Radar className="w-4 h-4 text-violet-300" />}
                    action={
                      <Link href="/dashboard/threat-intel/unified" className="text-xs text-primary hover:underline flex items-center gap-1">
                        Unified <ChevronRight className="w-3 h-3" />
                      </Link>
                    }
                  />

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="rounded-lg border border-[#1a1a1a] p-3">
                      <p className="text-[11px] text-muted-foreground mb-1">Sources</p>
                      <p className="text-2xl font-semibold text-white">8</p>
                    </div>
                    <div className="rounded-lg border border-[#1a1a1a] p-3">
                      <p className="text-[11px] text-muted-foreground mb-1">Today</p>
                      <p className="text-2xl font-semibold text-white">{loading ? "—" : threatIntelQueries}</p>
                    </div>
                  </div>

                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">Active Sources</p>
                  <div className="space-y-1.5">
                    {["VirusTotal", "AbuseIPDB", "MalwareBazaar", "Hybrid Analysis", "AlienVault OTX", "Filescan.io", "ThreatFox"].map((name) => (
                      <div key={name} className="flex items-center justify-between px-3 py-2 rounded-lg border border-[#1a1a1a]">
                        <span className="text-xs text-foreground">{name}</span>
                        <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/dashboard/threat-intel/unified"
                    className="mt-4 block w-full text-center text-sm font-medium px-4 py-2.5 rounded-lg border border-primary/30 text-primary hover:bg-primary/5 transition-colors"
                  >
                    Search All Sources
                  </Link>
                </Card>
              </motion.div>
            </div>
          </div>

          {/* ── Quick Actions + Behavior Metrics (Full Width) ─────────── */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
              <QuickActions />

              <Card className="p-5 h-full">
                <CardHeader
                  title="Behavior Metrics"
                  icon={<Activity className="w-4 h-4 text-emerald-300" />}
                  action={<span className="text-[11px] text-muted-foreground">All reports</span>}
                />

                {behaviorLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="rounded-lg border border-[#1a1a1a] p-3 animate-pulse">
                        <div className="h-3 w-24 bg-white/5 rounded" />
                        <div className="mt-3 h-4 w-20 bg-white/5 rounded" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 auto-rows-fr">
                    {[
                      { label: "API Calls", value: formatCount(behaviorTotals.apiCalls, "calls"), color: "text-primary" },
                      { label: "Registry Changes", value: formatCount(behaviorTotals.registryChanges, "changes"), color: "text-secondary" },
                      { label: "Network Traffic", value: formatCount(behaviorTotals.networkTraffic, "events"), color: "text-accent" },
                      { label: "File System Activity", value: formatCount(behaviorTotals.fileSystemActivity, "ops"), color: "text-primary" },
                      { label: "Memory Artifacts", value: formatCount(behaviorTotals.memoryArtifacts, "findings"), color: "text-secondary" },
                    ].map((item, idx, arr) => (
                      <div
                        key={item.label}
                        className={`rounded-lg border border-[#1a1a1a] bg-black/50 p-3 h-full ${arr.length % 2 === 1 && idx === arr.length - 1 ? "sm:col-span-2" : ""}`}
                      >
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className={`mt-2 text-sm font-mono ${item.color}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </motion.div>

          {/* ── Recent Analyses ─────────────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <Card className="p-5">
              <CardHeader
                title="Recent Analyses"
                icon={<Activity className="w-4 h-4 text-emerald-300" />}
                action={
                  <Link href="/dashboard/reports" className="text-xs text-primary hover:underline flex items-center gap-1">
                    View All <ChevronRight className="w-3 h-3" />
                  </Link>
                }
              />

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-4 h-10 animate-pulse">
                      <div className="w-5 h-5 bg-white/5 rounded" />
                      <div className="flex-1 h-3 bg-white/5 rounded" />
                      <div className="w-16 h-3 bg-white/5 rounded" />
                      <div className="w-20 h-3 bg-white/5 rounded" />
                    </div>
                  ))}
                </div>
              ) : recentFive.length === 0 ? (
                <div className="py-10 text-center">
                  <FileText className="w-7 h-7 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No analyses yet — upload a file to begin.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#1a1a1a]">
                        <th className="text-left text-xs text-muted-foreground font-normal pb-2 pr-4">File</th>
                        <th className="text-left text-xs text-muted-foreground font-normal pb-2 pr-4">Status</th>
                        <th className="text-left text-xs text-muted-foreground font-normal pb-2 pr-4">Score</th>
                        <th className="text-left text-xs text-muted-foreground font-normal pb-2 pr-4">Date</th>
                        <th className="text-left text-xs text-muted-foreground font-normal pb-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {recentFive.map((r, i) => {
                        const done = isCompletedStatus(r.status)
                        const pend = isPendingStatus(r.status)
                        const fail = isFailedStatus(r.status)
                        const score = r.malscore ?? null
                        const scoreColor =
                          score === null ? "text-muted-foreground" :
                          score >= 7 ? "text-red-400" :
                          score >= 4 ? "text-yellow-400" : "text-primary"
                        return (
                          <tr
                            key={r.analysis_id}
                            onClick={() => router.push(`/dashboard/analysis/${r.analysis_id}`)}
                            className="border-b border-[#111] last:border-0 hover:bg-white/[0.02] cursor-pointer transition-colors group"
                          >
                            <td className="py-3 pr-4">
                              <div className="flex items-center gap-2">
                                <FileText className="w-3.5 h-3.5 text-slate-300/90 shrink-0" />
                                <span className="text-white truncate max-w-[240px]">{r.filename || "Unknown"}</span>
                              </div>
                            </td>
                            <td className="py-3 pr-4">
                              {done ? (
                                <span className="inline-flex items-center gap-1 text-xs text-primary">
                                  <CheckCircle className="w-3 h-3" /> Completed
                                </span>
                              ) : pend ? (
                                <span className="inline-flex items-center gap-1 text-xs text-blue-400">
                                  <Loader className="w-3 h-3 animate-spin" /> Processing
                                </span>
                              ) : fail ? (
                                <span className="inline-flex items-center gap-1 text-xs text-red-400">
                                  <XCircle className="w-3 h-3" /> Failed
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground capitalize">{r.status}</span>
                              )}
                            </td>
                            <td className="py-3 pr-4">
                              <span className={`font-mono text-xs ${scoreColor}`}>
                                {score !== null ? score : "—"}
                              </span>
                            </td>
                            <td className="py-3 pr-4 text-xs text-muted-foreground">
                              {r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}
                            </td>
                            <td className="py-3">
                              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400/90 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </motion.div>

        </motion.div>
      </div>
    </div>
  )
}




