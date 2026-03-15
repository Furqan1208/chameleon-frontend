"use client"

import { Sora, Inter, JetBrains_Mono } from "next/font/google"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Building2, Save, Shield, Target, UserCircle2 } from "lucide-react"
import { apiService } from "@/services/api/api.service"

const sora = Sora({ subsets: ["latin"], variable: "--font-sora" })
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" })

type UserProfile = {
  name?: string
  email?: string
  profile_picture?: string
  role?: string
  company?: string
  experience_level?: string
  primary_focus?: string
  onboarding_completed?: boolean
  threat_intel_queries_total?: number
  threat_intel_queries_today?: number
}

const roleOptions = [
  "SOC Analyst",
  "Malware Researcher",
  "Threat Hunter",
  "Incident Responder",
  "Security Engineer",
  "Student / Learner",
]

const experienceOptions = ["Beginner", "Intermediate", "Advanced", "Expert"]

const focusOptions = [
  "Malware Analysis",
  "Threat Hunting",
  "Reverse Engineering",
  "Cloud Security",
  "Red Team",
  "Blue Team",
  "Digital Forensics",
]

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [reports, setReports] = useState<any[]>([])

  const [role, setRole] = useState("")
  const [company, setCompany] = useState("")
  const [experienceLevel, setExperienceLevel] = useState("")
  const [primaryFocus, setPrimaryFocus] = useState("")

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [me, reportList] = await Promise.all([
          apiService.getMe(),
          apiService.getAllReports(),
        ])

        setUser(me)
        setReports(Array.isArray(reportList) ? reportList : [])

        setRole(me?.role ?? "")
        setCompany(me?.company ?? "")
        setExperienceLevel(me?.experience_level ?? "")
        setPrimaryFocus(me?.primary_focus ?? "")

        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(me))
        }
      } catch {
        router.replace("/login")
      } finally {
        setLoading(false)
      }
    }

    bootstrap()
  }, [router])

  const recentAnalysis = useMemo(() => {
    if (!reports.length) return "No analyses yet"
    const latest = reports[0]
    return latest?.filename || latest?.analysis_id || "Recent analysis available"
  }, [reports])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const updated = await apiService.updateProfile({
        role: role || undefined,
        company: company || undefined,
        experience_level: experienceLevel || undefined,
        primary_focus: primaryFocus || undefined,
      })
      setUser(updated)
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(updated))
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className={`${sora.variable} ${inter.variable} ${jetbrainsMono.variable} flex min-h-screen items-center justify-center bg-background text-foreground`}>
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      </div>
    )
  }

  return (
    <div className={`${sora.variable} ${inter.variable} ${jetbrainsMono.variable} relative min-h-screen overflow-hidden bg-background text-foreground`}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,255,136,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.1) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
          }}
          animate={{ backgroundPosition: ["0px 0px", "52px 52px", "0px 0px"] }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute -left-24 top-12 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -right-24 bottom-8 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </button>

          <div className="rounded-2xl border border-border/80 bg-black/60 p-6 backdrop-blur-xl">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                {user?.profile_picture ? (
                  <img src={user.profile_picture} alt={user.name || "Profile"} className="h-16 w-16 rounded-xl border border-primary/35 object-cover" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-primary/35 bg-primary/10">
                    <UserCircle2 className="h-10 w-10 text-primary" />
                  </div>
                )}
                <div>
                  <h1 className="font-[var(--font-sora)] text-3xl font-semibold">{user?.name || "Analyst"}</h1>
                  <p className="font-[var(--font-inter)] text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              <span className="inline-flex w-fit items-center rounded-full border border-primary/40 bg-primary/15 px-3 py-1 font-[var(--font-jetbrains-mono)] text-xs uppercase tracking-[0.18em] text-primary">
                {role || "Unassigned Role"}
              </span>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <motion.form
            onSubmit={handleSave}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="rounded-2xl border border-border/80 bg-black/60 p-6 backdrop-blur-xl"
          >
            <h2 className="font-[var(--font-sora)] text-2xl font-semibold">Professional Profile</h2>
            <p className="mt-1 font-[var(--font-inter)] text-sm text-muted-foreground">Update your analyst identity and operating focus.</p>

            <div className="mt-6 grid gap-4">
              <div className="space-y-2">
                <label className="font-[var(--font-jetbrains-mono)] text-xs uppercase tracking-[0.15em] text-muted-foreground">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="h-11 w-full rounded-lg border border-border bg-card/40 px-3 font-[var(--font-inter)] text-sm outline-none transition focus:border-primary/50"
                >
                  <option value="">Select role</option>
                  {roleOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="font-[var(--font-jetbrains-mono)] text-xs uppercase tracking-[0.15em] text-muted-foreground">Organization</label>
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Organization / Company"
                    className="h-11 w-full rounded-lg border border-border bg-card/40 pl-10 pr-3 font-[var(--font-inter)] text-sm outline-none transition focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="font-[var(--font-jetbrains-mono)] text-xs uppercase tracking-[0.15em] text-muted-foreground">Experience Level</label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="h-11 w-full rounded-lg border border-border bg-card/40 px-3 font-[var(--font-inter)] text-sm outline-none transition focus:border-primary/50"
                  >
                    <option value="">Select level</option>
                    {experienceOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="font-[var(--font-jetbrains-mono)] text-xs uppercase tracking-[0.15em] text-muted-foreground">Security Focus</label>
                  <select
                    value={primaryFocus}
                    onChange={(e) => setPrimaryFocus(e.target.value)}
                    className="h-11 w-full rounded-lg border border-border bg-card/40 px-3 font-[var(--font-inter)] text-sm outline-none transition focus:border-primary/50"
                  >
                    <option value="">Select focus</option>
                    {focusOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-cyan-500 px-4 py-2.5 font-[var(--font-inter)] text-sm font-medium text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="space-y-6"
          >
            <div className="rounded-2xl border border-border/80 bg-black/60 p-6 backdrop-blur-xl">
              <h3 className="font-[var(--font-sora)] text-xl font-semibold">Analysis Activity</h3>
              <div className="mt-5 space-y-4">
                <div className="rounded-lg border border-primary/25 bg-primary/10 p-4">
                  <p className="font-[var(--font-jetbrains-mono)] text-[11px] uppercase tracking-[0.18em] text-primary">Reports Generated</p>
                  <p className="mt-1 font-[var(--font-sora)] text-3xl font-semibold">{reports.length}</p>
                </div>
                <div className="rounded-lg border border-border bg-card/30 p-4">
                  <p className="font-[var(--font-jetbrains-mono)] text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Recent Analysis</p>
                  <p className="mt-1 line-clamp-2 font-[var(--font-inter)] text-sm">{recentAnalysis}</p>
                </div>
                <div className="rounded-lg border border-border bg-card/30 p-4">
                  <p className="font-[var(--font-jetbrains-mono)] text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Threat Intel Queries</p>
                  <p className="mt-1 font-[var(--font-sora)] text-2xl font-semibold">{user?.threat_intel_queries_total ?? 0}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Today: {user?.threat_intel_queries_today ?? 0}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/80 bg-black/60 p-6 backdrop-blur-xl">
              <h3 className="font-[var(--font-sora)] text-xl font-semibold">Identity Signals</h3>
              <div className="mt-4 space-y-3 font-[var(--font-inter)] text-sm text-muted-foreground">
                <p className="inline-flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Role-based workflow adaptation enabled</p>
                <p className="inline-flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Focus-specific recommendations active</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
