"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts"
import {
  Shield,
  Target,
  Users,
  Wrench,
  Bug,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Layers,
  RefreshCw,
  Radar,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { apiService } from "@/services/api/api.service"
import { isCompletedStatus } from "@/lib/analysis-status"
import { DashboardSwitcher } from "@/components/dashboard/DashboardSwitcher"

type DomainKey = "enterprise" | "ics" | "mobile"

type MitreObject = {
  type?: string
  id?: string
  name?: string
  revoked?: boolean
  x_mitre_deprecated?: boolean
  x_mitre_is_subtechnique?: boolean
  x_mitre_shortname?: string
  kill_chain_phases?: Array<{ kill_chain_name?: string; phase_name?: string }>
  external_references?: Array<{ source_name?: string; external_id?: string }>
  relationship_type?: string
  source_ref?: string
  target_ref?: string
}

type MitreBundle = {
  objects?: MitreObject[]
}

type DomainStats = {
  tactics: number
  techniques: number
  subtechniques: number
  activeTechniques: number
  deprecatedTechniques: number
  revokedTechniques: number
  groups: number
  malware: number
  tools: number
  topGroups: Array<{ name: string; value: number }>
  topTactics: Array<{ name: string; value: number }>
  techniqueNameByExternalId: Record<string, string>
}

type ReportTechniqueStats = {
  reportsAnalyzed: number
  reportsWithTechniques: number
  uniqueTechniques: number
  totalDetections: number
  topDetectedTechniques: Array<{ id: string; value: number }>
}

const DOMAIN_FILES: Record<DomainKey, string> = {
  enterprise: "/data/mitre/enterprise-attack.json",
  ics: "/data/mitre/ics-attack.json",
  mobile: "/data/mitre/mobile-attack.json",
}

const DOMAIN_OPTIONS: Array<{ label: string; value: DomainKey }> = [
  { label: "Enterprise", value: "enterprise" },
  { label: "ICS", value: "ics" },
  { label: "Mobile", value: "mobile" },
]

const CHART_COLORS = {
  emerald: "#10b981",
  red: "#ef4444",
  amber: "#f59e0b",
  yellow: "#facc15",
  sky: "#0ea5e9",
  violet: "#8b5cf6",
  slate: "#64748b",
}

const STATUS_COLORS = [CHART_COLORS.emerald, CHART_COLORS.amber, CHART_COLORS.red]

function toTechniqueIdSet(value: unknown): Set<string> {
  const text = typeof value === "string" ? value : JSON.stringify(value)
  const matches = text.match(/T\d{4}(?:\.\d{3})?/g) || []
  return new Set(matches)
}

function getExternalId(obj: MitreObject): string | undefined {
  const refs = obj.external_references || []
  const mitreRef = refs.find((ref) => ref.source_name === "mitre-attack")
  return mitreRef?.external_id
}

function computeMitreStats(bundle: MitreBundle): DomainStats {
  const objects = bundle.objects || []

  const tactics = objects.filter((obj) => obj.type === "x-mitre-tactic")
  const allPatterns = objects.filter((obj) => obj.type === "attack-pattern")
  const techniques = allPatterns.filter((obj) => !obj.x_mitre_is_subtechnique)
  const subtechniques = allPatterns.filter((obj) => obj.x_mitre_is_subtechnique)

  const activeTechniques = allPatterns.filter(
    (obj) => !obj.x_mitre_deprecated && !obj.revoked,
  )
  const deprecatedTechniques = allPatterns.filter((obj) => Boolean(obj.x_mitre_deprecated))
  const revokedTechniques = allPatterns.filter((obj) => Boolean(obj.revoked))

  const groups = objects.filter((obj) => obj.type === "intrusion-set")
  const malware = objects.filter((obj) => obj.type === "malware")
  const tools = objects.filter((obj) => obj.type === "tool")
  const relationships = objects.filter((obj) => obj.type === "relationship")

  const objectNameById: Record<string, string> = {}
  const tacticNameByShortname: Record<string, string> = {}
  const techniqueNameByExternalId: Record<string, string> = {}

  for (const obj of objects) {
    if (obj.id && obj.name) {
      objectNameById[obj.id] = obj.name
    }
    if (obj.type === "x-mitre-tactic" && obj.x_mitre_shortname && obj.name) {
      tacticNameByShortname[obj.x_mitre_shortname] = obj.name
    }
    if (obj.type === "attack-pattern" && obj.name) {
      const externalId = getExternalId(obj)
      if (externalId) {
        techniqueNameByExternalId[externalId] = obj.name
      }
    }
  }

  const groupUsage = new Map<string, number>()
  for (const rel of relationships) {
    if (rel.relationship_type !== "uses") continue
    if (!rel.source_ref || !rel.target_ref) continue

    const sourceName = objectNameById[rel.source_ref] || "Unknown Group"
    const targetType = rel.target_ref.split("--")[0]

    if (targetType === "attack-pattern") {
      groupUsage.set(sourceName, (groupUsage.get(sourceName) || 0) + 1)
    }
  }

  const topGroups = Array.from(groupUsage.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }))

  const tacticUsage = new Map<string, number>()
  for (const tech of allPatterns) {
    const phases = tech.kill_chain_phases || []
    for (const phase of phases) {
      if (!phase.phase_name) continue
      const tacticName = tacticNameByShortname[phase.phase_name] || phase.phase_name
      tacticUsage.set(tacticName, (tacticUsage.get(tacticName) || 0) + 1)
    }
  }

  const topTactics = Array.from(tacticUsage.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }))

  return {
    tactics: tactics.length,
    techniques: techniques.length,
    subtechniques: subtechniques.length,
    activeTechniques: activeTechniques.length,
    deprecatedTechniques: deprecatedTechniques.length,
    revokedTechniques: revokedTechniques.length,
    groups: groups.length,
    malware: malware.length,
    tools: tools.length,
    topGroups,
    topTactics,
    techniqueNameByExternalId,
  }
}

async function computeReportTechniqueStats(): Promise<ReportTechniqueStats> {
  const reports = await apiService.getAllReports()
  const completedReports = (Array.isArray(reports) ? reports : []).filter((report) =>
    isCompletedStatus(report.status),
  )

  const recent = completedReports.slice(0, 40)
  const techniqueCounter = new Map<string, number>()
  let reportsWithTechniques = 0

  const parsedResults = await Promise.allSettled(
    recent.map(async (report) => {
      const analysisId = report.analysis_id
      if (!analysisId) return new Set<string>()

      const components = await apiService.getAnalysisComponents(analysisId)
      if (!components?.components?.parsed) return new Set<string>()

      const parsed = await apiService.getParsedSection(analysisId, "all")
      const parsedData = parsed?.data || parsed
      const signaturesSection = parsedData?.sections?.signatures
      return toTechniqueIdSet(signaturesSection)
    }),
  )

  for (const item of parsedResults) {
    if (item.status !== "fulfilled") continue

    const techniquesInReport = item.value
    if (techniquesInReport.size > 0) {
      reportsWithTechniques += 1
    }

    for (const techniqueId of techniquesInReport) {
      techniqueCounter.set(techniqueId, (techniqueCounter.get(techniqueId) || 0) + 1)
    }
  }

  const topDetectedTechniques = Array.from(techniqueCounter.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id, value]) => ({ id, value }))

  return {
    reportsAnalyzed: recent.length,
    reportsWithTechniques,
    uniqueTechniques: techniqueCounter.size,
    totalDetections: Array.from(techniqueCounter.values()).reduce(
      (acc, value) => acc + value,
      0,
    ),
    topDetectedTechniques,
  }
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string
  value: number
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/50 p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-lg border border-white/5 bg-white/[0.03] p-2 text-white/80">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-white">{value.toLocaleString()}</p>
      <p className="mt-2 text-xs uppercase tracking-wider text-white/65">{label}</p>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-[#062e22]/95 px-4 py-3 text-xs shadow-2xl backdrop-blur-md">
      {label && <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200/80">{label}</p>}
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center justify-between gap-4 text-xs text-white/90">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
            <span className="text-white/85">{entry.name}</span>
          </div>
          <span className="font-semibold text-white">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function MitreDashboardPage() {
  const router = useRouter()
  const [activeDomain, setActiveDomain] = useState<DomainKey>("enterprise")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mitreStats, setMitreStats] = useState<DomainStats | null>(null)
  const [reportTechniqueStats, setReportTechniqueStats] = useState<ReportTechniqueStats | null>(null)

  const loadDashboard = async () => {
    setLoading(true)
    setError(null)

    try {
      const [bundleResponse, reportStats] = await Promise.all([
        fetch(DOMAIN_FILES[activeDomain], { cache: "no-store" }),
        computeReportTechniqueStats(),
      ])

      if (!bundleResponse.ok) {
        throw new Error("Failed to load MITRE dataset")
      }

      const bundle: MitreBundle = await bundleResponse.json()
      const stats = computeMitreStats(bundle)

      setMitreStats(stats)
      setReportTechniqueStats(reportStats)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load MITRE dashboard")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadDashboard()
  }, [activeDomain])

  const statusChartData = useMemo(() => {
    if (!mitreStats) return []

    return [
      { name: "Active", value: mitreStats.activeTechniques },
      { name: "Deprecated", value: mitreStats.deprecatedTechniques },
      { name: "Revoked", value: mitreStats.revokedTechniques },
    ]
  }, [mitreStats])

  const detectedTechniquesChartData = useMemo(() => {
    if (!reportTechniqueStats) return []
    if (!mitreStats) return []

    return reportTechniqueStats.topDetectedTechniques.map((item) => ({
      name: mitreStats.techniqueNameByExternalId[item.id] || item.id,
      value: item.value,
    }))
  }, [reportTechniqueStats, mitreStats])

  return (
    <div className="relative min-h-full bg-[#131313]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-primary/6 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-sky-500/4 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl p-6">
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-card/50 p-6 shadow-2xl shadow-black/10 backdrop-blur-sm">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Command Surface
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white sm:text-4xl">MITRE ATT&CK Dashboard</h1>
                  <p className="mt-2 max-w-xl text-sm text-white/65">
                    Operational ATT&CK coverage, domain comparison, and report detections in one aligned view.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 xl:items-end">
                <div className="flex flex-wrap items-center gap-2">
                  <DashboardSwitcher currentPath="/dashboard/mitre" />
                  <Select value={activeDomain} onValueChange={(value) => setActiveDomain(value as DomainKey)}>
                    <SelectTrigger className="h-10 min-w-[210px] rounded-xl border-border bg-card px-3 text-foreground hover:border-emerald-500/40 focus-visible:border-emerald-500/40 focus-visible:ring-emerald-500/20">
                      <SelectValue placeholder="Select domain" />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-card text-foreground">
                      {DOMAIN_OPTIONS.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="focus:bg-emerald-500/20 focus:text-foreground data-[state=checked]:bg-emerald-500/20 data-[state=checked]:text-foreground"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <button
                  onClick={() => void loadDashboard()}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-white/[0.03] px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:border-white/15 hover:bg-white/[0.05] hover:text-white"
                  title="Refresh"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {loading && (
            <div className="flex h-48 items-center justify-center rounded-2xl border border-border bg-card/50 backdrop-blur-sm">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400" />
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {!loading && !error && mitreStats && reportTechniqueStats && (
            <>
              <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                <StatCard label="Tactics" value={mitreStats.tactics} icon={<Layers className="h-4 w-4 text-white/80" />} />
                <StatCard label="Techniques" value={mitreStats.techniques} icon={<Target className="h-4 w-4 text-white/80" />} />
                <StatCard label="APT Groups" value={mitreStats.groups} icon={<Users className="h-4 w-4 text-white/80" />} />
                <StatCard label="Tools + Malware" value={mitreStats.tools + mitreStats.malware} icon={<Shield className="h-4 w-4 text-white/80" />} />
                <StatCard label="Active Techniques" value={mitreStats.activeTechniques} icon={<CheckCircle className="h-4 w-4 text-white/80" />} />
                <StatCard label="Deprecated" value={mitreStats.deprecatedTechniques} icon={<AlertTriangle className="h-4 w-4 text-white/80" />} />
                <StatCard label="Revoked" value={mitreStats.revokedTechniques} icon={<XCircle className="h-4 w-4 text-white/80" />} />
                <StatCard label="Detected in Reports" value={reportTechniqueStats.uniqueTechniques} icon={<Radar className="h-4 w-4 text-white/80" />} />
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-stretch">
                <div className="space-y-6 xl:col-span-8">
                  <div className="rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-white/65 mb-1">Status</p>
                        <h3 className="text-lg font-bold text-white">Technique Status</h3>
                      </div>
                      <span className="text-xs text-white/65 uppercase tracking-wider">{activeDomain}</span>
                    </div>
                    <div className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)] md:items-center">
                      <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={statusChartData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={56}
                              outerRadius={82}
                              stroke="none"
                            >
                              {statusChartData.map((entry, index) => (
                                <Cell key={entry.name} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
                        {[
                          { label: "Active", value: mitreStats.activeTechniques, color: CHART_COLORS.emerald },
                          { label: "Deprecated", value: mitreStats.deprecatedTechniques, color: CHART_COLORS.amber },
                          { label: "Revoked", value: mitreStats.revokedTechniques, color: CHART_COLORS.red },
                        ].map((item) => (
                          <div key={item.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                            <div className="mb-2 flex items-center justify-between gap-2">
                              <span className="text-xs uppercase tracking-wider text-white/65">{item.label}</span>
                              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                            </div>
                            <p className="text-2xl font-bold text-white">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-white/65 mb-1">Coverage</p>
                        <h3 className="text-lg font-bold text-white">Top APT Groups by Technique Usage</h3>
                      </div>
                      <button
                        onClick={() => router.push("/dashboard/frameworks/mitre-attack/apt")}
                        className="text-xs font-medium text-emerald-400 transition-colors hover:text-emerald-300"
                      >
                        View APT catalog
                      </button>
                    </div>
                    <div className="h-[34rem]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={mitreStats.topGroups} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
                          <XAxis dataKey="name" hide />
                          <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} width={36} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="value" name="Techniques" fill={CHART_COLORS.emerald} radius={[0, 10, 10, 0]} barSize={18} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                        <div className="mb-2 flex items-center gap-2 text-sm text-white/80">
                          <Users className="h-4 w-4 text-white/80" />
                          Groups
                        </div>
                        <p className="text-2xl font-semibold text-white">{mitreStats.groups}</p>
                      </div>
                      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                        <div className="mb-2 flex items-center gap-2 text-sm text-white/80">
                          <Bug className="h-4 w-4 text-white/80" />
                          Malware
                        </div>
                        <p className="text-2xl font-semibold text-white">{mitreStats.malware}</p>
                      </div>
                      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                        <div className="mb-2 flex items-center gap-2 text-sm text-white/80">
                          <Wrench className="h-4 w-4 text-white/80" />
                          Tools
                        </div>
                        <p className="text-2xl font-semibold text-white">{mitreStats.tools}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 xl:col-span-4">
                  <div className="rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-white/65 mb-1">Behavior</p>
                        <h3 className="text-lg font-bold text-white">Top Tactics by Technique Count</h3>
                      </div>
                      <button
                        onClick={() => router.push("/dashboard/frameworks/mitre-attack")}
                        className="text-xs font-medium text-emerald-400 transition-colors hover:text-emerald-300"
                      >
                        Open matrix
                      </button>
                    </div>
                    <div className="h-[32rem]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={mitreStats.topTactics} layout="vertical" margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                          <XAxis type="number" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                          <YAxis type="category" dataKey="name" width={120} stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="value" name="Techniques" fill={CHART_COLORS.sky} radius={[0, 10, 10, 0]} barSize={16} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-white/65 mb-1">Report Intelligence</p>
                        <h3 className="text-lg font-bold text-white">Techniques Detected in Reports</h3>
                      </div>
                      <span className="text-xs text-white/65 uppercase tracking-wider">from CAPE parsed signatures</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                        <p className="text-xs text-white/65">Reports Analyzed</p>
                        <p className="text-lg font-semibold text-white">{reportTechniqueStats.reportsAnalyzed}</p>
                      </div>
                      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                        <p className="text-xs text-white/65">Reports with MITRE IDs</p>
                        <p className="text-lg font-semibold text-white">{reportTechniqueStats.reportsWithTechniques}</p>
                      </div>
                      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                        <p className="text-xs text-white/65">Unique Techniques</p>
                        <p className="text-lg font-semibold text-white">{reportTechniqueStats.uniqueTechniques}</p>
                      </div>
                      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                        <p className="text-xs text-white/65">Total Detections</p>
                        <p className="text-lg font-semibold text-white">{reportTechniqueStats.totalDetections}</p>
                      </div>
                    </div>

                    <div className="mt-6 h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={detectedTechniquesChartData} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                          <XAxis dataKey="name" hide />
                          <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} width={32} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="value" name="Report Hits" fill={CHART_COLORS.violet} radius={[8, 8, 0, 0]} barSize={16} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card/50 p-4 text-xs text-white/65 backdrop-blur-sm">
                <div className="flex items-start gap-2">
                  <Activity className="mt-0.5 h-4 w-4 text-emerald-400" />
                  <p>
                    Report-level MITRE detection is derived from parsed signatures TTPs in completed analyses. This dashboard is currently processing up to 40 recent completed reports for responsive loading.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
