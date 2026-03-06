"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ShieldCheck, Zap, Lock, AlertTriangle, ChevronRight } from "lucide-react"
import { Logo } from "@/components/ui/Logo"
import { apiService } from "@/services/api/api.service"

const securityFeatures = [
  { icon: ShieldCheck, text: "End-to-end encrypted analysis" },
  { icon: Zap, text: "Real-time threat intelligence" },
  { icon: Lock, text: "Secure sandbox environment" },
  { icon: AlertTriangle, text: "AI-powered threat detection" },
]

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [particles, setParticles] = useState<Array<{ x: number; y: number; size: number }>>([])
  const [scanLine, setScanLine] = useState(0)
  const [googleReady, setGoogleReady] = useState(false)
  const googleBtnRef = useRef<HTMLDivElement>(null)

  // Redirect already-authenticated users straight to dashboard
  useEffect(() => {
    if (apiService.isAuthenticated()) {
      router.replace("/dashboard")
    }
  }, [router])

  // Callback invoked by Google after user picks an account
  const handleCredentialResponse = async (response: { credential: string }) => {
    setIsLoading(true)
    setError(null)
    try {
      await apiService.googleAuth(response.credential)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please try again.")
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Particles
    setParticles(
      Array.from({ length: 40 }).map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
      }))
    )

    // Scan line animation
    const interval = setInterval(() => {
      setScanLine((prev) => (prev + 1) % 100)
    }, 30)

    // Load Google Identity Services script
    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.onload = () => setGoogleReady(true)
    document.head.appendChild(script)

    return () => {
      clearInterval(interval)
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  // Once Google script is loaded AND the button div is mounted, render the button
  useEffect(() => {
    if (!googleReady || !googleBtnRef.current) return

    // @ts-ignore
    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      cancel_on_tap_outside: false,
      use_fedcm_for_prompt: false,
    })

    // @ts-ignore
    window.google.accounts.id.renderButton(googleBtnRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "rectangular",
      logo_alignment: "left",
      width: googleBtnRef.current.offsetWidth || 400,
    })
  }, [googleReady])

  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex">
      {/* ── Animated Background ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 cyber-grid opacity-10" />

        {/* Scan line */}
        <div
          className="absolute left-0 right-0 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent"
          style={{ top: `${scanLine}%`, transition: "top 30ms linear" }}
        />

        {/* Floating particles */}
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
            animate={{ y: [0, -15, 0], x: [0, Math.sin(i) * 8, 0] }}
            transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, ease: "linear" }}
          />
        ))}

        {/* Gradient orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute top-2/3 left-1/2 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* ── Left Panel ── */}
      <div className="relative z-10 hidden lg:flex lg:w-1/2 flex-col justify-between p-16">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors w-fit"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          <span className="text-sm">Back to home</span>
        </button>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-10"
        >
          <div className="space-y-4">
            <Logo type="full" size="xl" className="neon-text" />
            <h2 className="text-5xl font-bold text-foreground leading-tight">
              Threat Intelligence
              <br />
              <span className="text-primary neon-text">Starts Here</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-md">
              Sign in to access the most comprehensive malware analysis platform,
              powered by AI and 10+ threat intelligence APIs.
            </p>
          </div>

          <div className="space-y-4">
            {securityFeatures.map((feature, i) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-muted-foreground">{feature.text}</span>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        <p className="text-xs text-muted-foreground/50">
          © 2025 Chameleon Security Platform. All rights reserved.
        </p>
      </div>

      {/* ── Right Panel — Login Card ── */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="glass-card border border-border rounded-3xl p-10 space-y-8">
            {/* Mobile logo */}
            <div className="lg:hidden flex flex-col items-center gap-2">
              <Logo type="icon" size="lg" className="neon-text" />
              <h1 className="text-2xl font-bold text-foreground">CHAMELEON</h1>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Sign In</h2>
              <p className="text-muted-foreground">
                Access your threat intelligence dashboard
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-transparent px-3 text-muted-foreground uppercase tracking-widest">
                  Secure Authentication
                </span>
              </div>
            </div>

            {/* Google rendered button container */}
            <div className="w-full space-y-3">
              {/* Loading skeleton shown while Google script loads */}
              {!googleReady && (
                <div className="w-full h-12 rounded-xl bg-white/5 border border-border animate-pulse flex items-center justify-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/10" />
                  <div className="h-4 w-40 rounded bg-white/10" />
                </div>
              )}

              {/* Google renders its button here — cross-browser compatible */}
              <div
                ref={googleBtnRef}
                className={`w-full flex justify-center transition-opacity duration-300 ${
                  googleReady ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
                }`}
              />

              {/* Loading overlay while authenticating */}
              {isLoading && (
                <div className="w-full flex items-center justify-center gap-3 py-3 text-muted-foreground text-sm">
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </div>
              )}
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30"
              >
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </motion.div>
            )}

            {/* Security note */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
              <Lock className="w-4 h-4 text-primary shrink-0" />
              <p className="text-xs text-muted-foreground">
                Your credentials are never stored. We use Google OAuth 2.0 for secure,
                passwordless authentication.
              </p>
            </div>

            {/* Status indicators */}
            <div className="grid grid-cols-3 gap-3">
              {["Auth Encrypted", "Zero Storage", "SOC Compliant"].map((label, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-black/30 border border-border"
                >
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs text-muted-foreground text-center leading-tight">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground/50 mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </motion.div>
      </div>

      
    </div>
  )
}