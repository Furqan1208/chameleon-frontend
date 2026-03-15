"use client"

import { Sora, Inter, JetBrains_Mono } from "next/font/google"
import { Github, Twitter, Linkedin, Mail } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
    ArrowRight,
    Atom,
    Binary,
    Bot,
    Brain,
    Bug,
    CircuitBoard,
    Crosshair,
    Database,
    FileScan,
    FileText,
    FlaskConical,
    Globe,
    Laptop,
    Radar,
    Server,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
    Target,
    TriangleAlert,
    Upload,
    Workflow,
    Wrench,
    Zap,
} from "lucide-react"
import { Logo } from "@/components/ui/Logo"
import { APTThreatGlobe } from "@/components/landing/APTThreatGlobe"

const sora = Sora({ subsets: ["latin"], variable: "--font-sora" })
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" })

const navItems = [
    { label: "Platform", href: "#platform" },
    { label: "Features", href: "#blue-team" },
    { label: "Architecture", href: "#architecture" },
    { label: "Threat Intelligence", href: "#integrations" },
    { label: "Research", href: "#research" },
    { label: "Documentation", href: "#documentation" },
]

const platformFeatures = [
    {
        icon: FileScan,
        title: "Sandbox Analysis Engine",
        description: "Detonates suspicious binaries and scripts in a controlled CAPE-backed environment with rich telemetry output.",
    },
    {
        icon: Brain,
        title: "AI-Assisted Malware Intelligence",
        description: "Correlates behavior, execution traces, and indicators into analyst-grade conclusions and confidence estimates.",
    },
    {
        icon: Globe,
        title: "Threat Intelligence Correlation",
        description: "Cross-validates entities against external intelligence feeds to enrich malware context and attribution signals.",
    },
    {
        icon: Target,
        title: "Adversarial Evasion Testing",
        description: "Simulates evasive modifications and evaluates detector resilience through controlled red-team iterations.",
    },
    {
        icon: FileText,
        title: "SOC-Ready Threat Reports",
        description: "Generates structured reports with tactical findings, MITRE mappings, and mitigation guidance.",
    },
]

const pipelineSteps = [
    { icon: Upload, label: "File Upload" },
    { icon: FlaskConical, label: "Sandbox Execution" },
    { icon: Workflow, label: "Behavior Extraction" },
    { icon: Bot, label: "AI Analysis" },
    { icon: Radar, label: "Threat Intel Correlation" },
    { icon: Crosshair, label: "MITRE ATT&CK Mapping" },
    { icon: FileText, label: "SOC Report" },
]

const extractedBehaviors = [
    { label: "API Calls", value: "2,431 calls", color: "text-primary" },
    { label: "Registry Changes", value: "118 modifications", color: "text-secondary" },
    { label: "Network Traffic", value: "17 beacons", color: "text-accent" },
    { label: "File System Activity", value: "64 write ops", color: "text-primary" },
    { label: "Memory Artifacts", value: "12 injections", color: "text-secondary" },
]

const aiCapabilities = [
    {
        icon: Binary,
        title: "Behavior Classification",
        description: "Clusters execution events into interpretable behavioral signatures.",
    },
    {
        icon: Sparkles,
        title: "AI Threat Summaries",
        description: "Produces high-signal narratives for triage and incident handoff.",
    },
    {
        icon: Bug,
        title: "Malware Family Detection",
        description: "Detects likely family lineage through code and behavior fingerprints.",
    },
    {
        icon: ShieldAlert,
        title: "Obfuscation Detection",
        description: "Identifies packing, encoding, and anti-analysis techniques in real time.",
    },
    {
        icon: Zap,
        title: "Risk Scoring",
        description: "Computes confidence-weighted risk based on activity severity and context.",
    },
]

const redTeamCapabilities = [
    "AI-assisted payload mutation",
    "String obfuscation",
    "API call reordering",
    "Packing simulation",
    "Detection score testing",
]

const integrations = [
    "VirusTotal",
    "Hybrid Analysis",
    "AlienVault OTX",
    "MalwareBazaar",
    "ThreatFox",
    "AbuseIPDB",
    "URLhaus",
    "FileScan",
]

const workspacePanels = [
    "Malware Analysis Report",
    "Threat Intel Correlation",
    "MITRE ATT&CK Mapping",
    "AI Behavioral Analysis",
    "Detection Risk Score",
]

const useCases = [
    {
        title: "SOC Analysts",
        description: "Prioritize alerts using behavior-first intelligence and direct mitigation guidance.",
        icon: Shield,
    },
    {
        title: "Malware Researchers",
        description: "Inspect execution traces, uncover evasive logic, and accelerate reverse-engineering workflows.",
        icon: Atom,
    },
    {
        title: "Incident Responders",
        description: "Enrich live incidents with IOC context, ATT&CK techniques, and remediation-ready artifacts.",
        icon: TriangleAlert,
    },
    {
        title: "Threat Hunters",
        description: "Pivot from entities to campaigns using correlated infrastructure, behavior, and family signals.",
        icon: Radar,
    },
    {
        title: "Security Engineers",
        description: "Measure control efficacy with adaptive red-team simulations and detection feedback loops.",
        icon: Wrench,
    },
]

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

export default function LandingPage() {
    const router = useRouter()

    return (
        <div className={`${sora.variable} ${inter.variable} ${jetbrainsMono.variable} min-h-screen bg-background text-foreground`}>
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
                    <div className="flex items-center gap-3">
                        <Logo type="icon" size="md" className="shrink-0" />
                        <div>
                            <p className="font-[var(--font-sora)] text-lg font-semibold tracking-wide">Chameleon</p>
                            <p className="font-[var(--font-inter)] text-xs text-muted-foreground">Adaptive Malware Intelligence</p>
                        </div>
                    </div>

                    <div className="hidden items-center gap-6 lg:flex">
                        {navItems.map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            onClick={() => router.push("/login")}
                            className="rounded-lg border border-border px-3 py-2 font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => router.push("/dashboard/upload")}
                            className="hidden rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 font-[var(--font-inter)] text-sm text-primary transition-colors hover:bg-primary/20 sm:inline-flex"
                        >
                            Get Started
                        </button>
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 font-[var(--font-inter)] text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
                        >
                            Launch Platform
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </nav>
            </header>

            <main className="relative z-10">
                <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-24 pt-16 lg:grid-cols-[1.05fr_0.95fr]" id="platform">
                    <Reveal>
                        <div className="space-y-7">
                            <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 font-[var(--font-jetbrains-mono)] text-xs uppercase tracking-[0.18em] text-primary">
                                <CircuitBoard className="h-4 w-4" />
                                AI-Powered Adaptive Malware Analysis & Adversarial Intelligence Platform
                            </p>
                            <h1 className="font-[var(--font-sora)] text-4xl font-semibold leading-tight sm:text-6xl">
                                AI-Powered Malware Intelligence Platform
                            </h1>
                            <p className="max-w-2xl font-[var(--font-inter)] text-lg text-muted-foreground">
                                Analyze malware behavior, simulate adversarial evasion, and generate actionable threat intelligence with AI-assisted analysis.
                            </p>

                            <div className="grid gap-3 sm:grid-cols-3">
                                {[
                                    { title: "Blue Team Analysis", icon: ShieldCheck },
                                    { title: "Red Team Evasion", icon: Target },
                                    { title: "AI Threat Intelligence", icon: Brain },
                                ].map((pillar) => {
                                    const Icon = pillar.icon
                                    return (
                                        <div key={pillar.title} className="rounded-xl border border-border/80 bg-card/60 p-4">
                                            <Icon className="mb-3 h-5 w-5 text-primary" />
                                            <p className="font-[var(--font-inter)] text-sm font-medium">{pillar.title}</p>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <button
                                    onClick={() => router.push("/dashboard/upload")}
                                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-[var(--font-inter)] text-sm font-semibold text-primary-foreground"
                                >
                                    Launch Analysis
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => router.push("/dashboard/analysis")}
                                    className="rounded-lg border border-border px-6 py-3 font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    View Demo
                                </button>
                            </div>
                        </div>
                    </Reveal>

                    <Reveal delay={0.15}>
                        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-black/70 p-6 shadow-[0_0_90px_rgba(0,255,136,0.08)]">
                            <motion.div
                                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
                                animate={{ x: ["-100%", "100%"] }}
                                transition={{ duration: 3.4, repeat: Infinity, ease: "linear" }}
                            />
                            <div className="mb-5 flex items-center justify-between">
                                <p className="font-[var(--font-jetbrains-mono)] text-xs uppercase tracking-[0.2em] text-muted-foreground">Live Cyber Threat Intelligence</p>
                                <p className="font-[var(--font-jetbrains-mono)] text-xs text-primary">Auto-Refreshing Feed</p>
                            </div>

                            <APTThreatGlobe />
                        </div>
                    </Reveal>
                </section>

                <section className="mx-auto max-w-7xl px-6 pb-20" id="features">
                    <Reveal>
                        <h2 className="font-[var(--font-sora)] text-3xl font-semibold">Platform Overview</h2>
                        <p className="mt-3 max-w-4xl font-[var(--font-inter)] text-muted-foreground">
                            Chameleon is a next-generation malware analysis and adversarial intelligence platform designed to help defenders understand, simulate, and detect evolving cyber threats.
                        </p>
                    </Reveal>

                    <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {platformFeatures.map((feature, idx) => {
                            const Icon = feature.icon
                            return (
                                <Reveal key={feature.title} delay={idx * 0.07}>
                                    <div className="h-full rounded-xl border border-border/80 bg-card/60 p-5">
                                        <Icon className="mb-4 h-6 w-6 text-primary" />
                                        <h3 className="font-[var(--font-sora)] text-lg">{feature.title}</h3>
                                        <p className="mt-2 font-[var(--font-inter)] text-sm text-muted-foreground">{feature.description}</p>
                                    </div>
                                </Reveal>
                            )
                        })}
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-6 pb-20" id="blue-team">
                    <Reveal>
                        <h2 className="font-[var(--font-sora)] text-3xl font-semibold">Blue Team Analysis Engine</h2>
                        <p className="mt-3 font-[var(--font-inter)] text-muted-foreground">Behavioral pipeline designed for deterministic triage, explainable AI analysis, and operational SOC reporting.</p>
                    </Reveal>

                    <div className="mt-8 rounded-2xl border border-border/80 bg-card/50 p-5 lg:p-8">
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
                            {pipelineSteps.map((step, idx) => {
                                const Icon = step.icon
                                return (
                                    <motion.div
                                        key={step.label}
                                        initial={{ opacity: 0, y: 18 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.06, duration: 0.4 }}
                                        className="relative rounded-xl border border-border bg-black/60 p-4"
                                    >
                                        <Icon className="mb-3 h-5 w-5 text-primary" />
                                        <p className="font-[var(--font-jetbrains-mono)] text-xs text-muted-foreground">0{idx + 1}</p>
                                        <p className="mt-1 font-[var(--font-inter)] text-sm">{step.label}</p>
                                        {idx < pipelineSteps.length - 1 && (
                                            <ArrowRight className="absolute -right-2 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-primary/70 xl:block" />
                                        )}
                                    </motion.div>
                                )
                            })}
                        </div>

                        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                            {extractedBehaviors.map((item) => (
                                <div key={item.label} className="rounded-lg border border-border bg-black/60 p-4">
                                    <p className="font-[var(--font-inter)] text-xs text-muted-foreground">{item.label}</p>
                                    <p className={`mt-2 font-[var(--font-jetbrains-mono)] text-sm ${item.color}`}>{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mx-auto grid max-w-7xl gap-8 px-6 pb-20 lg:grid-cols-[1fr_0.95fr]" id="ai-intelligence">
                    <Reveal>
                        <h2 className="font-[var(--font-sora)] text-3xl font-semibold">AI Malware Intelligence</h2>
                        <p className="mt-3 max-w-3xl font-[var(--font-inter)] text-muted-foreground">AI models interpret malware behavior at scale, transforming noisy execution data into precision analyst outputs.</p>

                        <div className="mt-7 grid gap-3 sm:grid-cols-2">
                            {aiCapabilities.map((capability, idx) => {
                                const Icon = capability.icon
                                return (
                                    <Reveal key={capability.title} delay={idx * 0.06}>
                                        <div className="rounded-xl border border-border/80 bg-card/60 p-4">
                                            <Icon className="mb-3 h-5 w-5 text-primary" />
                                            <h3 className="font-[var(--font-sora)] text-base">{capability.title}</h3>
                                            <p className="mt-1 font-[var(--font-inter)] text-sm text-muted-foreground">{capability.description}</p>
                                        </div>
                                    </Reveal>
                                )
                            })}
                        </div>
                    </Reveal>

                    <Reveal delay={0.12}>
                        <div className="relative h-full min-h-80 overflow-hidden rounded-2xl border border-border/80 bg-black/65 p-6">
                            <p className="font-[var(--font-jetbrains-mono)] text-xs uppercase tracking-[0.2em] text-muted-foreground">AI Neural Analysis Grid</p>
                            <div className="relative mt-5 h-64 rounded-xl border border-border/70 bg-[#081017]">
                                {[15, 32, 49, 66, 83].map((x) => (
                                    <motion.div
                                        key={`n-${x}`}
                                        className="absolute h-3 w-3 rounded-full bg-primary"
                                        style={{ left: `${x}%`, top: `${20 + (x % 3) * 20}%` }}
                                        animate={{ boxShadow: ["0 0 0 rgba(0,255,136,0)", "0 0 18px rgba(0,255,136,0.85)", "0 0 0 rgba(0,255,136,0)"] }}
                                        transition={{ duration: 1.8 + x * 0.02, repeat: Infinity }}
                                    />
                                ))}
                                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                                    {["M15,20 L32,40 L49,20 L66,40 L83,20", "M15,60 L32,40 L49,60 L66,40 L83,60"].map((path) => (
                                        <motion.path
                                            key={path}
                                            d={path}
                                            fill="none"
                                            stroke="rgba(0,136,255,0.65)"
                                            strokeWidth="0.7"
                                            strokeDasharray="2 2"
                                            animate={{ pathLength: [0, 1, 0] }}
                                            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                                        />
                                    ))}
                                </svg>
                                <div className="absolute bottom-3 right-3 rounded-md border border-border bg-black/60 px-2 py-1 font-[var(--font-jetbrains-mono)] text-xs text-primary">
                                    Model Confidence 0.94
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </section>

                <section className="mx-auto grid max-w-7xl gap-8 px-6 pb-20 lg:grid-cols-[1fr_1fr]" id="red-team">
                    <Reveal>
                        <h2 className="font-[var(--font-sora)] text-3xl font-semibold">Red Team Evasion Engine</h2>
                        <p className="mt-3 font-[var(--font-inter)] text-muted-foreground">Adversarial simulation surfaces detector blind spots before attackers exploit them.</p>
                        <div className="mt-6 space-y-3">
                            {redTeamCapabilities.map((item, idx) => (
                                <motion.div
                                    key={item}
                                    initial={{ opacity: 0, x: -14 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.06, duration: 0.35 }}
                                    className="flex items-center gap-3 rounded-lg border border-border bg-card/50 px-4 py-3"
                                >
                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                    <p className="font-[var(--font-inter)] text-sm">{item}</p>
                                </motion.div>
                            ))}
                        </div>
                    </Reveal>

                    <Reveal delay={0.12}>
                        <div className="rounded-2xl border border-border/80 bg-card/50 p-6">
                            <p className="font-[var(--font-jetbrains-mono)] text-xs uppercase tracking-[0.2em] text-muted-foreground">Detection Evasion Simulation</p>
                            <div className="mt-6 space-y-5">
                                {[
                                    { phase: "Baseline Sample", score: 86, color: "bg-accent" },
                                    { phase: "Mutation Iteration 1", score: 63, color: "bg-secondary" },
                                    { phase: "Mutation Iteration 2", score: 41, color: "bg-primary" },
                                ].map((item, idx) => (
                                    <div key={item.phase}>
                                        <div className="mb-2 flex items-center justify-between font-[var(--font-inter)] text-sm">
                                            <span>{item.phase}</span>
                                            <span className="font-[var(--font-jetbrains-mono)] text-muted-foreground">{item.score}% detected</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-black/70">
                                            <motion.div
                                                className={`h-full rounded-full ${item.color}`}
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${item.score}%` }}
                                                viewport={{ once: true }}
                                                transition={{ delay: idx * 0.2, duration: 0.8 }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Reveal>
                </section>

                <section className="mx-auto max-w-7xl px-6 pb-20" id="feedback-loop">
                    <Reveal>
                        <h2 className="font-[var(--font-sora)] text-3xl font-semibold">AI vs AI Feedback Loop</h2>
                        <p className="mt-3 font-[var(--font-inter)] text-muted-foreground">Adaptive defense cycle where evasions continuously harden analysis and detection models.</p>
                    </Reveal>

                    <Reveal delay={0.08}>
                        <div className="mt-8 grid gap-4 rounded-2xl border border-border/80 bg-card/50 p-6 md:grid-cols-5 md:items-center">
                            {[
                                "Red Team",
                                "Mutated Malware",
                                "Blue Team Analysis",
                                "Detection Feedback",
                                "Improved Models",
                            ].map((item, idx) => (
                                <div key={item} className="relative">
                                    <div className="rounded-lg border border-border bg-black/60 p-4 text-center font-[var(--font-inter)] text-sm">{item}</div>
                                    {idx < 4 && <ArrowRight className="mx-auto mt-3 h-4 w-4 text-primary md:absolute md:-right-3 md:top-1/2 md:mt-0 md:-translate-y-1/2" />}
                                </div>
                            ))}
                        </div>
                    </Reveal>
                </section>

                <section className="mx-auto max-w-7xl px-6 pb-20" id="integrations">
                    <Reveal>
                        <h2 className="font-[var(--font-sora)] text-3xl font-semibold">Threat Intelligence Integrations</h2>
                        <p className="mt-3 font-[var(--font-inter)] text-muted-foreground">Chameleon enriches every analysis with global threat intelligence.</p>
                    </Reveal>

                    <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {integrations.map((integration, idx) => (
                            <Reveal key={integration} delay={idx * 0.05}>
                                <div className="rounded-xl border border-border bg-card/60 p-4">
                                    <p className="font-[var(--font-jetbrains-mono)] text-sm text-primary">{integration}</p>
                                    <p className="mt-2 font-[var(--font-inter)] text-xs text-muted-foreground">Intel feed connected for enrichment, IOC pivoting, and confidence scoring.</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-6 pb-20" id="workspace">
                    <Reveal>
                        <h2 className="font-[var(--font-sora)] text-3xl font-semibold">Analyst Workspace</h2>
                        <p className="mt-3 font-[var(--font-inter)] text-muted-foreground">Research-driven dashboard views for malware analysts, responders, and engineering teams.</p>
                    </Reveal>

                    <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                        {workspacePanels.map((panel, idx) => (
                            <Reveal key={panel} delay={idx * 0.05}>
                                <div className="group rounded-xl border border-border/90 bg-gradient-to-b from-card/80 to-black/70 p-4 transition-colors hover:border-primary/40">
                                    <div className="mb-4 h-28 rounded-md border border-border/80 bg-[#0b1117] p-3">
                                        <motion.div
                                            className="h-1.5 rounded bg-primary/80"
                                            initial={{ width: "15%" }}
                                            whileInView={{ width: "78%" }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.9 }}
                                        />
                                        <div className="mt-3 grid gap-1.5">
                                            {[0, 1, 2].map((line) => (
                                                <div key={line} className="h-1 rounded bg-white/10" />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="font-[var(--font-inter)] text-sm">{panel}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-6 pb-20" id="architecture">
                    <Reveal>
                        <h2 className="font-[var(--font-sora)] text-3xl font-semibold">Architecture</h2>
                        <p className="mt-3 font-[var(--font-inter)] text-muted-foreground">Enterprise pipeline engineered for reliable analysis throughput and intelligence-grade output.</p>
                    </Reveal>

                    <Reveal delay={0.06}>
                        <div className="mt-8 grid gap-4 rounded-2xl border border-border/80 bg-card/50 p-6 lg:grid-cols-4">
                            <div className="rounded-xl border border-border bg-black/60 p-4">
                                <Laptop className="mb-3 h-5 w-5 text-primary" />
                                <p className="font-[var(--font-sora)]">Frontend</p>
                                <p className="mt-1 font-[var(--font-inter)] text-sm text-muted-foreground">Next.js dashboard</p>
                            </div>
                            <div className="rounded-xl border border-border bg-black/60 p-4">
                                <Server className="mb-3 h-5 w-5 text-primary" />
                                <p className="font-[var(--font-sora)]">Backend</p>
                                <p className="mt-1 font-[var(--font-inter)] text-sm text-muted-foreground">FastAPI orchestration service</p>
                            </div>
                            <div className="rounded-xl border border-border bg-black/60 p-4">
                                <Workflow className="mb-3 h-5 w-5 text-primary" />
                                <p className="font-[var(--font-sora)]">Pipeline</p>
                                <p className="mt-1 font-[var(--font-inter)] text-sm text-muted-foreground">CAPE sandbox, parser engine, AI analysis service</p>
                            </div>
                            <div className="rounded-xl border border-border bg-black/60 p-4">
                                <Database className="mb-3 h-5 w-5 text-primary" />
                                <p className="font-[var(--font-sora)]">Data Layer</p>
                                <p className="mt-1 font-[var(--font-inter)] text-sm text-muted-foreground">MongoDB + threat intelligence APIs</p>
                            </div>
                        </div>
                    </Reveal>
                </section>

                <section className="mx-auto max-w-7xl px-6 pb-20" id="use-cases">
                    <Reveal>
                        <h2 className="font-[var(--font-sora)] text-3xl font-semibold">Use Cases</h2>
                    </Reveal>

                    <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                        {useCases.map((item, idx) => {
                            const Icon = item.icon
                            return (
                                <Reveal key={item.title} delay={idx * 0.05}>
                                    <div className="h-full rounded-xl border border-border bg-card/60 p-4">
                                        <Icon className="mb-3 h-5 w-5 text-primary" />
                                        <p className="font-[var(--font-sora)] text-base">{item.title}</p>
                                        <p className="mt-2 font-[var(--font-inter)] text-sm text-muted-foreground">{item.description}</p>
                                    </div>
                                </Reveal>
                            )
                        })}
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-6 pb-20" id="research">
                    <Reveal>
                        <h2 className="font-[var(--font-sora)] text-3xl font-semibold">Research and Innovation</h2>
                        <p className="mt-3 max-w-4xl font-[var(--font-inter)] text-muted-foreground">
                            Chameleon is built with a research-first mindset: AI-driven malware classification, adversarial AI testing, behavioral malware analysis, and threat intelligence fusion with MITRE ATT&CK mapping for operational relevance.
                        </p>
                    </Reveal>
                </section>

                <section className="mx-auto max-w-7xl px-6 pb-24" id="documentation">
                    <Reveal>
                        <div className="overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-r from-[#08130f] via-[#081018] to-[#150915] p-8 sm:p-10">
                            <h2 className="font-[var(--font-sora)] text-3xl font-semibold">Start analyzing malware with AI-assisted intelligence.</h2>
                            <p className="mt-3 max-w-3xl font-[var(--font-inter)] text-muted-foreground">Built for enterprise SOC teams, threat hunters, and malware researchers that require explainable, adaptive defense intelligence.</p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <button
                                    onClick={() => router.push("/dashboard")}
                                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-[var(--font-inter)] text-sm font-semibold text-primary-foreground"
                                >
                                    Launch Platform
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => router.push("/dashboard/reports")}
                                    className="rounded-lg border border-border px-6 py-3 font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    View Documentation
                                </button>
                            </div>
                        </div>
                    </Reveal>
                </section>
            </main>

            <footer className="border-t border-border/80 bg-black/70">
                <div className="mx-auto w-full max-w-7xl px-6 py-12">
                    {/* Main footer grid */}
                    <div className="grid gap-10 md:grid-cols-4 lg:grid-cols-5">
                        {/* Brand column - spans 2 columns on larger screens */}
                        <div className="md:col-span-2 lg:col-span-2">
                            <div className="flex items-center gap-3">
                                <Logo type="icon" size="sm" />
                                <p className="font-[var(--font-sora)] text-xl font-semibold tracking-tight">
                                    Chameleon
                                </p>
                            </div>
                            <p className="mt-4 max-w-sm font-[var(--font-inter)] text-sm leading-relaxed text-muted-foreground">
                                AI-Powered Adaptive Malware Analysis Platform. Analyze, simulate, and detect evolving cyber threats with enterprise-grade intelligence.
                            </p>

                            {/* Social links */}
                            <div className="mt-6 flex items-center gap-4">
                                {[
                                    { icon: Github, href: "#", label: "GitHub" },
                                    { icon: Twitter, href: "#", label: "Twitter" },
                                    { icon: Linkedin, href: "#", label: "LinkedIn" },
                                    { icon: Mail, href: "#", label: "Email" },
                                ].map((social) => {
                                    const Icon = social.icon
                                    return (
                                        <a
                                            key={social.label}
                                            href={social.href}
                                            className="rounded-lg border border-border/60 p-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                                            aria-label={social.label}
                                        >
                                            <Icon className="h-4 w-4" />
                                        </a>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Platform column */}
                        <div>
                            <h3 className="font-[var(--font-sora)] text-sm font-semibold uppercase tracking-wider text-foreground">
                                Platform
                            </h3>
                            <ul className="mt-4 space-y-3">
                                {[
                                    { label: "Analysis Engine", href: "#" },
                                    { label: "Threat Intelligence", href: "#" },
                                    { label: "Red Team Module", href: "#" },
                                    { label: "API Access", href: "#" },
                                    { label: "Integrations", href: "#" },
                                ].map((item) => (
                                    <li key={item.label}>
                                        <a
                                            href={item.href}
                                            className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-primary"
                                        >
                                            {item.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Research column */}
                        <div>
                            <h3 className="font-[var(--font-sora)] text-sm font-semibold uppercase tracking-wider text-foreground">
                                Research
                            </h3>
                            <ul className="mt-4 space-y-3">
                                {[
                                    { label: "AI Classification", href: "#" },
                                    { label: "Adversarial Testing", href: "#" },
                                    { label: "Behavioral Analysis", href: "#" },
                                    { label: "MITRE ATT&CK Mapping", href: "#" },
                                    { label: "Publications", href: "#" },
                                ].map((item) => (
                                    <li key={item.label}>
                                        <a
                                            href={item.label === "MITRE ATT&CK Mapping" ? "/dashboard/frameworks/mitre" : "#"}
                                            className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-primary"
                                        >
                                            {item.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Company column */}
                        <div>
                            <h3 className="font-[var(--font-sora)] text-sm font-semibold uppercase tracking-wider text-foreground">
                                Company
                            </h3>
                            <ul className="mt-4 space-y-3">
                                {[
                                    { label: "About", href: "#" },
                                    { label: "Documentation", href: "#" },
                                    { label: "Support", href: "#" },
                                    { label: "Contact", href: "#" },
                                ].map((item) => (
                                    <li key={item.label}>
                                        <a
                                            href={item.href}
                                            className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-primary"
                                        >
                                            {item.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Bottom bar with copyright and legal links */}
                    <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 sm:flex-row">
                        <p className="font-[var(--font-inter)] text-xs text-muted-foreground">
                            © {new Date().getFullYear()} Chameleon. All rights reserved. Built for research and defense.
                        </p>
                        <div className="flex gap-6">
                            {[
                                { label: "Privacy Policy", href: "#" },
                                { label: "Terms of Service", href: "#" },
                                { label: "Ethical Use", href: "#" },
                            ].map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className="font-[var(--font-inter)] text-xs text-muted-foreground transition-colors hover:text-primary"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>

            <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
      `}</style>
        </div>
    )
}
