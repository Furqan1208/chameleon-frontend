"use client"

import { Sora, Inter, JetBrains_Mono } from "next/font/google"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Building2, Save, Shield, Target, UserCircle2 } from "lucide-react"
import { apiService } from "@/services/api/api.service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters" }
  }
  if (!/\d/.test(password)) {
    return { valid: false, error: "Password must contain at least one number" }
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, error: "Password must contain at least one symbol (!@#$%^&* etc)" }
  }
  return { valid: true }
}

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
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [passwordSaving, setPasswordSaving] = useState(false)

  // Determine if user has a password (for Google OAuth users)
  // Use boolean coercion to avoid `undefined !== null` evaluating true.
  const userHasPassword = Boolean(user?.has_password) || Boolean(user?.hashed_password)

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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(null)

    const validation = validatePassword(newPassword)
    if (!validation.valid) {
      setPasswordError(validation.error || "Invalid password")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }

    setPasswordSaving(true)
    try {
      if (userHasPassword) {
        // User has password, so change it
        if (!currentPassword) {
          setPasswordError("Please fill in all password fields")
          setPasswordSaving(false)
          return
        }
        await apiService.changePassword(currentPassword, newPassword)
      } else {
        // User has no password (Google OAuth), so set it
        await apiService.setPassword(newPassword)
      }
      setPasswordSuccess("Password updated successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      setPasswordError(err?.message || "Failed to update password")
    } finally {
      setPasswordSaving(false)
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
            className="mb-4 inline-flex h-10 items-center gap-2 rounded-lg border border-[#22262d] bg-[#101214] px-3 text-sm text-slate-100 transition-colors hover:border-[#2a2f38]"
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
                <Select value={role || "__none__"} onValueChange={(value) => setRole(value === "__none__" ? "" : value)}>
                  <SelectTrigger className="h-11 w-full rounded-lg border-[#22262d] bg-[#101214] px-3 font-[var(--font-inter)] text-sm text-slate-100 hover:border-[#2a2f38] focus-visible:ring-primary/20 focus-visible:border-primary/40">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="border-[#22262d] bg-[#101214] text-slate-100">
                    <SelectItem value="__none__" className="focus:bg-[#173226] focus:text-emerald-100 data-[state=checked]:bg-[#173226] data-[state=checked]:text-emerald-100">Select role</SelectItem>
                    {roleOptions.map((option) => (
                      <SelectItem key={option} value={option} className="focus:bg-[#173226] focus:text-emerald-100 data-[state=checked]:bg-[#173226] data-[state=checked]:text-emerald-100">{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="font-[var(--font-jetbrains-mono)] text-xs uppercase tracking-[0.15em] text-muted-foreground">Organization</label>
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Organization / Company"
                    className="h-11 w-full rounded-lg border border-[#22262d] bg-[#101214] pl-10 pr-3 font-[var(--font-inter)] text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="font-[var(--font-jetbrains-mono)] text-xs uppercase tracking-[0.15em] text-muted-foreground">Experience Level</label>
                  <Select value={experienceLevel || "__none__"} onValueChange={(value) => setExperienceLevel(value === "__none__" ? "" : value)}>
                    <SelectTrigger className="h-11 w-full rounded-lg border-[#22262d] bg-[#101214] px-3 font-[var(--font-inter)] text-sm text-slate-100 hover:border-[#2a2f38] focus-visible:ring-primary/20 focus-visible:border-primary/40">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent className="border-[#22262d] bg-[#101214] text-slate-100">
                      <SelectItem value="__none__" className="focus:bg-[#173226] focus:text-emerald-100 data-[state=checked]:bg-[#173226] data-[state=checked]:text-emerald-100">Select level</SelectItem>
                      {experienceOptions.map((option) => (
                        <SelectItem key={option} value={option} className="focus:bg-[#173226] focus:text-emerald-100 data-[state=checked]:bg-[#173226] data-[state=checked]:text-emerald-100">{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="font-[var(--font-jetbrains-mono)] text-xs uppercase tracking-[0.15em] text-muted-foreground">Security Focus</label>
                  <Select value={primaryFocus || "__none__"} onValueChange={(value) => setPrimaryFocus(value === "__none__" ? "" : value)}>
                    <SelectTrigger className="h-11 w-full rounded-lg border-[#22262d] bg-[#101214] px-3 font-[var(--font-inter)] text-sm text-slate-100 hover:border-[#2a2f38] focus-visible:ring-primary/20 focus-visible:border-primary/40">
                      <SelectValue placeholder="Select focus" />
                    </SelectTrigger>
                    <SelectContent className="border-[#22262d] bg-[#101214] text-slate-100">
                      <SelectItem value="__none__" className="focus:bg-[#173226] focus:text-emerald-100 data-[state=checked]:bg-[#173226] data-[state=checked]:text-emerald-100">Select focus</SelectItem>
                      {focusOptions.map((option) => (
                        <SelectItem key={option} value={option} className="focus:bg-[#173226] focus:text-emerald-100 data-[state=checked]:bg-[#173226] data-[state=checked]:text-emerald-100">{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg border border-[#1f3d2f] bg-[#173226] px-4 font-[var(--font-inter)] text-sm font-medium text-emerald-100 transition-colors hover:bg-[#1e4333] disabled:cursor-not-allowed disabled:opacity-70"
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
              <h3 className="font-[var(--font-sora)] text-xl font-semibold">
                {userHasPassword ? "Change Password" : "Set Password"}
              </h3>
              <p className="mt-1 font-[var(--font-inter)] text-sm text-muted-foreground">
                {userHasPassword 
                  ? "Update your password with a new one. Minimum 8 characters, at least 1 number, and 1 symbol."
                  : "Your account was created via Google Sign-In. Set a password to enable traditional login."}
              </p>

              <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
                {userHasPassword && (
                  <div className="space-y-2">
                    <label className="font-[var(--font-jetbrains-mono)] text-xs uppercase tracking-[0.15em] text-muted-foreground">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="h-11 w-full rounded-lg border border-border bg-background px-3 font-[var(--font-inter)] text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                      placeholder="Enter current password"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="font-[var(--font-jetbrains-mono)] text-xs uppercase tracking-[0.15em] text-muted-foreground">
                    {userHasPassword ? "New Password" : "Password"}
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-11 w-full rounded-lg border border-border bg-background px-3 font-[var(--font-inter)] text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                    placeholder="e.g., MyPass123!"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-[var(--font-jetbrains-mono)] text-xs uppercase tracking-[0.15em] text-muted-foreground">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-11 w-full rounded-lg border border-border bg-background px-3 font-[var(--font-inter)] text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                    placeholder="Confirm new password"
                  />
                </div>

                {passwordError && (
                  <div className="rounded-lg border border-red-500/35 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                    {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                    {passwordSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#1f3d2f] bg-[#173226] px-4 font-[var(--font-inter)] text-sm font-medium text-emerald-100 transition-colors hover:bg-[#1e4333] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {passwordSaving ? "Updating..." : userHasPassword ? "Update Password" : "Set Password"}
                </button>
              </form>
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
