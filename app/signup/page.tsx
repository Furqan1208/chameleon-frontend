"use client"

import { Sora, Inter, JetBrains_Mono } from "next/font/google"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AlertTriangle, ArrowLeft, CheckCircle, Lock, ShieldCheck, Sparkles, Zap } from "lucide-react"
import { apiService } from "@/services/api/api.service"

const sora = Sora({ subsets: ["latin"], variable: "--font-sora" })
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" })

const securitySignals = [
  "End-to-end encrypted analysis",
  "Real-time threat intelligence fusion",
  "Secure sandbox execution perimeter",
  "AI-assisted detection confidence scoring",
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

export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    const restoreSession = async () => {
      if (!apiService.isAuthenticated()) return

      try {
        const me = await apiService.getMe()
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(me))
        }
        router.replace(me?.onboarding_completed ? "/dashboard" : "/onboarding")
      } catch {
        // BaseApi already handles expired sessions.
      }
    }

    restoreSession()
  }, [router])

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Name is required")
      return false
    }
    if (!formData.email.trim()) {
      setError("Email is required")
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Invalid email format")
      return false
    }
    if (!formData.username.trim()) {
      setError("Username is required")
      return false
    }
    if (formData.username.length < 3) {
      setError("Username must be at least 3 characters")
      return false
    }
    if (!formData.password) {
      setError("Password is required")
      return false
    }
    const passwordValidation = validatePassword(formData.password)
    if (!passwordValidation.valid) {
      setError(passwordValidation.error || "Invalid password")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }
    return true
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) return

    setIsLoading(true)

    try {
      await apiService.register(
        formData.name,
        formData.email,
        formData.username,
        formData.password
      )

      setSuccess(true)

      const me = await apiService.getMe()

      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(me))
      }

      setTimeout(() => {
        if (me?.onboarding_completed) {
          router.push("/dashboard")
        } else {
          router.push("/onboarding")
        }
      }, 1500)
    } catch (authError: any) {
      setError(authError?.message || "Registration failed. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className={`${sora.variable} ${inter.variable} ${jetbrainsMono.variable} relative min-h-screen overflow-hidden bg-background text-foreground`}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,255,136,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.1) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
          }}
          animate={{ backgroundPosition: ["0px 0px", "52px 52px", "0px 0px"] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        />

        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-secondary/12 blur-3xl" />

        <motion.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
          animate={{ top: ["15%", "85%", "15%"] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-7xl items-center gap-8 px-6 py-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden rounded-2xl border border-border/80 bg-black/60 p-8 lg:flex lg:min-h-[40rem] lg:flex-col lg:justify-center lg:gap-10">
          <div>
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </button>

            <p className="mt-10 max-w-xl font-[var(--font-inter)] text-base text-muted-foreground">
              Create your Chameleon analyst account to investigate malware behavior, correlate threat intelligence, and execute research workflows with ease.
            </p>
          </div>

          <div className="space-y-3">
            {securitySignals.map((signal, idx) => (
              <motion.div
                key={signal}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08, duration: 0.35 }}
                className="flex items-center gap-3 rounded-lg border border-border bg-card/50 px-4 py-3"
              >
                <ShieldCheck className="h-4 w-4 text-primary" />
                <p className="font-[var(--font-inter)] text-sm text-muted-foreground">{signal}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="flex h-full items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="flex w-full max-w-md flex-col justify-center rounded-2xl border border-border/90 bg-black/70 p-7 sm:p-9 lg:min-h-[40rem]"
          >
            <div className="mb-8 text-center">
              <div className="mb-4 flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="font-[var(--font-jetbrains-mono)] text-xs uppercase tracking-[0.2em] text-primary">Registration</p>
              </div>
              <h2 className="font-[var(--font-sora)] text-3xl font-semibold">Create Account</h2>
              <p className="mt-2 font-[var(--font-inter)] text-sm text-muted-foreground">Join the Chameleon analyst platform.</p>
            </div>

            {success ? (
              <div className="space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="flex justify-center"
                >
                  <CheckCircle className="h-16 w-16 text-primary" />
                </motion.div>
                <div className="text-center">
                  <p className="font-[var(--font-sora)] text-lg font-semibold text-primary">Welcome to Chameleon!</p>
                  <p className="mt-2 font-[var(--font-inter)] text-sm text-muted-foreground">
                    Your account has been created successfully. Redirecting...
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSignup} className="space-y-3">
                <div>
                  <label className="block font-[var(--font-inter)] text-xs text-muted-foreground mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-border bg-black/50 px-3 py-2 font-[var(--font-inter)] text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none disabled:opacity-50"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="block font-[var(--font-inter)] text-xs text-muted-foreground mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-border bg-black/50 px-3 py-2 font-[var(--font-inter)] text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none disabled:opacity-50"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block font-[var(--font-inter)] text-xs text-muted-foreground mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-border bg-black/50 px-3 py-2 font-[var(--font-inter)] text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none disabled:opacity-50"
                    placeholder="Choose a username (3+ chars)"
                  />
                </div>

                <div>
                  <label className="block font-[var(--font-inter)] text-xs text-muted-foreground mb-2">
                    Password
                  </label>
                  <p className="mb-2 font-[var(--font-inter)] text-xs text-muted-foreground">
                    Minimum 8 characters • At least 1 number • At least 1 symbol
                  </p>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-border bg-black/50 px-3 py-2 font-[var(--font-inter)] text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none disabled:opacity-50"
                    placeholder="e.g., MyPass123!"
                  />
                </div>

                <div>
                  <label className="block font-[var(--font-inter)] text-xs text-muted-foreground mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-border bg-black/50 px-3 py-2 font-[var(--font-inter)] text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none disabled:opacity-50"
                    placeholder="Confirm your password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-4 w-full rounded-lg bg-primary px-4 py-2 font-[var(--font-inter)] text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/35 border-t-black" />
                      Creating account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </button>

                {error && (
                  <div className="flex items-start gap-2 rounded-lg border border-red-500/35 bg-red-500/10 p-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                    <p className="font-[var(--font-inter)] text-sm text-red-300">{error}</p>
                  </div>
                )}
              </form>
            )}

            <div className="mt-5 rounded-xl border border-primary/25 bg-primary/8 p-4">
              <div className="flex items-start gap-3">
                <Lock className="mt-0.5 h-4 w-4 text-primary" />
                <p className="font-[var(--font-inter)] text-xs text-muted-foreground">
                  Your password is hashed with bcrypt and never stored in plaintext. Your data is encrypted and secured.
                </p>
              </div>
            </div>

            <p className="mt-6 text-center font-[var(--font-inter)] text-xs text-muted-foreground">
              Already have an account?{" "}
              <button
                onClick={() => router.push("/login")}
                className="text-primary hover:underline"
              >
                Sign in here
              </button>
            </p>
          </motion.div>
        </section>
      </div>
    </div>
  )
}
