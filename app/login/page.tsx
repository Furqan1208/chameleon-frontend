"use client"

import { Sora, Inter, JetBrains_Mono } from "next/font/google"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AlertTriangle, ArrowLeft, Lock, ShieldCheck, Sparkles, Zap } from "lucide-react"
import { apiService } from "@/services/api/api.service"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

const sora = Sora({ subsets: ["latin"], variable: "--font-sora" })
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" })

const securitySignals = [
  "End-to-end encrypted analysis",
  "Real-time threat intelligence fusion",
  "Secure sandbox execution perimeter",
  "AI-assisted detection confidence scoring",
]

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [googleReady, setGoogleReady] = useState(false)
  const [authMode, setAuthMode] = useState<"google" | "credentials">("google")
  const [formData, setFormData] = useState({ username: "", password: "" })
  const [pendingMfaToken, setPendingMfaToken] = useState<string | null>(null)
  const [mfaCode, setMfaCode] = useState("")
  const [pendingMfaUserLabel, setPendingMfaUserLabel] = useState<string | null>(null)
  const googleBtnRef = useRef<HTMLDivElement>(null)

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

  const handleCredentialResponse = async (response: { credential: string }) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await apiService.googleAuth(response.credential)

      if (result?.mfa_required && result?.mfa_token) {
        setPendingMfaToken(result.mfa_token)
        setPendingMfaUserLabel(result?.user?.email || result?.user?.username || null)
        setMfaCode("")
        setIsLoading(false)
        return
      }

      const me = result?.user || (await apiService.getMe())

      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(me))
      }

      if (me?.onboarding_completed) {
        router.push("/dashboard")
      } else {
        router.push("/onboarding")
      }
    } catch (authError: any) {
      setError(authError?.message || "Authentication failed. Please try again.")
      setIsLoading(false)
    }
  }

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await apiService.login(formData.username, formData.password)

      if (result?.mfa_required && result?.mfa_token) {
        setPendingMfaToken(result.mfa_token)
        setPendingMfaUserLabel(result?.user?.email || result?.user?.username || formData.username)
        setMfaCode("")
        setIsLoading(false)
        return
      }

      const me = result?.user || (await apiService.getMe())

      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(me))
      }

      if (me?.onboarding_completed) {
        router.push("/dashboard")
      } else {
        router.push("/onboarding")
      }
    } catch (authError: any) {
      setError(authError?.message || "Login failed. Please try again.")
      setIsLoading(false)
    }
  }

  const handleMfaVerification = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!pendingMfaToken || mfaCode.length !== 6) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await apiService.verifyMfa(pendingMfaToken, mfaCode)
      const me = result?.user || (await apiService.getMe())

      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(me))
      }

      setPendingMfaToken(null)
      setPendingMfaUserLabel(null)
      setMfaCode("")

      if (me?.onboarding_completed) {
        router.push("/dashboard")
      } else {
        router.push("/onboarding")
      }
    } catch (authError: any) {
      setError(authError?.message || "Invalid authentication code. Please try again.")
      setIsLoading(false)
    }
  }

  const cancelMfaChallenge = () => {
    setPendingMfaToken(null)
    setPendingMfaUserLabel(null)
    setMfaCode("")
    setError(null)
  }

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.onload = () => setGoogleReady(true)
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  useEffect(() => {
    if (!googleReady || !googleBtnRef.current || authMode !== "google") {
      return
    }

    const google = (window as any).google

    if (!google?.accounts?.id) {
      return
    }

    google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      cancel_on_tap_outside: false,
      use_fedcm_for_prompt: false,
    })

    google.accounts.id.renderButton(googleBtnRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "rectangular",
      logo_alignment: "left",
      width: googleBtnRef.current.offsetWidth || 360,
    })
  }, [googleReady, authMode])

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
        <section className="hidden rounded-2xl border border-border/80 bg-black/60 p-8 lg:flex lg:min-h-[34rem] lg:flex-col lg:justify-center lg:gap-10">
          <div>
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </button>

            <p className="mt-10 max-w-xl font-[var(--font-inter)] text-base text-muted-foreground">
              Authenticate into the Chameleon analyst workspace to investigate malware behavior, correlate threat intelligence, and execute research workflows.
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
            className="flex w-full max-w-md flex-col justify-center rounded-2xl border border-border/90 bg-black/70 p-7 sm:p-9 lg:min-h-[34rem]"
          >
            <div className="mb-8 text-center">
              <div className="mb-4 flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="font-[var(--font-jetbrains-mono)] text-xs uppercase tracking-[0.2em] text-primary">Access Control</p>
              </div>
              <h2 className="font-[var(--font-sora)] text-3xl font-semibold">Sign In</h2>
              <p className="mt-2 font-[var(--font-inter)] text-sm text-muted-foreground">Authenticate to launch the analyst command surface.</p>
            </div>

            {/* Auth Mode Selector */}
            <div className="mb-6 flex gap-2 rounded-lg border border-border bg-card/30 p-1">
              <button
                onClick={() => setAuthMode("google")}
                className={`flex-1 rounded px-3 py-2 font-[var(--font-inter)] text-sm transition-colors ${
                  authMode === "google"
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Google
              </button>
              <button
                onClick={() => setAuthMode("credentials")}
                className={`flex-1 rounded px-3 py-2 font-[var(--font-inter)] text-sm transition-colors ${
                  authMode === "credentials"
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Username
              </button>
            </div>

            {pendingMfaToken ? (
              <form onSubmit={handleMfaVerification} className="space-y-5 rounded-xl border border-border bg-card/50 p-4">
                <div className="min-w-0">
                  <p className="font-[var(--font-inter)] text-sm font-medium text-foreground">
                    Enter authentication code
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {pendingMfaUserLabel
                      ? `Use the six-digit code from your authenticator app for ${pendingMfaUserLabel}.`
                      : "Use the six-digit code from your authenticator app."}
                  </p>
                </div>

                <div className="overflow-x-hidden pb-1">
                  <InputOTP value={mfaCode} onChange={setMfaCode} maxLength={6}>
                    <InputOTPGroup className="gap-1.5 sm:gap-2">
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || mfaCode.length !== 6}
                  className="w-full rounded-lg bg-primary px-4 py-2 font-[var(--font-inter)] text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {isLoading ? "Verifying..." : "Verify Code"}
                </button>

                <button
                  type="button"
                  onClick={cancelMfaChallenge}
                  className="w-full rounded-lg border border-border bg-black/30 px-4 py-2 font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Back to sign in
                </button>

                {error && (
                  <div className="flex items-start gap-2 rounded-lg border border-red-500/35 bg-red-500/10 p-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                    <p className="font-[var(--font-inter)] text-sm text-red-300">{error}</p>
                  </div>
                )}
              </form>
            ) : authMode === "google" && (
              <div className="rounded-xl border border-border bg-card/50 p-4">
                {!googleReady && (
                  <div className="flex h-12 items-center justify-center gap-3 rounded-lg border border-border bg-black/50">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/35 border-t-primary" />
                    <p className="font-[var(--font-inter)] text-sm text-muted-foreground">Initializing secure auth...</p>
                  </div>
                )}

                <div
                  ref={googleBtnRef}
                  className={`w-full transition-opacity duration-300 ${googleReady ? "opacity-100" : "h-0 overflow-hidden opacity-0"}`}
                />

                {isLoading && (
                  <div className="mt-4 flex items-center gap-2 font-[var(--font-inter)] text-sm text-muted-foreground">
                    <Zap className="h-4 w-4 animate-pulse text-primary" />
                    Verifying identity and provisioning session...
                  </div>
                )}

                {error && (
                  <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-500/35 bg-red-500/10 p-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                    <p className="font-[var(--font-inter)] text-sm text-red-300">{error}</p>
                  </div>
                )}
              </div>
            )}

            {/* Credentials Auth */}
            {!pendingMfaToken && authMode === "credentials" && (
              <form onSubmit={handleCredentialsLogin} className="space-y-4">
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
                    placeholder="Enter your username"
                  />
                </div>

                <div>
                  <label className="block font-[var(--font-inter)] text-xs text-muted-foreground mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-border bg-black/50 px-3 py-2 font-[var(--font-inter)] text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none disabled:opacity-50"
                    placeholder="Enter your password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !formData.username || !formData.password}
                  className="w-full rounded-lg bg-primary px-4 py-2 font-[var(--font-inter)] text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/35 border-t-black" />
                      Signing in...
                    </span>
                  ) : (
                    "Sign In"
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
                  Passwords are encrypted with bcrypt. Authentication tokens are managed securely and expire after use.
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              {["Auth Encrypted", "Zero Plaintext Storage", "SOC Ready"].map((item) => (
                <div key={item} className="rounded-lg border border-border bg-card/50 p-2 text-center">
                  <div className="mx-auto h-1.5 w-1.5 rounded-full bg-primary" />
                  <p className="mt-2 font-[var(--font-jetbrains-mono)] text-[10px] text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>

            <p className="mt-6 text-center font-[var(--font-inter)] text-xs text-muted-foreground">
              Don't have an account?{" "}
              <button
                onClick={() => router.push("/signup")}
                className="text-primary hover:underline"
              >
                Sign up here
              </button>
            </p>
          </motion.div>
        </section>
      </div>
    </div>
  )
}