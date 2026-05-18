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
  TrendingUp,
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
  LineChart,
  Line,
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
  primary: "#10b981",
  red: "#ef4444",
  amber: "#f59e0b",
  yellow: "#facc15",
  blue: "#3b82f6",
  muted: "#2a2a2a",
  border: "#1a1a1a",
}

const CHART_COLORS = {
  emerald: "#10b981",
  red: "#ef4444",
  amber: "#f59e0b",
  yellow: "#facc15",
  sky: "#0ea5e9",
  slate: "#64748b",
}

const ICON_TONES = {
  slate: "bg-slate-400/10 text-white/80 ring-1 ring-slate-300/15",
  emerald: "bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-300/15",
  amber: "bg-amber-400/10 text-amber-300 ring-1 ring-amber-300/15",
  sky: "bg-sky-400/10 text-sky-300 ring-1 ring-sky-300/15",
  red: "bg-red-400/10 text-red-300 ring-1 ring-red-300/15",
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-[#062e22]/95 px-4 py-3 shadow-2xl backdrop-blur-md">
      {label && <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200/80">{label}</p>}
      <div className="space-y-2">
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center justify-between gap-4 text-xs text-white/90">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color ?? p.fill }} />
              <span className="text-white/85">{p.name}</span>
            </div>
            <span className="font-semibold text-white">{p.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [userName, setUserName] = useState("Analyst")
  const [reports, setReports] = useState<any[]>([])
  const [behaviorTotals, setBehaviorTotals] = useState<BehaviorTotals>(EMPTY_BEHAVIOR_TOTALS)
  const [behaviorCacheTime, setBehaviorCacheTime] = useState<number>(0)
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
    // Use cache if less than 5 minutes old
    const now = Date.now()
    if (behaviorCacheTime && now - behaviorCacheTime < 5 * 60 * 1000) {
      return // Cache is fresh, skip recalculation
    }

    const candidates = allReports.filter(
      (report) =>
        Boolean(report?.analysis_id) &&
        report?.components?.parsed !== false,
    )

    if (!candidates.length) {
      setBehaviorTotals(EMPTY_BEHAVIOR_TOTALS)
      setBehaviorCacheTime(now)
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
      setBehaviorCacheTime(now)
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

  const riskChartData = [
    { label: "High ≥7",    value: highRisk, fill: CHART_COLORS.red     },
    { label: "Medium 4–6", value: medRisk,  fill: CHART_COLORS.amber   },
    { label: "Low 1–3",    value: lowRisk,  fill: CHART_COLORS.yellow  },
    { label: "Clean",      value: clean,    fill: CHART_COLORS.emerald },
  ]

  const statusChartData = [
    { name: "Completed", value: completed, color: CHART_COLORS.emerald },
    { name: "Pending",   value: pending,   color: CHART_COLORS.sky     },
    { name: "Failed",    value: failed,    color: CHART_COLORS.red     },
  ].filter(d => d.value > 0)

  const recentFive = reports.slice(0, 5)

  // Weekly summary data - calculated from actual reports
  const generateWeeklyData = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const weekData: Record<string, { analyses: number; threats: number }> = {
      Sun: { analyses: 0, threats: 0 },
      Mon: { analyses: 0, threats: 0 },
      Tue: { analyses: 0, threats: 0 },
      Wed: { analyses: 0, threats: 0 },
      Thu: { analyses: 0, threats: 0 },
      Fri: { analyses: 0, threats: 0 },
      Sat: { analyses: 0, threats: 0 },
    }

    // Calculate from last 7 days of reports
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    reports.forEach((r) => {
      if (!r.created_at) return
      const date = new Date(r.created_at)
      if (date < sevenDaysAgo) return

      const dayName = days[date.getDay()]
      weekData[dayName].analyses++

      if ((r.malscore ?? 0) >= 7) {
        weekData[dayName].threats++
      }
    })

    return days.map((day) => ({
      day,
      analyses: weekData[day].analyses,
      threats: weekData[day].threats,
    }))
  }

  const weeklyData = generateWeeklyData()

  return (
    <div className="relative min-h-full bg-[#131313]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-primary/6 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-sky-500/4 blur-3xl" />
      </div>

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">

          {/* ── Header ─────────────────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-400 mb-1">Security Intelligence</p>
              <h1 className="text-3xl font-bold text-white">Welcome back, {userName}</h1>
              <p className="text-sm text-white/70 mt-1">Real-time malware analysis &amp; threat intelligence</p>
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
                className="p-2 rounded-lg border border-[#1a1a1a] text-white/75 hover:text-white hover:border-[#2a2a2a] hover:bg-white/[0.03] transition-colors"
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
                tone: ICON_TONES.emerald,
              },
              {
                label: "Threats Detected", value: highRisk,
                icon: <AlertTriangle className="w-4 h-4" />,
                alert: highRisk > 0,
                tone: ICON_TONES.red,
              },
              { label: "Pending", value: pending, icon: <Clock className="w-4 h-4" />, sub: null, tone: ICON_TONES.sky },
            ].map(({ label, value, icon, sub, alert, tone }) => (
              <div key={label} className={`rounded-2xl border bg-card/50 backdrop-blur-sm p-5 ${alert ? "border-red-500/25" : "border-border"}`}>
                <div className={`flex items-center justify-between mb-4`}>
                  <div className={`p-2 rounded-lg ${alert ? "bg-red-500/12 text-red-300 ring-1 ring-red-300/20" : tone}`}>
                    {icon}
                  </div>
                  {alert && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />}
                </div>
                <p className={`text-3xl font-bold ${alert ? "text-red-400" : "text-white"}`}>
                  {loading ? <span className="block h-8 w-12 bg-white/5 rounded animate-pulse" /> : value}
                </p>
                <p className="text-xs text-white/75 mt-2 flex items-center gap-1.5 uppercase tracking-wider">
                  {label}
                  {sub && <span className="font-mono text-emerald-400">{sub}</span>}
                </p>
              </div>
            ))}
          </motion.div>

          {/* ── Charts + Threat Intel ───────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left 2/3 — charts */}
            <div className="lg:col-span-2 space-y-6">

              {/* Analysis Status chart */}
              <motion.div variants={itemVariants}>
                <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-white/65 mb-1">Statistics</p>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-400" />
                        Analysis Status
                      </h3>
                    </div>
                    <Link href="/dashboard/reports" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 font-medium">
                      All Reports <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>

                  {loading ? (
                    <div className="h-44 bg-white/[0.03] rounded-lg animate-pulse" />
                  ) : total === 0 ? (
                    <div className="h-44 flex flex-col items-center justify-center text-white/65">
                      <FileText className="w-8 h-8 mb-2 opacity-30" />
                      <p className="text-sm">No analyses yet</p>
                      <button onClick={() => router.push("/dashboard/upload")} className="mt-2 text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
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
                          { label: "Completed", value: completed, color: CHART_COLORS.emerald },
                          { label: "Pending",   value: pending,   color: CHART_COLORS.sky       },
                          { label: "Failed",    value: failed,    color: CHART_COLORS.red      },
                        ].map(({ label, value, color }) => (
                          <div key={label} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                              <span className="text-sm text-white/80">{label}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-white font-mono">{value}</span>
                              <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{ width: `${total > 0 ? (value / total) * 100 : 0}%`, background: color }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                          <span className="text-xs text-white/70 uppercase tracking-wider">Total</span>
                          <span className="text-sm font-bold text-white font-mono">{total}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Risk Distribution chart */}
              <motion.div variants={itemVariants}>
                <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-white/65 mb-1">Assessment</p>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Shield className="w-5 h-5 text-white/80" />
                      Risk Distribution
                    </h3>
                  </div>

                  <div className="mt-6">
                    {loading ? (
                      <div className="h-44 bg-white/[0.03] rounded-lg animate-pulse" />
                    ) : total === 0 ? (
                      <div className="h-44 flex items-center justify-center text-white/65">
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
                              tick={{ fill: "#888", fontSize: 11, fontFamily: "monospace" }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                            <Bar dataKey="value" radius={[0, 8, 8, 0]} maxBarSize={20}>
                              {riskChartData.map((entry, i) => (
                                <Cell key={i} fill={entry.fill} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

            </div>

            {/* Right 1/3 — threat intel */}
            <div className="space-y-6">
              <motion.div variants={itemVariants}>
                <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-white/65 mb-1">Intelligence</p>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Radar className="w-5 h-5 text-violet-400" />
                        Threat Intel
                      </h3>
                    </div>
                    <Link href="/dashboard/threat-intel/unified" className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 font-medium">
                      Unified <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="rounded-xl border border-border bg-white/5 p-4 hover:bg-white/[0.07] transition-colors">
                      <p className="text-[10px] text-white/65 uppercase tracking-wider mb-2">Active Sources</p>
                      <p className="text-3xl font-bold text-white">8</p>
                    </div>
                    <div className="rounded-xl border border-border bg-white/5 p-4 hover:bg-white/[0.07] transition-colors">
                      <p className="text-[10px] text-white/65 uppercase tracking-wider mb-2">Queries Today</p>
                      <p className="text-3xl font-bold text-emerald-400">{loading ? "—" : threatIntelQueries}</p>
                    </div>
                  </div>

                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/65 mb-3 font-semibold">Connected Services</p>
                  <div className="space-y-1.5 flex-1">
                    {["VirusTotal", "MalwareBazaar", "Hybrid Analysis", "AlienVault OTX", "Filescan.io", "URLhaus", "ThreatFox", "AbuseIPDB"].map((name) => (
                      <div key={name} className="flex items-center justify-between px-3 py-2 rounded-lg border border-white/5 bg-white/[0.01]">
                        <span className="text-xs text-white/75 font-medium">{name}</span>
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/dashboard/threat-intel/unified"
                    className="mt-6 block w-full text-center text-sm font-semibold px-4 py-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15 transition-colors"
                  >
                    Search All Sources
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>

          {/* ── Quick Actions + Behavior Metrics (Full Width) ─────────── */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <QuickActions />

              <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-white/65 mb-1">Aggregated</p>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Activity className="w-5 h-5 text-emerald-400" />
                      Behavior Metrics
                    </h3>
                  </div>
                  <span className="text-[10px] text-white/65 uppercase tracking-wider font-semibold">All reports</span>
                </div>

                {behaviorLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="rounded-lg border border-white/5 p-4 animate-pulse">
                        <div className="h-3 w-24 bg-white/5 rounded" />
                        <div className="mt-3 h-5 w-20 bg-white/5 rounded" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 auto-rows-fr">
                    {[
                      { label: "API Calls", value: formatCount(behaviorTotals.apiCalls, "calls"), color: "text-emerald-400" },
                      { label: "Registry Changes", value: formatCount(behaviorTotals.registryChanges, "changes"), color: "text-white" },
                      { label: "Network Traffic", value: formatCount(behaviorTotals.networkTraffic, "events"), color: "text-amber-400" },
                      { label: "File Activity", value: formatCount(behaviorTotals.fileSystemActivity, "ops"), color: "text-violet-400" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-xl border border-white/5 bg-white/[0.01] p-4 h-full"
                      >
                        <p className="text-xs text-white/70 uppercase tracking-wider font-semibold mb-3">{item.label}</p>
                        <p className={`text-base font-bold font-mono ${item.color}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* ── Weekly Summary ────────────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/65 mb-1">Overview</p>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    Weekly Activity
                  </h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-emerald-400" />
                    <span className="text-xs text-white/70">Analyses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-red-400" />
                    <span className="text-xs text-white/70">Threats</span>
                  </div>
                </div>
              </div>

              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData} margin={{ top: 5, right: 12, left: 0, bottom: 5 }}>
                    <XAxis dataKey="day" stroke="#888" style={{ fontSize: "11px" }} />
                    <YAxis stroke="#888" style={{ fontSize: "11px" }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="analyses" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 4 }} />
                    <Line type="monotone" dataKey="threats" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          {/* ── Recent Analyses ─────────────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/65 mb-1">Latest</p>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    Recent Analyses
                  </h3>
                </div>
                <Link href="/dashboard/reports" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 font-medium">
                  View All <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-4 h-12 animate-pulse">
                      <div className="w-5 h-5 bg-white/5 rounded" />
                      <div className="flex-1 h-3 bg-white/5 rounded" />
                      <div className="w-16 h-3 bg-white/5 rounded" />
                      <div className="w-20 h-3 bg-white/5 rounded" />
                    </div>
                  ))}
                </div>
              ) : recentFive.length === 0 ? (
                <div className="py-12 text-center">
                  <FileText className="w-8 h-8 text-white/35 mx-auto mb-3" />
                  <p className="text-sm text-white/70 mb-2">No analyses yet</p>
                  <p className="text-xs text-white/55 mb-4">Upload a file to begin real-time malware analysis</p>
                  <button onClick={() => router.push("/dashboard/upload")} className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                    Upload a sample
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left text-xs text-white/75 font-semibold pb-3 pr-4 uppercase tracking-wider">File</th>
                        <th className="text-left text-xs text-white/75 font-semibold pb-3 pr-4 uppercase tracking-wider">Status</th>
                        <th className="text-left text-xs text-white/75 font-semibold pb-3 pr-4 uppercase tracking-wider">Score</th>
                        <th className="text-left text-xs text-white/75 font-semibold pb-3 pr-4 uppercase tracking-wider">Date</th>
                        <th className="text-left text-xs text-white/75 font-semibold pb-3 uppercase tracking-wider" />
                      </tr>
                    </thead>
                    <tbody>
                      {recentFive.map((r, i) => {
                        const done = isCompletedStatus(r.status)
                        const pend = isPendingStatus(r.status)
                        const fail = isFailedStatus(r.status)
                        const score = r.malscore ?? null
                        const scoreColor =
                          score === null ? "text-white/65" :
                          score >= 7 ? "text-red-400 font-bold" :
                          score >= 4 ? "text-amber-400 font-bold" : "text-emerald-400"
                        return (
                          <tr
                            key={r.analysis_id}
                            onClick={() => router.push(`/dashboard/analysis/${r.analysis_id}`)}
                            className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] cursor-pointer transition-all group"
                          >
                            <td className="py-3 pr-4">
                              <div className="flex items-center gap-2">
                                <FileText className="w-3.5 h-3.5 text-white/40 shrink-0" />
                                <span className="text-white/90 truncate max-w-[240px] font-medium">{r.filename || "Unknown"}</span>
                              </div>
                            </td>
                            <td className="py-3 pr-4">
                              {done ? (
                                <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                                  <CheckCircle className="w-3 h-3" /> Completed
                                </span>
                              ) : pend ? (
                                <span className="inline-flex items-center gap-1 text-xs text-white/80 font-medium">
                                  <Loader className="w-3 h-3 animate-spin" /> Processing
                                </span>
                              ) : fail ? (
                                <span className="inline-flex items-center gap-1 text-xs text-red-400 font-medium">
                                  <XCircle className="w-3 h-3" /> Failed
                                </span>
                              ) : (
                                <span className="text-xs text-white/70 capitalize font-medium">{r.status}</span>
                              )}
                            </td>
                            <td className="py-3 pr-4">
                              <span className={`font-mono text-xs ${scoreColor}`}>
                                {score !== null ? score.toFixed(1) : "—"}
                              </span>
                            </td>
                            <td className="py-3 pr-4 text-xs text-white/70 font-medium">
                              {r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}
                            </td>
                            <td className="py-3">
                              <ArrowUpRight className="w-4 h-4 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  )
}




