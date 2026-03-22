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

const STATUS_COLORS = ["#00ff88", "#f59e0b", "#ef4444"]

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
    <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4">
      <div className="mb-2 text-slate-300">{icon}</div>
      <p className="text-2xl font-semibold text-white">{value.toLocaleString()}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] px-3 py-2 text-xs shadow-xl">
      {label && <p className="mb-1 text-muted-foreground">{label}</p>}
      {payload.map((entry: any, index: number) => (
        <p key={index} style={{ color: entry.color || entry.fill }}>
          {entry.name}: {entry.value}
        </p>
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
    <div className="relative min-h-full bg-[#080808]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-sky-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl p-6">
        <div className="space-y-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">Command Surface</p>
              <h1 className="text-2xl font-semibold text-white">MITRE ATT&CK Dashboard</h1>
              <p className="text-sm text-muted-foreground">Operational ATT&CK coverage and report detections</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <DashboardSwitcher currentPath="/dashboard/mitre" />
              <select
                value={activeDomain}
                onChange={(event) => setActiveDomain(event.target.value as DomainKey)}
                className="rounded-lg border border-[#1a1a1a] bg-[#101214] px-3 py-2 text-sm text-slate-200 outline-none transition-colors hover:border-[#2a2a2a] focus:border-primary/40"
              >
                <option value="enterprise">Enterprise</option>
                <option value="ics">ICS</option>
                <option value="mobile">Mobile</option>
              </select>
              <button
                onClick={() => void loadDashboard()}
                className="rounded-lg border border-[#1a1a1a] p-2 text-slate-300 transition-colors hover:border-[#2a2a2a] hover:text-white"
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {loading && (
            <div className="flex h-48 items-center justify-center rounded-xl border border-[#1a1a1a] bg-[#0d0d0d]">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {!loading && !error && mitreStats && reportTechniqueStats && (
            <>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Tactics" value={mitreStats.tactics} icon={<Layers className="h-4 w-4 text-cyan-300" />} />
                <StatCard label="Techniques" value={mitreStats.techniques} icon={<Target className="h-4 w-4 text-emerald-300" />} />
                <StatCard label="APT Groups" value={mitreStats.groups} icon={<Users className="h-4 w-4 text-violet-300" />} />
                <StatCard label="Tools + Malware" value={mitreStats.tools + mitreStats.malware} icon={<Shield className="h-4 w-4 text-amber-300" />} />
                <StatCard label="Active Techniques" value={mitreStats.activeTechniques} icon={<CheckCircle className="h-4 w-4 text-emerald-300" />} />
                <StatCard label="Deprecated" value={mitreStats.deprecatedTechniques} icon={<AlertTriangle className="h-4 w-4 text-yellow-300" />} />
                <StatCard label="Revoked" value={mitreStats.revokedTechniques} icon={<XCircle className="h-4 w-4 text-rose-300" />} />
                <StatCard label="Detected in Reports" value={reportTechniqueStats.uniqueTechniques} icon={<Radar className="h-4 w-4 text-sky-300" />} />
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">Technique Status</h3>
                    <span className="text-xs text-muted-foreground">{activeDomain}</span>
                  </div>
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
                </div>

                <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5 lg:col-span-2">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">Top APT Groups by Technique Usage</h3>
                    <button
                      onClick={() => router.push("/dashboard/frameworks/mitre-attack/apt")}
                      className="text-xs text-primary hover:underline"
                    >
                      View APT catalog
                    </button>
                  </div>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mitreStats.topGroups}>
                        <XAxis dataKey="name" hide />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" name="Techniques" fill="#00ff88" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">Top Tactics by Technique Count</h3>
                    <button
                      onClick={() => router.push("/dashboard/frameworks/mitre-attack")}
                      className="text-xs text-primary hover:underline"
                    >
                      Open matrix
                    </button>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mitreStats.topTactics} layout="vertical" margin={{ left: 4, right: 4 }}>
                        <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis type="category" dataKey="name" width={120} stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" name="Techniques" fill="#3b82f6" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">Techniques Detected in Reports</h3>
                    <span className="text-xs text-muted-foreground">from CAPE parsed signatures</span>
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-[#1a1a1a] bg-[#101214] p-3">
                      <p className="text-xs text-muted-foreground">Reports Analyzed</p>
                      <p className="text-lg font-semibold text-white">{reportTechniqueStats.reportsAnalyzed}</p>
                    </div>
                    <div className="rounded-lg border border-[#1a1a1a] bg-[#101214] p-3">
                      <p className="text-xs text-muted-foreground">Reports with MITRE IDs</p>
                      <p className="text-lg font-semibold text-white">{reportTechniqueStats.reportsWithTechniques}</p>
                    </div>
                    <div className="rounded-lg border border-[#1a1a1a] bg-[#101214] p-3">
                      <p className="text-xs text-muted-foreground">Unique Techniques</p>
                      <p className="text-lg font-semibold text-white">{reportTechniqueStats.uniqueTechniques}</p>
                    </div>
                    <div className="rounded-lg border border-[#1a1a1a] bg-[#101214] p-3">
                      <p className="text-xs text-muted-foreground">Total Detections</p>
                      <p className="text-lg font-semibold text-white">{reportTechniqueStats.totalDetections}</p>
                    </div>
                  </div>

                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={detectedTechniquesChartData}>
                        <XAxis dataKey="name" hide />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" name="Report Hits" fill="#a855f7" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm text-slate-200">
                    <Users className="h-4 w-4 text-violet-300" />
                    Groups
                  </div>
                  <p className="text-2xl font-semibold text-white">{mitreStats.groups}</p>
                </div>
                <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm text-slate-200">
                    <Bug className="h-4 w-4 text-rose-300" />
                    Malware
                  </div>
                  <p className="text-2xl font-semibold text-white">{mitreStats.malware}</p>
                </div>
                <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm text-slate-200">
                    <Wrench className="h-4 w-4 text-amber-300" />
                    Tools
                  </div>
                  <p className="text-2xl font-semibold text-white">{mitreStats.tools}</p>
                </div>
              </div>

              <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <Activity className="mt-0.5 h-4 w-4 text-primary" />
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
