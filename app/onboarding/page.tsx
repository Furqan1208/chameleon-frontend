"use client"

import { Sora, Inter, JetBrains_Mono } from "next/font/google"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AlertTriangle, ArrowRight, Building2, Radar, ShieldCheck } from "lucide-react"
import { apiService } from "@/services/api/api.service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const sora = Sora({ subsets: ["latin"], variable: "--font-sora" })
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" })

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

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [role, setRole] = useState("")
  const [company, setCompany] = useState("")
  const [experienceLevel, setExperienceLevel] = useState("")
  const [primaryFocus, setPrimaryFocus] = useState("")

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const me = await apiService.getMe()

        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(me))
        }

        if (me?.onboarding_completed) {
          router.replace("/dashboard")
          return
        }

        setRole(me?.role ?? "")
        setCompany(me?.company ?? "")
        setExperienceLevel(me?.experience_level ?? "")
        setPrimaryFocus(me?.primary_focus ?? "")
      } catch {
        router.replace("/login")
      } finally {
        setLoading(false)
      }
    }

    bootstrap()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!role) {
      setError("Role is required to complete onboarding.")
      return
    }

    setSaving(true)
    setError(null)

    try {
      const updated = await apiService.updateProfile({
        role,
        company: company || undefined,
        experience_level: experienceLevel || undefined,
        primary_focus: primaryFocus || undefined,
        onboarding_completed: true,
      })

      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(updated))
      }

      router.push("/dashboard")
    } catch (err: any) {
      setError(err?.message || "Failed to save profile. Please try again.")
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
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,255,136,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.1) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
          }}
          animate={{ backgroundPosition: ["0px 0px", "52px 52px", "0px 0px"] }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute -left-32 top-12 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full rounded-2xl border border-border/80 bg-black/60 p-6 backdrop-blur-xl sm:p-8"
        >
          <div className="mb-7">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-3 py-1">
              <Radar className="h-3.5 w-3.5 text-primary" />
              <span className="font-[var(--font-jetbrains-mono)] text-[11px] uppercase tracking-[0.2em] text-primary">Analyst Setup</span>
            </div>
            <h1 className="font-[var(--font-sora)] text-3xl font-semibold">Configure Your Analyst Profile</h1>
            <p className="mt-2 font-[var(--font-inter)] text-sm text-muted-foreground">
              Help Chameleon tailor threat intelligence and analysis workflows to your role.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="font-[var(--font-jetbrains-mono)] text-xs uppercase tracking-[0.15em] text-muted-foreground">
                Role *
              </label>
              <Select value={role || "__none__"} onValueChange={(value) => setRole(value === "__none__" ? "" : value)}>
                <SelectTrigger className="h-11 w-full rounded-lg border-[#22262d] bg-[#101214] px-3 font-[var(--font-inter)] text-sm text-slate-100 hover:border-[#2a2f38] focus-visible:border-primary/40 focus-visible:ring-primary/20">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="border-[#22262d] bg-[#101214] text-slate-100">
                  <SelectItem value="__none__" className="focus:bg-[#173226] focus:text-emerald-100 data-[state=checked]:bg-[#173226] data-[state=checked]:text-emerald-100">
                    Select role
                  </SelectItem>
                  {roleOptions.map((option) => (
                    <SelectItem key={option} value={option} className="focus:bg-[#173226] focus:text-emerald-100 data-[state=checked]:bg-[#173226] data-[state=checked]:text-emerald-100">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="font-[var(--font-jetbrains-mono)] text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  Organization / Company
                </label>
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Optional"
                    className="h-11 w-full rounded-lg border border-border bg-card/40 pl-10 pr-3 font-[var(--font-inter)] text-sm outline-none transition focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-[var(--font-jetbrains-mono)] text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  Experience Level
                </label>
                <Select value={experienceLevel || "__none__"} onValueChange={(value) => setExperienceLevel(value === "__none__" ? "" : value)}>
                  <SelectTrigger className="h-11 w-full rounded-lg border-[#22262d] bg-[#101214] px-3 font-[var(--font-inter)] text-sm text-slate-100 hover:border-[#2a2f38] focus-visible:border-primary/40 focus-visible:ring-primary/20">
                    <SelectValue placeholder="Select level (optional)" />
                  </SelectTrigger>
                  <SelectContent className="border-[#22262d] bg-[#101214] text-slate-100">
                    <SelectItem value="__none__" className="focus:bg-[#173226] focus:text-emerald-100 data-[state=checked]:bg-[#173226] data-[state=checked]:text-emerald-100">
                      Select level (optional)
                    </SelectItem>
                    {experienceOptions.map((option) => (
                      <SelectItem key={option} value={option} className="focus:bg-[#173226] focus:text-emerald-100 data-[state=checked]:bg-[#173226] data-[state=checked]:text-emerald-100">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-[var(--font-jetbrains-mono)] text-xs uppercase tracking-[0.15em] text-muted-foreground">
                Primary Security Focus
              </label>
              <Select value={primaryFocus || "__none__"} onValueChange={(value) => setPrimaryFocus(value === "__none__" ? "" : value)}>
                <SelectTrigger className="h-11 w-full rounded-lg border-[#22262d] bg-[#101214] px-3 font-[var(--font-inter)] text-sm text-slate-100 hover:border-[#2a2f38] focus-visible:border-primary/40 focus-visible:ring-primary/20">
                  <SelectValue placeholder="Select focus (optional)" />
                </SelectTrigger>
                <SelectContent className="border-[#22262d] bg-[#101214] text-slate-100">
                  <SelectItem value="__none__" className="focus:bg-[#173226] focus:text-emerald-100 data-[state=checked]:bg-[#173226] data-[state=checked]:text-emerald-100">
                    Select focus (optional)
                  </SelectItem>
                  {focusOptions.map((option) => (
                    <SelectItem key={option} value={option} className="focus:bg-[#173226] focus:text-emerald-100 data-[state=checked]:bg-[#173226] data-[state=checked]:text-emerald-100">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-500/35 bg-red-500/10 p-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                <p className="font-[var(--font-inter)] text-sm text-red-300">{error}</p>
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="inline-flex items-center gap-2 font-[var(--font-inter)] text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" />
                You can update these details anytime from your profile page.
              </p>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-cyan-500 px-4 py-2.5 font-[var(--font-inter)] text-sm font-medium text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? "Saving Profile..." : "Complete Setup"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
