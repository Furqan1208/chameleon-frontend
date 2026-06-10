"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Bug, FlaskConical, Globe, GraduationCap, HeartHandshake, Shield, Lock, Github, Linkedin, Mail, Twitter } from "lucide-react"
import { Logo } from "@/components/ui/Logo"

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.55, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  )
}

const legalPoints = [
  {
    icon: Lock,
    title: "Controlled Environment",
    items: [
      "No internet connectivity during malware execution",
      "Isolated virtual machines for each analysis run",
      "Offline snapshots taken before samples are loaded",
      "No mechanism to export generated adversarial files from the lab",
    ],
  },
  {
    icon: Bug,
    title: "Responsible Disclosure",
    items: [
      "Findings are documented and shared with relevant vendors",
      "Disclosure timelines are respected before public release",
      "Zero-day material is not published without vendor notification",
    ],
  },
  {
    icon: FlaskConical,
    title: "Research-Only Purpose",
    items: [
      "Not intended for use against real systems without authorization",
      "Designed to improve detection, not weaponize malware",
      "All adversarial samples remain inside the isolated lab environment",
    ],
  },
  {
    icon: GraduationCap,
    title: "Educational Mission",
    items: [
      "Demonstrates AI applications in cybersecurity defense",
      "Supports study of adversarial machine learning",
      "Provides a foundation for future academic research",
    ],
  },
  {
    icon: Globe,
    title: "Data Sources & Attribution",
    items: [
      "EMBER 2024 dataset for benign and malicious vectors",
      "Vx-underground and MalwareBazaar for PE binaries",
      "Samples used only under standard research-use expectations",
    ],
  },
]

export default function EthicalUsePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,255,136,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.08) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
          animate={{ backgroundPosition: ["0px 0px", "48px 48px", "0px 0px"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute -left-40 top-0 h-[34rem] w-[34rem] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-32 top-32 h-[30rem] w-[30rem] rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[26rem] w-[26rem] rounded-full bg-accent/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 border-b border-border/80 bg-black/75 backdrop-blur-xl">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Logo type="icon" size="md" className="shrink-0" />
            <div>
              <p className="font-[var(--font-sora)] text-lg font-semibold tracking-wide">Chameleon</p>
              <p className="font-[var(--font-inter)] text-xs text-muted-foreground">Adaptive Malware Intelligence</p>
            </div>
          </Link>
          <div className="hidden items-center gap-6 lg:flex">
            <Link href="/#platform" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-foreground">Platform</Link>
            <Link href="/#blue-team" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-foreground">Features</Link>
            <Link href="/#architecture" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-foreground">Architecture</Link>
            <Link href="/#integrations" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-foreground">Threat Intelligence</Link>
            <Link href="/#research" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-foreground">Research</Link>
            <Link href="/docs" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-foreground">Documentation</Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="rounded-lg border border-border px-3 py-2 font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-foreground">Sign In</Link>
            <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-[var(--font-inter)] text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]">
              Launch Platform
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </nav>
      </header>

      <main className="relative z-10">
        <section className="border-b border-border/80 bg-gradient-to-b from-black to-background">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <Reveal>
              <div className="rounded-3xl border border-border/80 bg-card/50 p-6 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-8">
                <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-[var(--font-jetbrains-mono)] text-[11px] uppercase tracking-[0.18em] text-primary">
                  Ethical Use
                </p>
                <div className="mt-5 flex items-start gap-4">
                  <div className="rounded-2xl bg-primary/10 p-4">
                    <HeartHandshake className="h-12 w-12 text-primary" />
                  </div>
                  <div className="max-w-3xl">
                    <h1 className="font-[var(--font-sora)] text-4xl font-semibold sm:text-5xl">Ethical Use Policy</h1>
                    <p className="mt-3 font-[var(--font-inter)] text-lg text-muted-foreground">
                      Chameleon is intended for defensive security research, malware analysis education, and authorized testing in controlled environments.
                    </p>
                    <p className="mt-3 font-[var(--font-inter)] text-sm text-muted-foreground">
                      Last updated: {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-12">
          <Reveal>
            <div className="grid gap-4 md:grid-cols-2">
              {legalPoints.map((section, idx) => {
                const Icon = section.icon
                return (
                  <div key={section.title} className="rounded-3xl border border-border/80 bg-card/45 p-6 shadow-xl shadow-black/10 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-primary/10 p-3">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <h2 className="font-[var(--font-sora)] text-lg font-semibold">{section.title}</h2>
                    </div>
                    <ul className="mt-4 space-y-3">
                      {section.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 font-[var(--font-inter)] text-sm leading-relaxed text-muted-foreground">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="mt-8 rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent p-6 shadow-xl shadow-black/10">
              <div className="flex items-start gap-3">
                <Shield className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-[var(--font-sora)] text-lg font-semibold">Report Ethical Concerns</h3>
                  <p className="mt-2 font-[var(--font-inter)] text-sm text-muted-foreground">
                    If you believe Chameleon is being used unethically or discover a violation of this policy, report it immediately.
                  </p>
                  <a href="mailto:mfurqanpatel61@gmail.com" className="mt-3 inline-block font-[var(--font-inter)] text-sm text-primary hover:underline">
                    mfurqanpatel61@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-border/80 bg-black/70">
        <div className="mx-auto w-full max-w-7xl px-6 py-12">
          <div className="grid gap-10 md:grid-cols-4 lg:grid-cols-5">
            <div className="md:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-3">
                <Logo type="icon" size="sm" />
                <p className="font-[var(--font-sora)] text-xl font-semibold tracking-tight">Chameleon</p>
              </div>
              <p className="mt-4 max-w-sm font-[var(--font-inter)] text-sm leading-relaxed text-muted-foreground">
                AI-Powered Adaptive Malware Analysis Platform. Analyze, simulate, and detect evolving cyber threats with enterprise-grade intelligence.
              </p>
              <div className="mt-6 flex items-center gap-4">
                <a href="https://github.com/A-P-P-LE/ChameleonServer" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border/60 p-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"><Github className="h-4 w-4" /></a>
                <a href="https://twitter.com/NEDUETOfficial" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border/60 p-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"><Twitter className="h-4 w-4" /></a>
                <a href="https://www.linkedin.com/in/furqanpatel" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border/60 p-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"><Linkedin className="h-4 w-4" /></a>
                <a href="mailto:mfurqanpatel61@gmail.com" className="rounded-lg border border-border/60 p-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"><Mail className="h-4 w-4" /></a>
              </div>
            </div>
            <div>
              <h3 className="font-[var(--font-sora)] text-sm font-semibold uppercase tracking-wider">Platform</h3>
              <ul className="mt-4 space-y-3">
                <li><Link href="/dashboard/analysis" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-primary">Analysis Engine</Link></li>
                <li><Link href="/dashboard/threat-intelligence" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-primary">Threat Intelligence</Link></li>
                <li><Link href="/dashboard/red-team" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-primary">Red Team Module</Link></li>
                <li><Link href="/dashboard/api-docs" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-primary">API Access</Link></li>
                <li><Link href="/dashboard/integrations" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-primary">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-[var(--font-sora)] text-sm font-semibold uppercase tracking-wider">Research</h3>
              <ul className="mt-4 space-y-3">
                <li><Link href="/dashboard/analysis?tab=ml" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-primary">AI Classification</Link></li>
                <li><Link href="/dashboard/red-team" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-primary">Adversarial Testing</Link></li>
                <li><Link href="/dashboard/analysis" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-primary">Behavioral Analysis</Link></li>
                <li><Link href="/dashboard/frameworks/mitre" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-primary">MITRE ATT&CK</Link></li>
                <li><Link href="/dashboard/publications" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-primary">Publications</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-[var(--font-sora)] text-sm font-semibold uppercase tracking-wider">Company</h3>
              <ul className="mt-4 space-y-3">
                <li><Link href="/about" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-primary">About</Link></li>
                <li><Link href="/docs" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-primary">Documentation</Link></li>
                <li><Link href="/support" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-primary">Support</Link></li>
                <li><Link href="/contact" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-primary">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 sm:flex-row">
            <p className="font-[var(--font-inter)] text-xs text-muted-foreground">© {new Date().getFullYear()} Chameleon. All rights reserved. Built for research and defense.</p>
            <div className="flex gap-6">
              <Link href="/legal/privacy" className="font-[var(--font-inter)] text-xs text-muted-foreground transition-colors hover:text-primary">Privacy Policy</Link>
              <Link href="/legal/terms" className="font-[var(--font-inter)] text-xs text-muted-foreground transition-colors hover:text-primary">Terms of Service</Link>
              <Link href="/legal/ethical-use" className="font-[var(--font-inter)] text-xs text-primary transition-colors">Ethical Use</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
