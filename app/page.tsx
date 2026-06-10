"use client"

import { Sora, Inter, JetBrains_Mono } from "next/font/google"
import { Github, Twitter, Linkedin, Mail, Menu, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { useState, useEffect } from "react"
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
    { label: "Documentation", href: "/docs" },
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
    { icon: Radar, label: "Threat Intel" },
    { icon: Crosshair, label: "MITRE ATT&CK" },
    { icon: FileText, label: "SOC Report" },
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

const researchContributions = [
    {
        metric: "94.00%",
        label: "Evasion Rate",
        description: "WGAN-GP achieved against LightGBM oracle",
    },
    {
        metric: "SoftTree",
        label: "Novel Surrogate",
        description: "Differentiable tree approximation for gradient signal",
    },
    {
        metric: "5,004",
        label: "Stratified Samples",
        description: "Malicious + Elite Benign across 3 malware classes",
    },
    {
        metric: "M12",
        label: "Best Model",
        description: "Peak at Epoch 127 with finite stable losses",
    },
]

const redTeamCapabilities = [
    "WGAN-GP Adversarial Generation",
    "94% LightGBM Evasion Rate",
    "SoftTree Differentiable Surrogate",
    "Hierarchical Feature Gating",
    "EMBER 2024 Dataset Training",
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

// AI Research Grid - Responsive
function AIResearchGrid() {
    return (
        <div className="relative h-auto lg:h-full min-h-[400px] lg:min-h-[550px] overflow-hidden rounded-2xl border border-border/80 bg-black/65 p-4 sm:p-6">
            <p className="font-[var(--font-jetbrains-mono)] text-xs uppercase tracking-[0.2em] text-muted-foreground">Adversarial Research Pipeline</p>
            <div className="relative mt-4 h-[300px] sm:h-[350px] lg:h-[420px] rounded-xl border border-border/70 bg-[#081017] overflow-hidden">
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {["M15,30 L35,50 L55,30 L75,50 L90,30", "M15,70 L35,50 L55,70 L75,50 L90,70"].map((path, i) => (
                        <motion.path
                            key={path}
                            d={path}
                            fill="none"
                            stroke={`rgba(0,${136 + i * 40},255,${0.4 + i * 0.2})`}
                            strokeWidth="0.7"
                            strokeDasharray="3 3"
                            animate={{ strokeDashoffset: [0, 20] }}
                            transition={{ duration: 3 + i, repeat: Infinity, ease: "linear" }}
                        />
                    ))}
                </svg>
                
                {[
                    { x: 15, y: 30, label: "GAN", delay: 0 },
                    { x: 35, y: 50, label: "Critic", delay: 0.2 },
                    { x: 55, y: 30, label: "Generator", delay: 0.4 },
                    { x: 75, y: 50, label: "SoftTree", delay: 0.6 },
                    { x: 90, y: 30, label: "Evasion", delay: 0.8 },
                ].map((node, idx) => (
                    <motion.div
                        key={node.label}
                        className="absolute"
                        style={{ left: `${node.x}%`, top: `${node.y}%` }}
                        animate={{ 
                            scale: [1, 1.3, 1],
                            boxShadow: ["0 0 0 rgba(0,255,136,0)", "0 0 12px rgba(0,255,136,0.8)", "0 0 0 rgba(0,255,136,0)"]
                        }}
                        transition={{ duration: 1.5 + idx * 0.3, repeat: Infinity, delay: node.delay }}
                    >
                        <div className="relative">
                            <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-primary" />
                            <span className="absolute -top-5 left-3 font-[var(--font-jetbrains-mono)] text-[7px] sm:text-[8px] text-primary/70 whitespace-nowrap">
                                {node.label}
                            </span>
                        </div>
                    </motion.div>
                ))}
                
                <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 rounded-md border border-border bg-black/80 px-1.5 py-0.5 sm:px-2 sm:py-1 font-[var(--font-jetbrains-mono)] text-[8px] sm:text-[10px] text-primary">
                    <span className="text-primary/50">Best Evasion</span> 94.00%
                </div>
                <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 sm:px-2 sm:py-1 font-[var(--font-jetbrains-mono)] text-[8px] sm:text-[10px] text-amber-500">
                    SoftTree Enabled
                </div>
            </div>
        </div>
    )
}

// WGAN-GP Model Progression - Responsive
function WGANModelProgression() {
    return (
        <div className="rounded-2xl border border-border/80 bg-card/50 p-4 sm:p-6 h-full flex flex-col">
            <p className="font-[var(--font-jetbrains-mono)] text-xs uppercase tracking-[0.2em] text-muted-foreground">WGAN-GP Model Progression</p>
            
            <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6 flex-1">
                <div>
                    <div className="mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 font-[var(--font-inter)] text-xs sm:text-sm">
                        <span>Model 3 (Baseline)</span>
                        <span className="font-[var(--font-jetbrains-mono)] text-muted-foreground">93.91% evasion</span>
                    </div>
                    <div className="h-1.5 sm:h-2 rounded-full bg-black/70">
                        <motion.div
                            className="h-full rounded-full bg-accent"
                            initial={{ width: 0 }}
                            whileInView={{ width: "93.91%" }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1, duration: 0.8 }}
                        />
                    </div>
                </div>
                
                <div>
                    <div className="mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 font-[var(--font-inter)] text-xs sm:text-sm">
                        <span>Model 5 (M11) - No SoftTree</span>
                        <span className="font-[var(--font-jetbrains-mono)] text-muted-foreground">31.20% evasion</span>
                    </div>
                    <div className="h-1.5 sm:h-2 rounded-full bg-black/70">
                        <motion.div
                            className="h-full rounded-full bg-secondary"
                            initial={{ width: 0 }}
                            whileInView={{ width: "31.20%" }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                        />
                    </div>
                </div>
                
                <div>
                    <div className="mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 font-[var(--font-inter)] text-xs sm:text-sm">
                        <span>Model 6 (M12) - SoftTree + Gate Entropy</span>
                        <span className="font-[var(--font-jetbrains-mono)] text-green-500">94.00% evasion</span>
                    </div>
                    <div className="h-1.5 sm:h-2 rounded-full bg-black/70">
                        <motion.div
                            className="h-full rounded-full bg-primary"
                            initial={{ width: 0 }}
                            whileInView={{ width: "94.00%" }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                        />
                    </div>
                </div>
            </div>
            
            <div className="mt-4 sm:mt-6 rounded-lg border border-primary/20 bg-primary/5 p-3 sm:p-4">
                <p className="font-[var(--font-jetbrains-mono)] text-[9px] sm:text-[10px] text-primary/70">Phase Transition</p>
                <p className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
                    SoftTree gradient caused jump from <span className="text-secondary font-bold">31.8%</span> → <span className="text-primary font-bold">83.2%</span> over two epochs
                </p>
                <div className="mt-2 sm:mt-3 h-0.5 sm:h-1 w-full rounded-full bg-black/70 overflow-hidden">
                    <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-secondary via-primary to-primary"
                        initial={{ width: "31.8%" }}
                        whileInView={{ width: "83.2%" }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6, duration: 1.2 }}
                    />
                </div>
            </div>
            
            <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-1.5 sm:gap-2">
                <div className="rounded-lg border border-border/40 bg-black/30 p-1.5 sm:p-2 text-center">
                    <p className="font-[var(--font-jetbrains-mono)] text-[8px] sm:text-[9px] text-muted-foreground">Generator</p>
                    <p className="font-[var(--font-inter)] text-[8px] sm:text-[10px] text-primary/70">128-dim + 2,568-dim</p>
                </div>
                <div className="rounded-lg border border-border/40 bg-black/30 p-1.5 sm:p-2 text-center">
                    <p className="font-[var(--font-jetbrains-mono)] text-[8px] sm:text-[9px] text-muted-foreground">Critic</p>
                    <p className="font-[var(--font-inter)] text-[8px] sm:text-[10px] text-primary/70">5-layer spectral-norm</p>
                </div>
            </div>
        </div>
    )
}

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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <div className={`${sora.variable} ${inter.variable} ${jetbrainsMono.variable} min-h-screen bg-background text-foreground`}>
            {/* Background Grid - Responsive */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <motion.div
                    className="absolute inset-0 opacity-25 sm:opacity-35"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(0,255,136,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.08) 1px, transparent 1px)",
                        backgroundSize: "32px 32px",
                    }}
                    animate={{ backgroundPosition: ["0px 0px", "32px 32px", "0px 0px"] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute -left-40 top-0 h-[34rem] w-[34rem] rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -right-32 top-32 h-[30rem] w-[30rem] rounded-full bg-secondary/10 blur-3xl" />
                <div className="absolute bottom-0 left-1/3 h-[26rem] w-[26rem] rounded-full bg-accent/10 blur-3xl" />
            </div>

            {/* Header / Navbar - Responsive */}
            <header className="sticky top-0 z-50 border-b border-border/80 bg-black/75 backdrop-blur-xl">
                <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
                    <Link href="/" className="flex items-center gap-2 sm:gap-3">
                        <Logo type="icon" size="sm" className="shrink-0" />
                        <div className="hidden sm:block">
                            <p className="font-[var(--font-sora)] text-base sm:text-lg font-semibold tracking-wide">Chameleon</p>
                            <p className="font-[var(--font-inter)] text-[10px] sm:text-xs text-muted-foreground">Adaptive Malware Intelligence</p>
                        </div>
                        <div className="block sm:hidden">
                            <p className="font-[var(--font-sora)] text-base font-semibold tracking-wide">Chameleon</p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-6">
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

                    {/* Desktop Buttons */}
                    <div className="hidden sm:flex items-center gap-2 sm:gap-3">
                        <button
                            onClick={() => router.push("/login")}
                            className="rounded-lg border border-border px-2.5 sm:px-3 py-1.5 sm:py-2 font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg bg-primary px-3 sm:px-4 py-1.5 sm:py-2 font-[var(--font-inter)] text-xs sm:text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
                        >
                            Launch Platform
                            <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground"
                    >
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </nav>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden border-t border-border/80 bg-black/95 backdrop-blur-xl p-4">
                        <div className="flex flex-col gap-3">
                            {navItems.map((item) => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-foreground py-2"
                                >
                                    {item.label}
                                </a>
                            ))}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => router.push("/login")}
                                    className="flex-1 rounded-lg border border-border px-3 py-2 font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => router.push("/dashboard")}
                                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 font-[var(--font-inter)] text-sm font-semibold text-primary-foreground"
                                >
                                    Launch
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            <main className="relative z-10">
                {/* Hero Section - Responsive */}
                <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 sm:pb-24 pt-12 sm:pt-16" id="platform">
                    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
                        <Reveal>
                            <div className="space-y-4 sm:space-y-7">
                                <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 sm:px-4 py-1.5 sm:py-2 font-[var(--font-jetbrains-mono)] text-[10px] sm:text-xs uppercase tracking-[0.18em] text-primary">
                                    <CircuitBoard className="h-3 w-3 sm:h-4 sm:w-4" />
                                    AI-Powered Adaptive Malware Analysis
                                </p>
                                <h1 className="font-[var(--font-sora)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight">
                                    AI-Powered Malware Intelligence Platform
                                </h1>
                                <p className="max-w-2xl font-[var(--font-inter)] text-base sm:text-lg text-muted-foreground">
                                    Analyze malware behavior, simulate adversarial evasion, and generate actionable threat intelligence with AI-assisted analysis.
                                </p>

                                <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-3">
                                    {[
                                        { title: "Blue Team Analysis", icon: ShieldCheck },
                                        { title: "Red Team Evasion", icon: Target },
                                        { title: "AI Threat Intelligence", icon: Brain },
                                    ].map((pillar) => {
                                        const Icon = pillar.icon
                                        return (
                                            <div key={pillar.title} className="rounded-xl border border-border/80 bg-card/60 p-3 sm:p-4">
                                                <Icon className="mb-2 sm:mb-3 h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                                <p className="font-[var(--font-inter)] text-xs sm:text-sm font-medium">{pillar.title}</p>
                                            </div>
                                        )
                                    })}
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <button
                                        onClick={() => router.push("/dashboard")}
                                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 sm:px-6 py-2.5 sm:py-3 font-[var(--font-inter)] text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
                                    >
                                        Launch Analysis
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => router.push("/dashboard/analysis")}
                                        className="rounded-lg border border-border px-4 sm:px-6 py-2.5 sm:py-3 font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        View Demo
                                    </button>
                                </div>
                            </div>
                        </Reveal>

                        <Reveal delay={0.15}>
                            <APTThreatGlobe />
                        </Reveal>
                    </div>
                </section>

                {/* Platform Overview - Responsive */}
                <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 sm:pb-20" id="features">
                    <Reveal>
                        <h2 className="font-[var(--font-sora)] text-2xl sm:text-3xl font-semibold">Platform Overview</h2>
                        <p className="mt-2 sm:mt-3 font-[var(--font-inter)] text-sm sm:text-base text-muted-foreground">
                            Chameleon is a next-generation malware analysis and adversarial intelligence platform designed to help defenders understand, simulate, and detect evolving cyber threats.
                        </p>
                    </Reveal>

                    <div className="mt-6 sm:mt-8 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {platformFeatures.map((feature, idx) => {
                            const Icon = feature.icon
                            return (
                                <Reveal key={feature.title} delay={idx * 0.07}>
                                    <div className="h-full rounded-xl border border-border/80 bg-card/60 p-4 sm:p-5">
                                        <Icon className="mb-3 sm:mb-4 h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                                        <h3 className="font-[var(--font-sora)] text-base sm:text-lg">{feature.title}</h3>
                                        <p className="mt-1 sm:mt-2 font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground">{feature.description}</p>
                                    </div>
                                </Reveal>
                            )
                        })}
                    </div>
                </section>

                {/* Blue Team Pipeline - Responsive */}
                <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 sm:pb-20" id="blue-team">
                    <Reveal>
                        <h2 className="font-[var(--font-sora)] text-2xl sm:text-3xl font-semibold">Blue Team Analysis Engine</h2>
                        <p className="mt-2 sm:mt-3 font-[var(--font-inter)] text-sm sm:text-base text-muted-foreground">Behavioral pipeline designed for deterministic triage, explainable AI analysis, and operational SOC reporting.</p>
                    </Reveal>

                    <div className="mt-6 sm:mt-8 rounded-2xl border border-border/80 bg-card/50 p-4 sm:p-5 lg:p-8">
                        <div className="grid gap-2 sm:gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
                            {pipelineSteps.map((step, idx) => {
                                const Icon = step.icon
                                return (
                                    <motion.div
                                        key={step.label}
                                        initial={{ opacity: 0, y: 18 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.06, duration: 0.4 }}
                                        className="relative rounded-xl border border-border bg-black/60 p-3 sm:p-4"
                                    >
                                        <Icon className="mb-2 sm:mb-3 h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                        <p className="font-[var(--font-jetbrains-mono)] text-[8px] sm:text-xs text-muted-foreground">0{idx + 1}</p>
                                        <p className="mt-1 font-[var(--font-inter)] text-[10px] sm:text-sm">{step.label}</p>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </div>
                </section>

                {/* AI Malware Intelligence - Responsive */}
                <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 sm:pb-20" id="ai-intelligence">
                    <div className="grid gap-8 lg:grid-cols-2">
                        <Reveal>
                            <div>
                                <h2 className="font-[var(--font-sora)] text-2xl sm:text-3xl font-semibold">AI Malware Intelligence</h2>
                                <p className="mt-2 sm:mt-3 font-[var(--font-inter)] text-sm sm:text-base text-muted-foreground">AI models interpret malware behavior at scale, transforming noisy execution data into precision analyst outputs.</p>

                                <div className="mt-6 sm:mt-7 grid gap-3 grid-cols-1 sm:grid-cols-2">
                                    {aiCapabilities.map((capability, idx) => {
                                        const Icon = capability.icon
                                        return (
                                            <Reveal key={capability.title} delay={idx * 0.06}>
                                                <div className="rounded-xl border border-border/80 bg-card/60 p-3 sm:p-4">
                                                    <Icon className="mb-2 sm:mb-3 h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                                    <h3 className="font-[var(--font-sora)] text-sm sm:text-base">{capability.title}</h3>
                                                    <p className="mt-1 font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground">{capability.description}</p>
                                                </div>
                                            </Reveal>
                                        )
                                    })}
                                </div>
                            </div>
                        </Reveal>

                        <Reveal delay={0.12}>
                            <AIResearchGrid />
                        </Reveal>
                    </div>
                </section>

                {/* Red Team Research - Responsive */}
                <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 sm:pb-20" id="red-team">
                    <div className="grid gap-8 lg:grid-cols-2">
                        <Reveal>
                            <div>
                                <h2 className="font-[var(--font-sora)] text-2xl sm:text-3xl font-semibold">Red Team Research</h2>
                                <p className="mt-2 sm:mt-3 font-[var(--font-inter)] text-sm sm:text-base text-muted-foreground">WGAN-GP based adversarial malware generation achieving 94% evasion against LightGBM classifiers.</p>
                                
                                <div className="mt-5 sm:mt-6 space-y-2 sm:space-y-3">
                                    {redTeamCapabilities.map((item, idx) => (
                                        <motion.div
                                            key={item}
                                            initial={{ opacity: 0, x: -14 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: idx * 0.06, duration: 0.35 }}
                                            className="flex items-center gap-2 sm:gap-3 rounded-lg border border-border bg-card/50 px-3 sm:px-4 py-2 sm:py-3"
                                        >
                                            <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary" />
                                            <p className="font-[var(--font-inter)] text-xs sm:text-sm">{item}</p>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="mt-5 sm:mt-6 grid grid-cols-2 gap-2 sm:gap-3">
                                    {researchContributions.map((item, idx) => (
                                        <div key={item.label} className="rounded-lg border border-border/60 bg-black/40 p-2 sm:p-3 text-center">
                                            <p className="font-[var(--font-sora)] text-base sm:text-xl font-bold text-primary">{item.metric}</p>
                                            <p className="font-[var(--font-jetbrains-mono)] text-[8px] sm:text-[10px] text-muted-foreground">{item.label}</p>
                                            <p className="font-[var(--font-inter)] text-[8px] sm:text-[10px] text-primary/70 mt-0.5 sm:mt-1">{item.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Reveal>

                        <Reveal delay={0.12}>
                            <WGANModelProgression />
                        </Reveal>
                    </div>
                </section>

                {/* Feedback Loop - Responsive */}
                <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 sm:pb-20" id="feedback-loop">
                    <Reveal>
                        <h2 className="font-[var(--font-sora)] text-2xl sm:text-3xl font-semibold">AI vs AI Research Pipeline</h2>
                        <p className="mt-2 sm:mt-3 font-[var(--font-inter)] text-sm sm:text-base text-muted-foreground">Adaptive research cycle where evasions inform detection improvements.</p>
                    </Reveal>

                    <Reveal delay={0.08}>
                        <div className="mt-6 sm:mt-8 grid gap-3 sm:gap-4 rounded-2xl border border-border/80 bg-card/50 p-4 sm:p-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
                            {[
                                "Red Team GAN",
                                "Adversarial Features",
                                "Blue Team Analysis",
                                "Evasion Metrics",
                                "Model Refinement",
                            ].map((item, idx) => (
                                <div key={item} className="relative">
                                    <div className="rounded-lg border border-border bg-black/60 p-2 sm:p-3 text-center font-[var(--font-inter)] text-[10px] sm:text-sm">{item}</div>
                                    {idx < 4 && <ArrowRight className="hidden md:block absolute -right-3 top-1/2 h-3 w-3 sm:h-4 sm:w-4 -translate-y-1/2 text-primary/70" />}
                                </div>
                            ))}
                        </div>
                    </Reveal>
                </section>

                {/* Threat Intelligence Integrations - Responsive */}
                <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 sm:pb-20" id="integrations">
                    <Reveal>
                        <h2 className="font-[var(--font-sora)] text-2xl sm:text-3xl font-semibold">Threat Intelligence Integrations</h2>
                        <p className="mt-2 sm:mt-3 font-[var(--font-inter)] text-sm sm:text-base text-muted-foreground">Chameleon enriches every analysis with global threat intelligence.</p>
                    </Reveal>

                    <div className="mt-6 sm:mt-7 grid gap-2 sm:gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                        {integrations.map((integration, idx) => (
                            <Reveal key={integration} delay={idx * 0.05}>
                                <div className="rounded-xl border border-border bg-card/60 p-3 sm:p-4">
                                    <p className="font-[var(--font-jetbrains-mono)] text-xs sm:text-sm text-primary">{integration}</p>
                                    <p className="mt-1 sm:mt-2 font-[var(--font-inter)] text-[10px] sm:text-xs text-muted-foreground">Intel feed connected</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </section>

                {/* Analyst Workspace - Responsive */}
                <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 sm:pb-20" id="workspace">
                    <Reveal>
                        <h2 className="font-[var(--font-sora)] text-2xl sm:text-3xl font-semibold">Analyst Workspace</h2>
                        <p className="mt-2 sm:mt-3 font-[var(--font-inter)] text-sm sm:text-base text-muted-foreground">Research-driven dashboard views for malware analysts and security teams.</p>
                    </Reveal>

                    <div className="mt-6 sm:mt-8 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        {workspacePanels.map((panel, idx) => (
                            <Reveal key={panel} delay={idx * 0.05}>
                                <div className="group rounded-xl border border-border/90 bg-gradient-to-b from-card/80 to-black/70 p-3 sm:p-4 transition-colors hover:border-primary/40">
                                    <div className="mb-3 sm:mb-4 h-20 sm:h-28 rounded-md border border-border/80 bg-[#0b1117] p-2 sm:p-3">
                                        <motion.div
                                            className="h-1 sm:h-1.5 rounded bg-primary/80"
                                            initial={{ width: "15%" }}
                                            whileInView={{ width: "78%" }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.9 }}
                                        />
                                        <div className="mt-2 sm:mt-3 grid gap-1">
                                            {[0, 1, 2].map((line) => (
                                                <div key={line} className="h-0.5 sm:h-1 rounded bg-white/10" />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="font-[var(--font-inter)] text-xs sm:text-sm">{panel}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </section>

                {/* Architecture - Responsive */}
                <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 sm:pb-20" id="architecture">
                    <Reveal>
                        <h2 className="font-[var(--font-sora)] text-2xl sm:text-3xl font-semibold">Architecture</h2>
                        <p className="mt-2 sm:mt-3 font-[var(--font-inter)] text-sm sm:text-base text-muted-foreground">Enterprise pipeline engineered for reliable analysis throughput and intelligence-grade output.</p>
                    </Reveal>

                    <Reveal delay={0.06}>
                        <div className="mt-6 sm:mt-8 grid gap-3 sm:gap-4 rounded-2xl border border-border/80 bg-card/50 p-4 sm:p-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-xl border border-border bg-black/60 p-3 sm:p-4">
                                <Laptop className="mb-2 sm:mb-3 h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                <p className="font-[var(--font-sora)] text-sm sm:text-base">Frontend</p>
                                <p className="mt-1 font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground">Next.js dashboard</p>
                            </div>
                            <div className="rounded-xl border border-border bg-black/60 p-3 sm:p-4">
                                <Server className="mb-2 sm:mb-3 h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                <p className="font-[var(--font-sora)] text-sm sm:text-base">Backend</p>
                                <p className="mt-1 font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground">FastAPI orchestration</p>
                            </div>
                            <div className="rounded-xl border border-border bg-black/60 p-3 sm:p-4">
                                <Workflow className="mb-2 sm:mb-3 h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                <p className="font-[var(--font-sora)] text-sm sm:text-base">Pipeline</p>
                                <p className="mt-1 font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground">CAPE + Parser + AI</p>
                            </div>
                            <div className="rounded-xl border border-border bg-black/60 p-3 sm:p-4">
                                <Database className="mb-2 sm:mb-3 h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                <p className="font-[var(--font-sora)] text-sm sm:text-base">Data Layer</p>
                                <p className="mt-1 font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground">MongoDB + Intel APIs</p>
                            </div>
                        </div>
                    </Reveal>
                </section>

                {/* Use Cases - Responsive */}
                <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 sm:pb-20" id="use-cases">
                    <Reveal>
                        <h2 className="font-[var(--font-sora)] text-2xl sm:text-3xl font-semibold">Use Cases</h2>
                    </Reveal>

                    <div className="mt-6 sm:mt-8 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        {useCases.map((item, idx) => {
                            const Icon = item.icon
                            return (
                                <Reveal key={item.title} delay={idx * 0.05}>
                                    <div className="h-full rounded-xl border border-border bg-card/60 p-3 sm:p-4">
                                        <Icon className="mb-2 sm:mb-3 h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                        <p className="font-[var(--font-sora)] text-sm sm:text-base">{item.title}</p>
                                        <p className="mt-1 sm:mt-2 font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground">{item.description}</p>
                                    </div>
                                </Reveal>
                            )
                        })}
                    </div>
                </section>

                {/* Research Section - Responsive */}
                <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 sm:pb-20" id="research">
                    <Reveal>
                        <h2 className="font-[var(--font-sora)] text-2xl sm:text-3xl font-semibold">Research Contributions</h2>
                        <p className="mt-2 sm:mt-3 font-[var(--font-inter)] text-sm sm:text-base text-muted-foreground">
                            Chameleon contributes novel research in adversarial machine learning: WGAN-GP with SoftTree surrogate achieving 94% evasion against LightGBM, stratified dataset construction across PSW/Ransomware/Downloader classes, and hierarchical feature gating for structured mutations.
                        </p>
                    </Reveal>
                </section>

                {/* CTA Section - Responsive */}
                <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 sm:pb-24" id="documentation">
                    <Reveal>
                        <div className="overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-r from-[#08130f] via-[#081018] to-[#150915] p-6 sm:p-8 lg:p-10">
                            <h2 className="font-[var(--font-sora)] text-2xl sm:text-3xl font-semibold">Start analyzing malware with AI-assisted intelligence.</h2>
                            <p className="mt-2 sm:mt-3 max-w-3xl font-[var(--font-inter)] text-sm sm:text-base text-muted-foreground">Built for enterprise SOC teams, threat hunters, and malware researchers that require explainable, adaptive defense intelligence.</p>
                            <div className="mt-5 sm:mt-6 flex flex-wrap gap-3">
                                <button
                                    onClick={() => router.push("/dashboard")}
                                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 sm:px-6 py-2.5 sm:py-3 font-[var(--font-inter)] text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
                                >
                                    Launch Platform
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => router.push("/docs")}
                                    className="rounded-lg border border-border px-4 sm:px-6 py-2.5 sm:py-3 font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    Read Documentation
                                </button>
                            </div>
                        </div>
                    </Reveal>
                </section>
            </main>

            {/* Footer - Responsive */}
            <footer className="border-t border-border/80 bg-black/70">
                <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
                    <div className="grid gap-8 sm:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
                        <div className="sm:col-span-2">
                            <div className="flex items-center gap-3">
                                <Logo type="icon" size="sm" />
                                <p className="font-[var(--font-sora)] text-lg sm:text-xl font-semibold tracking-tight">Chameleon</p>
                            </div>
                            <p className="mt-3 sm:mt-4 max-w-sm font-[var(--font-inter)] text-xs sm:text-sm leading-relaxed text-muted-foreground">
                                AI-Powered Adaptive Malware Analysis Platform. Analyze, simulate, and detect evolving cyber threats with enterprise-grade intelligence.
                            </p>

                            <div className="mt-5 sm:mt-6 flex items-center gap-3 sm:gap-4">
                                <a href="https://github.com/A-P-P-LE/ChameleonServer" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border/60 p-1.5 sm:p-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
                                    <Github className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </a>
                                <a href="https://twitter.com/NEDUETOfficial" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border/60 p-1.5 sm:p-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
                                    <Twitter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </a>
                                <a href="https://www.linkedin.com/in/furqanpatel" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border/60 p-1.5 sm:p-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
                                    <Linkedin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </a>
                                <a href="mailto:mfurqanpatel61@gmail.com" className="rounded-lg border border-border/60 p-1.5 sm:p-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
                                    <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </a>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-[var(--font-sora)] text-xs sm:text-sm font-semibold uppercase tracking-wider">Platform</h3>
                            <ul className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                                <li><a href="/dashboard/analysis" className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground transition-colors hover:text-primary">Analysis Engine</a></li>
                                <li><a href="/dashboard/threat-intelligence" className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground transition-colors hover:text-primary">Threat Intelligence</a></li>
                                <li><a href="/dashboard/red-team" className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground transition-colors hover:text-primary">Red Team Module</a></li>
                                <li><a href="/dashboard/api-docs" className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground transition-colors hover:text-primary">API Access</a></li>
                                <li><a href="/dashboard/integrations" className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground transition-colors hover:text-primary">Integrations</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-[var(--font-sora)] text-xs sm:text-sm font-semibold uppercase tracking-wider">Research</h3>
                            <ul className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                                <li><a href="/dashboard/analysis?tab=ml" className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground transition-colors hover:text-primary">AI Classification</a></li>
                                <li><a href="/dashboard/red-team" className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground transition-colors hover:text-primary">Adversarial Testing</a></li>
                                <li><a href="/dashboard/analysis" className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground transition-colors hover:text-primary">Behavioral Analysis</a></li>
                                <li><a href="/dashboard/frameworks/mitre" className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground transition-colors hover:text-primary">MITRE ATT&CK</a></li>
                                <li><a href="/dashboard/publications" className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground transition-colors hover:text-primary">Publications</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-[var(--font-sora)] text-xs sm:text-sm font-semibold uppercase tracking-wider">Company</h3>
                            <ul className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                                <li><a href="/about" className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground transition-colors hover:text-primary">About</a></li>
                                <li><a href="/docs" className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground transition-colors hover:text-primary">Documentation</a></li>
                                <li><a href="/support" className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground transition-colors hover:text-primary">Support</a></li>
                                <li><a href="/contact" className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground transition-colors hover:text-primary">Contact</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-8 sm:mt-12 flex flex-col items-center justify-between gap-3 sm:gap-4 border-t border-border/60 pt-6 sm:pt-8 sm:flex-row">
                        <p className="font-[var(--font-inter)] text-[10px] sm:text-xs text-muted-foreground">
                            © {new Date().getFullYear()} Chameleon. All rights reserved. Built for research and defense.
                        </p>
                        <div className="flex gap-4 sm:gap-6">
                            <a href="/legal/privacy" className="font-[var(--font-inter)] text-[10px] sm:text-xs text-muted-foreground transition-colors hover:text-primary">Privacy Policy</a>
                            <a href="/legal/terms" className="font-[var(--font-inter)] text-[10px] sm:text-xs text-muted-foreground transition-colors hover:text-primary">Terms of Service</a>
                            <a href="/legal/ethical-use" className="font-[var(--font-inter)] text-[10px] sm:text-xs text-muted-foreground transition-colors hover:text-primary">Ethical Use</a>
                        </div>
                    </div>
                </div>
            </footer>

            <style>{`
                html {
                    scroll-behavior: smooth;
                }
            `}</style>
        </div>
    )
}